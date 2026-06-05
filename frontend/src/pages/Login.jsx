import { useState } from "react";
import { login } from "../services/api";

const defaultCredentials = {
  username: "matchmaker",
  password: "matchmaker",
};

function Login() {
  const [credentials, setCredentials] = useState(defaultCredentials);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(credentials);
      localStorage.setItem("auth", JSON.stringify(data));
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100/80 bg-white p-8 shadow-[0_28px_70px_-35px_rgba(5,150,105,0.45)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-base font-semibold text-emerald-800">
            MM
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              Matchmaker Suite
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Sign in to Dashboard
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Enter your matchmaker credentials to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <label className="block text-sm font-medium text-slate-700">
            Username
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              placeholder="matchmaker"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              placeholder="matchmaker"
            />
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          Sample login: <span className="font-semibold">matchmaker / matchmaker</span>
        </div>
      </div>
    </main>
  );
}

export default Login;