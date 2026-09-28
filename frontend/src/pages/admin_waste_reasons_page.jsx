import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import StatusToggleButton from "../components/status_toggle_button.jsx";
import {
  list_waste_reasons_request,
  create_waste_reason_request,
  update_waste_reason_request
} from "../api/waste_reason_api.js";

// admin page: manages the dropdown list of waste causes staff choose from on the quick entry screen
export default function AdminWasteReasonsPage() {
  const [waste_reasons, set_waste_reasons] = useState([]);
  const [name, set_name] = useState("");
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

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
      await create_waste_reason_request({ name });
      set_name("");
      load_waste_reasons();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not add this waste reason");
    }
  }

  // toggles a waste reason between active and inactive
  async function handle_toggle_active(waste_reason) {
    set_error_message("");
    await update_waste_reason_request(waste_reason._id, { is_active: !waste_reason.is_active });
    load_waste_reasons();
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
          waste_reasons.map((waste_reason) => (
            <div
              key={waste_reason._id}
              className="grid grid-cols-[1fr_6rem_7rem] items-center gap-4 py-2.5 border-b border-slate-100 last:border-0"
            >
              <span className={`badge-amber justify-self-start ${waste_reason.is_active ? "" : "opacity-60"}`}>{waste_reason.name}</span>
              <span className={`justify-self-center ${waste_reason.is_active ? "badge-brand" : "badge-slate"}`}>
                {waste_reason.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end">
                <StatusToggleButton is_active={waste_reason.is_active} onClick={() => handle_toggle_active(waste_reason)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
