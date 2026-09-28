import React, { useEffect, useState } from "react";
import { ReceiptPercentIcon } from "@heroicons/react/24/solid";
import WasteEntryTable from "../components/waste_entry_table.jsx";
import FilterBar from "../components/filter_bar.jsx";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_all_entries_request } from "../api/waste_entry_api.js";
import { list_branches_request } from "../api/branch_api.js";
import { list_categories_request } from "../api/category_api.js";
import { list_waste_reasons_request } from "../api/waste_reason_api.js";

// manager and admin page: full feed of every waste entry, with filters by date, branch, category, reason
export default function ManagerAllEntriesPage() {
  const [entries, set_entries] = useState([]);
  const [filters, set_filters] = useState({});
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
          <p className="page-subtitle">Every entry logged across your restaurant</p>
        </div>
      </div>

      <FilterBar
        filters={filters}
        on_change={set_filters}
        branches={branches}
        categories={categories}
        reasons={reasons}
        show_branch
      />

      <div className="card">
        {is_loading ? <LoadingSpinner /> : <WasteEntryTable entries={entries} show_branch show_staff />}
      </div>
    </div>
  );
}
