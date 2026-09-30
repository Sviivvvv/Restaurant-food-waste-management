import React, { useEffect, useState } from "react";
import { Square3Stack3DIcon, PlusIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import StatusToggleButton from "../components/status_toggle_button.jsx";
import { useTableControls, TableSearch, TablePagination, NoSearchResults } from "../components/table_controls.jsx";
import { list_categories_request, create_category_request, update_category_request } from "../api/category_api.js";

// admin page: add, rename, activate, or deactivate categories. They are never deleted, because waste
// entries reference them by id; deactivating hides them from the staff entry form but keeps history intact.
export default function AdminCategoriesPage() {
  const [categories, set_categories] = useState([]);
  const [name, set_name] = useState("");
  const [editing_id, set_editing_id] = useState(null);
  const [edit_name, set_edit_name] = useState("");
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  // newest first, searchable, 10 per page
  const table = useTableControls(categories, (category) => [category.name]);

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
      await create_category_request({ name: name.trim() });
      set_name("");
      load_categories();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not add this category");
    }
  }

  // toggles a category between active and inactive
  async function handle_toggle_active(category) {
    set_error_message("");
    try {
      await update_category_request(category._id, { is_active: !category.is_active });
      load_categories();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not update this category");
    }
  }

  // opens the inline editor for one row
  function start_edit(category) {
    set_error_message("");
    set_editing_id(category._id);
    set_edit_name(category.name);
  }

  // saves the renamed category; past entries follow automatically since they reference it by id
  async function handle_save_edit(event) {
    event.preventDefault();
    if (!edit_name.trim()) return;
    set_error_message("");
    try {
      await update_category_request(editing_id, { name: edit_name.trim() });
      set_editing_id(null);
      load_categories();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not rename this category");
    }
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
          <>
          <TableSearch table={table} placeholder="Search categories..." />
          {table.page_rows.length === 0 && <NoSearchResults table={table} />}
          {table.page_rows.map((category) =>
            editing_id === category._id ? (
              <form
                key={category._id}
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
                key={category._id}
                className="grid grid-cols-[1fr_6rem_auto] items-center gap-4 py-2.5 border-b border-slate-100 last:border-0"
              >
                <span className={`badge-sky justify-self-start ${category.is_active ? "" : "opacity-60"}`}>{category.name}</span>
                <span className={`justify-self-center ${category.is_active ? "badge-brand" : "badge-slate"}`}>
                  {category.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" className="btn-edit" onClick={() => start_edit(category)}>
                    <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                  </button>
                  <StatusToggleButton is_active={category.is_active} onClick={() => handle_toggle_active(category)} />
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
