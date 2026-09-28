import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,
  DocumentPlusIcon,
  ClockIcon,
  ReceiptPercentIcon,
  TagIcon,
  UsersIcon,
  Square3Stack3DIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/solid";
import { useAuth } from "../context/auth_context.jsx";

// turns a full name into two letter initials for the avatar circle, e.g. "Sample Manager" becomes "SM"
function get_initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// small color coded label shown next to the user's name in the sidebar footer
const role_styles = {
  staff: "bg-sky-500/15 text-sky-300",
  manager: "bg-violet-500/15 text-violet-300",
  admin: "bg-amber-500/15 text-amber-300"
};

// one row in the navigation list, highlights itself when its route is active
function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-500/15 text-brand-300"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </NavLink>
  );
}

// dark left hand navigation column, its links change based on the logged in user's role
export default function Sidebar() {
  const { current_user, logout } = useAuth();
  const navigate = useNavigate();

  function handle_logout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="w-64 shrink-0 bg-ink-950 text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <ArchiveBoxIcon className="h-[18px] w-[18px] text-ink-950" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Waste Tracker</p>
          <p className="text-xs text-slate-400 leading-tight">for restaurants</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {current_user.role === "staff" && (
          <>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Daily work</p>
            <NavItem to="/record-waste" icon={DocumentPlusIcon} label="Record Waste" />
            <NavItem to="/my-entries" icon={ClockIcon} label="My Entries" />
          </>
        )}

        {(current_user.role === "manager" || current_user.role === "admin") && (
          <>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Insights</p>
            <NavItem to="/dashboard" icon={Squares2X2Icon} label="Dashboard" />
            <NavItem to="/all-entries" icon={ReceiptPercentIcon} label="All Entries" />
            <NavItem to="/item-prices" icon={TagIcon} label="Item Prices" />
          </>
        )}

        {current_user.role === "admin" && (
          <>
            <p className="px-3 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Administration</p>
            <NavItem to="/admin/users" icon={UsersIcon} label="Users" />
            <NavItem to="/admin/categories" icon={Square3Stack3DIcon} label="Categories" />
            <NavItem to="/admin/waste-reasons" icon={ExclamationTriangleIcon} label="Waste Reasons" />
            <NavItem to="/admin/branches" icon={BuildingOffice2Icon} label="Branches" />
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            {get_initials(current_user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{current_user.name}</p>
            <span className={`badge ${role_styles[current_user.role]} mt-0.5`}>{current_user.role}</span>
          </div>
          <button
            onClick={handle_logout}
            title="Log out"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
