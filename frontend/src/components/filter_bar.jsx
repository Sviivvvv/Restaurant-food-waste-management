import React from "react";
import { AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/solid";

// reusable row of filter controls for date, branch, category, and reason
export default function FilterBar({ filters, on_change, branches, categories, reasons, show_branch }) {
  function handle_field_change(field, value) {
    on_change({ ...filters, [field]: value || undefined });
  }

  const has_active_filters = Object.keys(filters).length > 0;

  return (
    <div className="card mb-5">
      <div className="flex items-center gap-2 mb-4 text-slate-500">
        <AdjustmentsHorizontalIcon className="h-4 w-4" />
        <p className="text-sm font-semibold">Filters</p>
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="label-text">Start date</label>
          <input
            type="date"
            className="input-field"
            value={filters.start_date || ""}
            onChange={(e) => handle_field_change("start_date", e.target.value)}
          />
        </div>
        <div>
          <label className="label-text">End date</label>
          <input
            type="date"
            className="input-field"
            value={filters.end_date || ""}
            onChange={(e) => handle_field_change("end_date", e.target.value)}
          />
        </div>
        {show_branch && branches && (
          <div>
            <label className="label-text">Branch</label>
            <select className="input-field" value={filters.branch || ""} onChange={(e) => handle_field_change("branch", e.target.value)}>
              <option value="">All branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>
          </div>
        )}
        {categories && (
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" value={filters.category || ""} onChange={(e) => handle_field_change("category", e.target.value)}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
        )}
        {reasons && (
          <div>
            <label className="label-text">Reason</label>
            <select className="input-field" value={filters.reason || ""} onChange={(e) => handle_field_change("reason", e.target.value)}>
              <option value="">All reasons</option>
              {reasons.map((reason) => (
                <option key={reason._id} value={reason._id}>{reason.name}</option>
              ))}
            </select>
          </div>
        )}
        {has_active_filters && (
          <button className="btn-secondary text-sm" onClick={() => on_change({})}>
            <XMarkIcon className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
