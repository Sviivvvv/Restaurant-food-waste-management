import React, { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/solid";
import WasteEntryTable from "../components/waste_entry_table.jsx";
import FilterBar from "../components/filter_bar.jsx";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_my_entries_request } from "../api/waste_entry_api.js";
import { list_categories_request } from "../api/category_api.js";
import { list_waste_reasons_request } from "../api/waste_reason_api.js";

// staff page: shows the entries the logged in user submitted, so they can check for mistakes
export default function StaffMyEntriesPage() {
  const [entries, set_entries] = useState([]);
  const [filters, set_filters] = useState({});
  const [categories, set_categories] = useState([]);
  const [reasons, set_reasons] = useState([]);
  const [is_loading, set_is_loading] = useState(true);

  // loads the dropdown option lists once when the page opens
  useEffect(() => {
    list_categories_request().then(set_categories);
    list_waste_reasons_request().then(set_reasons);
  }, []);

  // reloads this staff member's entries whenever the filters change
  useEffect(() => {
    set_is_loading(true);
    list_my_entries_request(filters)
      .then(set_entries)
      .finally(() => set_is_loading(false));
  }, [filters]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <ClockIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">My Recorded Waste</h1>
          <p className="page-subtitle">Everything you've logged this shift and before</p>
        </div>
      </div>

      <FilterBar filters={filters} on_change={set_filters} categories={categories} reasons={reasons} />

      <div className="card">
        {is_loading ? <LoadingSpinner /> : <WasteEntryTable entries={entries} />}
      </div>
    </div>
  );
}
