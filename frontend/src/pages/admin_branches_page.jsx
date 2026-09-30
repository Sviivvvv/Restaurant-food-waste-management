import React, { useEffect, useState } from "react";
import { BuildingOffice2Icon, PlusIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { useTableControls, TableSearch, TablePagination, NoSearchResults } from "../components/table_controls.jsx";
import StatusToggleButton from "../components/status_toggle_button.jsx";
import { list_branches_request, create_branch_request, update_branch_request } from "../api/branch_api.js";
import { list_users_request } from "../api/user_api.js";

const empty_form = { name: "", location: "" };

// admin page: register restaurant locations, edit their details, assign a regional manager, and
// activate or deactivate them. Branches are never deleted: users and waste entries reference them,
// so a deactivated branch keeps its history but stops accepting new waste entries.
export default function AdminBranchesPage() {
  const [branches, set_branches] = useState([]);
  const [managers, set_managers] = useState([]);
  const [form, set_form] = useState(empty_form);
  const [editing_id, set_editing_id] = useState(null);
  const [edit_form, set_edit_form] = useState(empty_form);
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  // newest first, searchable, 10 per page
  const table = useTableControls(branches, (branch) => [branch.name, branch.location, branch.regional_manager?.name]);

  function load_branches() {
    set_is_loading(true);
    list_branches_request()
      .then(set_branches)
      .finally(() => set_is_loading(false));
  }

  useEffect(() => {
    load_branches();
    list_users_request().then((all_users) => set_managers(all_users.filter((user) => user.role === "manager")));
  }, []);

  // runs a branch update and reloads, showing the server's message if it fails
  async function save_branch(branch_id, changes, fallback_message) {
    set_error_message("");
    try {
      await update_branch_request(branch_id, changes);
      load_branches();
      return true;
    } catch (error) {
      set_error_message(error.response?.data?.message || fallback_message);
      return false;
    }
  }

  // registers a new branch with the name and location from the form
  async function handle_submit(event) {
    event.preventDefault();
    set_error_message("");
    try {
      await create_branch_request({ name: form.name.trim(), location: form.location.trim() });
      set_form(empty_form);
      load_branches();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not add this branch");
    }
  }

  // assigns or changes the regional manager for a branch
  function handle_manager_change(branch_id, manager_id) {
    save_branch(branch_id, { regional_manager: manager_id || null }, "Could not assign this manager");
  }

  // opens the inline editor for one branch
  function start_edit(branch) {
    set_error_message("");
    set_editing_id(branch._id);
    set_edit_form({ name: branch.name, location: branch.location });
  }

  // saves the edited name and location
  async function handle_save_edit(event) {
    event.preventDefault();
    if (!edit_form.name.trim() || !edit_form.location.trim()) return;
    const saved = await save_branch(
      editing_id,
      { name: edit_form.name.trim(), location: edit_form.location.trim() },
      "Could not save this branch"
    );
    if (saved) set_editing_id(null);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <BuildingOffice2Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Branches</h1>
          <p className="page-subtitle">Restaurant locations and their regional managers</p>
        </div>
      </div>

      <form onSubmit={handle_submit} className="card flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="label-text">Branch name</label>
          <input required className="input-field" value={form.name} onChange={(e) => set_form({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label-text">Location</label>
          <input required className="input-field" value={form.location} onChange={(e) => set_form({ ...form, location: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Add branch
        </button>
      </form>

      {error_message && <p className="text-sm text-rose-600 mb-4">{error_message}</p>}

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : branches.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No branches yet, add one above.</p>
        ) : (
          <>
          <TableSearch table={table} placeholder="Search name, location, manager..." />
          {table.page_rows.length === 0 ? (
            <NoSearchResults table={table} />
          ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Regional manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {table.page_rows.map((branch) =>
                editing_id === branch._id ? (
                  <tr key={branch._id}>
                    <td>
                      <input
                        autoFocus
                        form="edit-branch-form"
                        className="input-field py-1.5"
                        value={edit_form.name}
                        onChange={(e) => set_edit_form({ ...edit_form, name: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        form="edit-branch-form"
                        className="input-field py-1.5"
                        value={edit_form.location}
                        onChange={(e) => set_edit_form({ ...edit_form, location: e.target.value })}
                      />
                    </td>
                    <td className="text-slate-400 text-xs">{branch.regional_manager?.name || "Unassigned"}</td>
                    <td>
                      <span className={branch.is_active ? "badge-brand" : "badge-slate"}>{branch.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td>
                      <form id="edit-branch-form" onSubmit={handle_save_edit} className="flex items-center gap-2">
                        <button type="submit" className="btn-save">Save</button>
                        <button type="button" className="btn-cancel" onClick={() => set_editing_id(null)}>Cancel</button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={branch._id} className={branch.is_active ? "" : "opacity-70"}>
                    <td className="font-medium text-slate-800">{branch.name}</td>
                    <td className="text-slate-500">{branch.location}</td>
                    <td>
                      <select
                        className="input-field py-1.5 max-w-xs"
                        value={branch.regional_manager?._id || ""}
                        onChange={(e) => handle_manager_change(branch._id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {managers.map((manager) => (
                          <option key={manager._id} value={manager._id}>{manager.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={branch.is_active ? "badge-brand" : "badge-slate"}>{branch.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn-edit" onClick={() => start_edit(branch)}>
                          <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                        </button>
                        <StatusToggleButton
                          is_active={branch.is_active}
                          onClick={() =>
                            save_branch(branch._id, { is_active: !branch.is_active }, "Could not update this branch")
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          )}
          <TablePagination table={table} />
          </>
        )}
      </div>
    </div>
  );
}
