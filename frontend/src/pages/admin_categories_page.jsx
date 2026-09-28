import React, { useEffect, useState } from "react";
import { Square3Stack3DIcon, PlusIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import StatusToggleButton from "../components/status_toggle_button.jsx";
import {
  list_categories_request,
  create_category_request,
  update_category_request
} from "../api/category_api.js";

// admin page: add, activate, or deactivate waste categories used across the platform
export default function AdminCategoriesPage() {
  const [categories, set_categories] = useState([]);
  const [name, set_name] = useState("");
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  function load_categories() {
    set_is_loading(true);
    list_categories_request()
      .then(set_categories)
      .finally(() => set_is_loading(false));
  }

  useEffect(load_categories, []);

  // adds a new category typed in the input box
  async function handle_submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    set_error_message("");
    try {
      await create_category_request({ name });
      set_name("");
      load_categories();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not add this category");
    }
  }

  // toggles a category between active and inactive
  async function handle_toggle_active(category) {
    set_error_message("");
    await update_category_request(category._id, { is_active: !category.is_active });
    load_categories();
  }


  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <Square3Stack3DIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Waste Categories</h1>
          <p className="page-subtitle">Prep, plate, bar, spoilage, and any others you need</p>
        </div>
      </div>

      <form onSubmit={handle_submit} className="flex gap-3 mb-6">
        <input
          className="input-field"
          placeholder="e.g. Spoilage"
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
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No categories yet, add one above.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="grid grid-cols-[1fr_6rem_7rem] items-center gap-4 py-2.5 border-b border-slate-100 last:border-0"
            >
              <span className={`badge-sky justify-self-start ${category.is_active ? "" : "opacity-60"}`}>{category.name}</span>
              <span className={`justify-self-center ${category.is_active ? "badge-brand" : "badge-slate"}`}>
                {category.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end">
                <StatusToggleButton is_active={category.is_active} onClick={() => handle_toggle_active(category)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
