const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = sessionStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("Session expired. Please log in again.");
  }

  // Multiple simultaneous 401 errors should trigger
  // only one refresh request.
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/token/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        }
      );

      if (!response.ok) {
        throw new Error("Session expired. Please log in again.");
      }

      const data = await response.json();

      if (!data.access) {
        throw new Error("No access token received.");
      }

      sessionStorage.setItem("access", data.access);

      if (data.refresh) {
        sessionStorage.setItem("refresh", data.refresh);
      }

      return data.access;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem("access");

  const makeRequest = (accessToken) => {
    const headers = new Headers(options.headers || {});

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401 && token) {
    try {
      const latestToken = sessionStorage.getItem("access");

      const newToken =
        latestToken && latestToken !== token
          ? latestToken
          : await refreshAccessToken();

      response = await makeRequest(newToken);
    } catch (error) {
      // Don't silently delete a newer session.
      if (sessionStorage.getItem("access") === token) {
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        sessionStorage.removeItem("user");
      }

      throw error;
    }
  }

  return response;
}