import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon, PlusIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import StatusToggleButton from "../components/status_toggle_button.jsx";
import { useTableControls, TableSearch, TablePagination, NoSearchResults } from "../components/table_controls.jsx";
import { list_waste_reasons_request, create_waste_reason_request, update_waste_reason_request } from "../api/waste_reason_api.js";

// admin page: add, rename, activate, or deactivate waste reasons. They are never deleted, because waste
// entries reference them by id; deactivating hides them from the staff entry form but keeps history intact.
export default function AdminWasteReasonsPage() {
  const [waste_reasons, set_waste_reasons] = useState([]);
  const [name, set_name] = useState("");
  const [editing_id, set_editing_id] = useState(null);
  const [edit_name, set_edit_name] = useState("");
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  // newest first, searchable, 10 per page
  const table = useTableControls(waste_reasons, (waste_reason) => [waste_reason.name]);

  function load_waste_reasons() {
    set_is_loading(true);
    list_waste_reasons_request()
      .then(set_waste_reasons)
      .finally(() => set_is_loading(false));
  }

  useEffect(load_waste_reasons, []);

  // adds a new waste reason typed in the input box
  async function handle_submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    set_error_message("");
    try {
      await create_waste_reason_request({ name: name.trim() });
      set_name("");
      load_waste_reasons();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not add this waste reason");
    }
  }

  // toggles a waste reason between active and inactive
  async function handle_toggle_active(waste_reason) {
    set_error_message("");
    try {
      await update_waste_reason_request(waste_reason._id, { is_active: !waste_reason.is_active });
      load_waste_reasons();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not update this waste reason");
    }
  }

  // opens the inline editor for one row
  function start_edit(waste_reason) {
    set_error_message("");
    set_editing_id(waste_reason._id);
    set_edit_name(waste_reason.name);
  }

  // saves the renamed waste reason; past entries follow automatically since they reference it by id
  async function handle_save_edit(event) {
    event.preventDefault();
    if (!edit_name.trim()) return;
    set_error_message("");
    try {
      await update_waste_reason_request(editing_id, { name: edit_name.trim() });
      set_editing_id(null);
      load_waste_reasons();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not rename this waste reason");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <ExclamationTriangleIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Waste Reasons</h1>
          <p className="page-subtitle">The dropdown options staff choose from on the entry screen</p>
        </div>
      </div>

      <form onSubmit={handle_submit} className="flex gap-3 mb-6">
        <input
          className="input-field"
          placeholder="e.g. Dropped"
          value={name}
          onChange={(e) => set_name(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0">
          <PlusIcon className="h-4 w-4" /> Add
        </button>
      </form>

      {error_message && <p className="text-sm text-rose-600 mb-4">{error_message}</p>}

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : waste_reasons.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No waste reasons yet, add one above.</p>
        ) : (
          <>
          <TableSearch table={table} placeholder="Search reasons..." />
          {table.page_rows.length === 0 && <NoSearchResults table={table} />}
          {table.page_rows.map((waste_reason) =>
            editing_id === waste_reason._id ? (
              <form
                key={waste_reason._id}
                onSubmit={handle_save_edit}
                className="flex items-center gap-2 py-2.5 border-b border-slate-100 last:border-0"
              >
                <input
                  autoFocus
                  className="input-field py-1.5"
                  value={edit_name}
                  onChange={(e) => set_edit_name(e.target.value)}
                />
                <button type="submit" className="btn-save shrink-0">Save</button>
                <button type="button" className="btn-cancel shrink-0" onClick={() => set_editing_id(null)}>Cancel</button>
              </form>
            ) : (
              <div
                key={waste_reason._id}
                className="grid grid-cols-[1fr_6rem_auto] items-center gap-4 py-2.5 border-b border-slate-100 last:border-0"
              >
                <span className={`badge-amber justify-self-start ${waste_reason.is_active ? "" : "opacity-60"}`}>{waste_reason.name}</span>
                <span className={`justify-self-center ${waste_reason.is_active ? "badge-brand" : "badge-slate"}`}>
                  {waste_reason.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" className="btn-edit" onClick={() => start_edit(waste_reason)}>
                    <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                  </button>
                  <StatusToggleButton is_active={waste_reason.is_active} onClick={() => handle_toggle_active(waste_reason)} />
                </div>
              </div>
            )
          )}
          <TablePagination table={table} />
          </>
        )}
      </div>
    </div>
  );
}
