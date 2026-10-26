import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8001/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log("LOGIN HTTP STATUS:", response.status)
      console.log("ACESS TOKEN RECEIVED:", Boolean(data.access))

      if (!response.ok) {
        setError(data.detail || "Invalid username or password");
        return;
      }

      // Temporary development-only token storage.
      // Use a safer session strategy before production.
      sessionStorage.setItem("access", data.access);
      sessionStorage.setItem("refresh", data.refresh);

      // Existing ProtectedRoute may expect a user object.
      // This is only UI state, not proof of authentication.
      sessionStorage.setItem(
        "user",
        JSON.stringify({ username: username.trim() })
      );

      alert("Login successful!");
      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error(error);
      setError("Cannot connect to Django server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-center text-3xl font-bold text-slate-900">
          AIdeas
        </h1>

        <p className="mb-8 text-center text-slate-500">
          Welcome back! Please log in.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-600"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;