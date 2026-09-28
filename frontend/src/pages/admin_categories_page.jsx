import React, { useEffect, useState } from "react";
import { Square3Stack3DIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_categories_request, create_category_request, delete_category_request } from "../api/category_api.js";

// admin page: add, edit, or remove waste categories used across the platform
export default function AdminCategoriesPage() {
  const [categories, set_categories] = useState([]);
  const [name, set_name] = useState("");
  const [is_loading, set_is_loading] = useState(true);

  function load_categories() {
    set_is_loading(true);
    list_categories_request()
      .then(set_categories)
      .finally(() => set_is_loading(false));
  }

  useEffect(load_categories, []);

  // adds a new waste category typed in the input box
  async function handle_submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    await create_category_request({ name });
    set_name("");
    load_categories();
  }

  // permanently removes a waste category
  async function handle_delete(category_id) {
    await delete_category_request(category_id);
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

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No categories yet, add one above.</p>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
              <span className="badge-brand">{category.name}</span>
              <button className="btn-danger-text" onClick={() => handle_delete(category._id)}>
                <TrashIcon className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
