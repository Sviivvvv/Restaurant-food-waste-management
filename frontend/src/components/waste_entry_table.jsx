import React from "react";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";
import { format_currency } from "../utils/format_currency.js";

// table that lists waste entries, show_branch and show_staff control optional columns
export default function WasteEntryTable({ entries, show_branch, show_staff }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-14 text-slate-400">
        <ArchiveBoxIcon className="h-8 w-8 mb-2" />
        <p className="text-sm">No waste entries found for this filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Category</th>
            <th>Reason</th>
            {show_branch && <th>Branch</th>}
            {show_staff && <th>Recorded by</th>}
            <th>Quantity</th>
            <th>Loss</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry._id}>
              <td className="text-slate-500 whitespace-nowrap">
                {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </td>
              <td className="font-medium text-slate-800">{entry.item_name}</td>
              <td><span className="badge-brand">{entry.category?.name || "-"}</span></td>
              <td><span className="badge-amber">{entry.reason?.name || "-"}</span></td>
              {show_branch && <td>{entry.branch?.name || "-"}</td>}
              {show_staff && <td>{entry.recorded_by?.name || "-"}</td>}
              <td className="whitespace-nowrap">{entry.quantity_discarded} {entry.unit}</td>
              <td className="font-semibold text-rose-600 whitespace-nowrap">
                {format_currency(entry.total_monetary_loss)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
