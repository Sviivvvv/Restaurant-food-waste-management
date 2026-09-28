import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_waste_reasons_request, create_waste_reason_request, delete_waste_reason_request } from "../api/waste_reason_api.js";

// admin page: updates the dropdown list of waste causes staff choose from on the quick entry screen
export default function AdminWasteReasonsPage() {
  const [reasons, set_reasons] = useState([]);
  const [name, set_name] = useState("");
  const [is_loading, set_is_loading] = useState(true);

  function load_reasons() {
    set_is_loading(true);
    list_waste_reasons_request()
      .then(set_reasons)
      .finally(() => set_is_loading(false));
  }

  useEffect(load_reasons, []);

  // adds a new waste reason typed in the input box
  async function handle_submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await create_waste_reason_request({ name });
    set_name("");
    load_reasons();
  }

  // permanently removes a waste reason
  async function handle_delete(reason_id) {
    await delete_waste_reason_request(reason_id);
    load_reasons();
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

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : reasons.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No waste reasons yet, add one above.</p>
        ) : (
          reasons.map((reason) => (
            <div key={reason._id} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <span className="badge-amber">{reason.name}</span>
              <button className="btn-danger-text" onClick={() => handle_delete(reason._id)}>
                <TrashIcon className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
