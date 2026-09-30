import React, { useEffect, useState } from "react";
import { ReceiptPercentIcon } from "@heroicons/react/24/solid";
import WasteEntryTable from "../components/waste_entry_table.jsx";
import FilterBar from "../components/filter_bar.jsx";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_all_entries_request } from "../api/waste_entry_api.js";
import { list_branches_request } from "../api/branch_api.js";
import { list_categories_request } from "../api/category_api.js";
import { list_waste_reasons_request } from "../api/waste_reason_api.js";
import { useAuth } from "../context/auth_context.jsx";
import { useReportBranchScope } from "../context/scope_context.jsx";

// manager and admin page: full feed of waste entries with filters. Admins see every branch and can filter
// by branch; managers only ever see their own branch (the server enforces this, the UI just matches it)
export default function ManagerAllEntriesPage() {
  const { current_user } = useAuth();
  const is_admin = current_user.role === "admin";
  const [entries, set_entries] = useState([]);
  const [filters, set_filters] = useState({});
  // tells the top bar which branch this page is showing, so its name and status appear there
  useReportBranchScope(filters.branch);
  const [branches, set_branches] = useState([]);
  const [categories, set_categories] = useState([]);
  const [reasons, set_reasons] = useState([]);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    list_branches_request().then(set_branches);
    list_categories_request().then(set_categories);
    list_waste_reasons_request().then(set_reasons);
  }, []);

  // reloads the entry list whenever the filters change
  useEffect(() => {
    set_is_loading(true);
    list_all_entries_request(filters)
      .then(set_entries)
      .finally(() => set_is_loading(false));
  }, [filters]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <ReceiptPercentIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">All Waste Records</h1>
          <p className="page-subtitle">
            {is_admin ? "Every entry logged across all branches" : `Every entry logged at ${current_user.branch?.name || "your branch"}`}
          </p>
        </div>
      </div>

      <FilterBar
        filters={filters}
        on_change={set_filters}
        branches={branches}
        categories={categories}
        reasons={reasons}
        show_branch={is_admin}
      />

      <div className="card">
        {is_loading ? <LoadingSpinner /> : <WasteEntryTable entries={entries} show_branch={is_admin} show_staff />}
      </div>
    </div>
  );
}
