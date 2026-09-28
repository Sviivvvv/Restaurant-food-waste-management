import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, ArchiveBoxIcon, ArrowTrendingDownIcon, ClipboardDocumentListIcon, ChartPieIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../context/auth_context.jsx";

const demo_accounts = [
  { role: "Admin", email: "admin@wastetracker.com", password: "Admin@123" },
  { role: "Manager", email: "manager@wastetracker.com", password: "Manager@123" },
  { role: "Staff", email: "staff@wastetracker.com", password: "Staff@123" }
];

// feature bullets shown on the left branding panel
const feature_points = [
  { icon: ClipboardDocumentListIcon, text: "Log waste in seconds during a shift" },
  { icon: ArrowTrendingDownIcon, text: "See exactly where money is going" },
  { icon: ChartPieIcon, text: "Spot trends before they become losses" }
];

// login screen shown to everyone before they reach their role's dashboard
export default function LoginPage() {
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [error_message, set_error_message] = useState("");
  const [is_submitting, set_is_submitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // sends the login form, then sends the user to the right page for their role
  async function handle_submit(event) {
    event.preventDefault();
    set_error_message("");
    set_is_submitting(true);
    try {
      const user = await login(email, password);
      if (user.role === "staff") navigate("/record-waste");
      else navigate("/dashboard");
    } catch (error) {
      set_error_message(error.response?.data?.message || "Login failed, please try again");
    } finally {
      set_is_submitting(false);
    }
  }

  // fills the form with one of the demo accounts, so a reviewer can log in with one click
  function fill_demo_account(account) {
    set_email(account.email);
    set_password(account.password);
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ink-950 text-white flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="absolute top-12 left-12 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <ArchiveBoxIcon className="h-5 w-5 text-ink-950" />
          </div>
          <span className="font-bold text-lg">Waste Tracker</span>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Know where your food, and your money, is going.
          </h1>
          <p className="text-slate-400 mb-8 max-w-sm">
            A simple system for kitchen staff, managers, and owners to track food waste and cut losses.
          </p>
          <div className="space-y-4">
            {feature_points.map((point) => (
              <div key={point.text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <point.icon className="h-4 w-4" />
                </div>
                {point.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <ArchiveBoxIcon className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Waste Tracker</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Sign in to record or review waste data</p>

          <form onSubmit={handle_submit} className="space-y-4">
            <div>
              <label className="label-text">Email</label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  placeholder="you@restaurant.com"
                />
              </div>
            </div>
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error_message && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                {error_message}
              </p>
            )}

            <button type="submit" disabled={is_submitting} className="btn-primary w-full">
              {is_submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Try a demo account</p>
            <div className="grid grid-cols-3 gap-2">
              {demo_accounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fill_demo_account(account)}
                  className="text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg py-2 hover:border-brand-400 hover:text-brand-700 transition-colors"
                >
                  {account.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
