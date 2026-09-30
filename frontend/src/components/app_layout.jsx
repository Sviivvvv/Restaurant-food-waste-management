import React, { useEffect, useState } from "react";
import { BuildingOffice2Icon } from "@heroicons/react/20/solid";
import Sidebar from "./sidebar.jsx";
import BranchStatusNotice from "./branch_status_notice.jsx";
import { useAuth } from "../context/auth_context.jsx";
import { ScopeProvider, useScope } from "../context/scope_context.jsx";
import { list_branches_request } from "../api/branch_api.js";

// greeting that follows the time of day, keeps the top bar feeling personal without adding clutter
function get_greeting(date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// slim bar above every page: greeting and date on the left; on the right, which branch the page
// is showing and whether that branch is active. Admins see the branch picked in the page's filter
// ("All branches" when none); staff and managers always see their own branch.
function TopBar() {
  const { current_user } = useAuth();
  const { scoped_branch_id } = useScope();
  const [branches, set_branches] = useState([]);
  const is_admin = current_user.role === "admin";
  const today = new Date();
  const first_name = current_user.name?.split(" ")[0] || "";

  // admins need the branch list to turn the filtered id into a name and status; refreshed when the
  // filter changes so a branch deactivated in another tab shows its current state
  useEffect(() => {
    if (is_admin) list_branches_request().then(set_branches).catch(() => {});
  }, [is_admin, scoped_branch_id]);

  const branch = is_admin ? branches.find((item) => item._id === scoped_branch_id) : current_user.branch;
  const branch_label = branch?.name || (is_admin ? "All branches" : "No branch assigned");

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-8">
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-800">
            {get_greeting(today)}, {first_name}
          </span>
          <span className="mx-2 text-slate-300">/</span>
          {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <BuildingOffice2Icon className="h-3.5 w-3.5 text-brand-600" />
            {branch_label}
          </span>
          {branch && (
            <BranchStatusNotice
              branch_name={branch.name}
              is_active={branch.is_active}
              remind_user_id={is_admin ? null : current_user._id || current_user.id}
            />
          )}
        </div>
      </div>
    </header>
  );
}

// shared shell for every logged in page: sidebar on the left, the top bar, then the page content
export default function AppLayout({ children }) {
  return (
    <ScopeProvider>
      <div className="app-canvas flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <TopBar />
          <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>
    </ScopeProvider>
  );
}
