import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@medflow.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.success) {
      setError(res.message || "Unable to login");
      return;
    }
    const redirectTo =
      location.state?.from && location.state.from.startsWith("/admin")
        ? location.state.from
        : "/admin";
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center text-slate-950">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">
              MedFlow Admin
            </div>
            <div className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
              SECURE ACCESS
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-6 py-6 shadow-xl shadow-slate-950/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold">Admin sign in</h1>
              <p className="text-xs text-slate-400">
                Use the dedicated admin credentials to continue.
              </p>
            </div>
            <LockKeyhole className="w-5 h-5 text-slate-500" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="admin@medflow.local"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-emerald-400 px-3 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:from-sky-400 hover:to-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          You can customize admin credentials using{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
            VITE_ADMIN_EMAIL
          </code>{" "}
          and{" "}
          <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
            VITE_ADMIN_PASSWORD
          </code>{" "}
          in your frontend environment.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

