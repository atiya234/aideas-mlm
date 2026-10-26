export const refreshAccessToken = async () => {
    const refresh = sessionStorage.getItem("refresh");

    if (!refresh) {
        return null;
    }

    try {
        const response = await fetch(
            "http://127.0.0.1:8001/api/token/refresh/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh }),
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        sessionStorage.setItem("access", data.access);

        if (data.refresh) {
            sessionStorage.setItem("refresh", data.refresh);
        }

        return data.access;
    } catch (error) {
        console.error("Token refresh failed:", error);
        return null;
    }
};