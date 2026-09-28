import React, { useEffect, useState } from "react";
import { Squares2X2Icon, BanknotesIcon, ScaleIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/solid";
import StatCard from "../components/stat_card.jsx";
import TrendChart from "../components/trend_chart.jsx";
import FilterBar from "../components/filter_bar.jsx";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { get_summary_request, get_top_items_request, get_trends_request } from "../api/report_api.js";
import { list_branches_request } from "../api/branch_api.js";
import { list_categories_request } from "../api/category_api.js";
import { list_waste_reasons_request } from "../api/waste_reason_api.js";
import { format_currency } from "../utils/format_currency.js";
import { useAuth } from "../context/auth_context.jsx";

// manager and admin page: financial and volume loss totals, top wasted items, and a trend chart
export default function ManagerDashboardPage() {
  const { current_user } = useAuth();
  const [filters, set_filters] = useState({});
  const [summary, set_summary] = useState(null);
  const [top_items, set_top_items] = useState(null);
  const [trends, set_trends] = useState([]);
  const [branches, set_branches] = useState([]);
  const [categories, set_categories] = useState([]);
  const [reasons, set_reasons] = useState([]);
  const [is_loading, set_is_loading] = useState(true);

  // a breakdown panel only makes sense to show when its own filter is not already pinning it to one row
  const show_category_breakdown = !filters.category;
  const show_reason_breakdown = !filters.reason;

  // loads the dropdown option lists once when the page opens
  useEffect(() => {
    list_branches_request().then(set_branches);
    list_categories_request().then(set_categories);
    list_waste_reasons_request().then(set_reasons);
  }, []);

  // reloads the report data whenever the filters change
  useEffect(() => {
    set_is_loading(true);
    Promise.all([get_summary_request(filters), get_top_items_request(filters), get_trends_request(filters)])
      .then(([summary_data, top_items_data, trends_data]) => {
        set_summary(summary_data);
        set_top_items(top_items_data);
        set_trends(trends_data);
      })
      .finally(() => set_is_loading(false));
  }, [filters]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <Squares2X2Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Waste Dashboard</h1>
          <p className="page-subtitle">Financial and volume loss across your restaurant</p>
        </div>
      </div>

      <FilterBar
        filters={filters}
        on_change={set_filters}
        branches={branches}
        categories={categories}
        reasons={reasons}
        show_branch={current_user.role === "admin"}
      />

      {is_loading || !summary ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total monetary loss" value={format_currency(summary.total_loss)} icon={BanknotesIcon} tone="rose" />
            <StatCard label="Total quantity wasted" value={summary.total_quantity.toFixed(2)} icon={ScaleIcon} tone="brand" />
            <StatCard label="Waste entries logged" value={summary.entry_count} icon={ClipboardDocumentCheckIcon} tone="slate" />
          </div>

          <div className="card mb-6">
            <h2 className="font-semibold text-slate-800 mb-4">Waste trend over time</h2>
            <TrendChart data={trends} />
          </div>

          {/* a breakdown is hidden once its own filter pins it to a single row, the other one then takes the full row */}
          {(show_category_breakdown || show_reason_breakdown) && (
            <div className={`grid grid-cols-1 ${show_category_breakdown && show_reason_breakdown ? "md:grid-cols-2" : ""} gap-4 mb-6`}>
              {show_category_breakdown && (
                <div className="card">
                  <h2 className="font-semibold text-slate-800 mb-3">By category</h2>
                  {summary.by_category.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
                  {summary.by_category.map((row) => (
                    <div key={row.name} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
                      <span className="badge-brand">{row.name}</span>
                      <span className="font-semibold text-rose-600">{format_currency(row.total_loss)}</span>
                    </div>
                  ))}
                </div>
              )}
              {show_reason_breakdown && (
                <div className="card">
                  <h2 className="font-semibold text-slate-800 mb-3">By waste reason</h2>
                  {summary.by_reason.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
                  {summary.by_reason.map((row) => (
                    <div key={row.name} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
                      <span className="badge-amber">{row.name}</span>
                      <span className="font-semibold text-rose-600">{format_currency(row.total_loss)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3">Top items by weight discarded</h2>
              {top_items.by_weight.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
              {top_items.by_weight.map((row, index) => (
                <div key={row._id} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">
                    <span className="text-slate-400 mr-2">{index + 1}.</span>{row._id}
                  </span>
                  <span className="text-slate-500">{row.total_quantity.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-3">Top items by monetary loss</h2>
              {top_items.by_loss.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
              {top_items.by_loss.map((row, index) => (
                <div key={row._id} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700">
                    <span className="text-slate-400 mr-2">{index + 1}.</span>{row._id}
                  </span>
                  <span className="font-semibold text-rose-600">{format_currency(row.total_loss)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
