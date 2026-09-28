import React, { useEffect, useState } from "react";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_branches_request, create_branch_request, update_branch_request } from "../api/branch_api.js";
import { list_users_request } from "../api/user_api.js";

const empty_form = { name: "", location: "" };

// admin page: register new restaurant locations and assign a regional manager to each one
export default function AdminBranchesPage() {
  const [branches, set_branches] = useState([]);
  const [managers, set_managers] = useState([]);
  const [form, set_form] = useState(empty_form);
  const [is_loading, set_is_loading] = useState(true);

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

  // registers a new branch with the name and location from the form
  async function handle_submit(event) {
    event.preventDefault();
    await create_branch_request(form);
    set_form(empty_form);
    load_branches();
  }

  // assigns or changes the regional manager for a branch
  async function handle_manager_change(branch_id, manager_id) {
    await update_branch_request(branch_id, { regional_manager: manager_id || null });
    load_branches();
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

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : branches.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No branches yet, add one above.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Regional manager</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch._id}>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
