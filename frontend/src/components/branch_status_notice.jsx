import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";

// remembers which users already saw the reminder since the page was last loaded, so it pops up once
// per login or refresh rather than on every page change. A full reload clears this automatically.
const shown_for_users = new Set();
export function reset_branch_notice() {
  shown_for_users.clear();
}

// Active / Inactive chip for a branch. For staff and managers whose own branch is inactive, a small
// popover opens under the chip explaining that new entries and price changes are paused.
export default function BranchStatusNotice({ branch_name, is_active, remind_user_id }) {
  const [is_open, set_is_open] = useState(false);

  useEffect(() => {
    if (is_active === false && remind_user_id && !shown_for_users.has(remind_user_id)) {
      shown_for_users.add(remind_user_id);
      set_is_open(true);
    }
  }, [is_active, remind_user_id]);

  if (is_active === undefined || is_active === null) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !is_active && set_is_open((open) => !open)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
          is_active ? "border-brand-200 bg-brand-50 text-brand-700 cursor-default" : "border-rose-200 bg-rose-50 text-rose-600"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${is_active ? "bg-brand-500" : "bg-rose-500"}`} />
        {is_active ? "Active" : "Inactive"}
      </button>

      {is_open && !is_active && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
          <span className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white" />
          <div className="flex gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-rose-500" />
            <div className="text-sm">
              <p className="font-semibold text-slate-800">{branch_name} is inactive</p>
              <p className="mt-1 text-slate-500">
                New waste entries and price changes are paused. Past records are still available to view.
              </p>
            </div>
            <button type="button" onClick={() => set_is_open(false)} className="self-start text-slate-400 hover:text-slate-600" aria-label="Close">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
