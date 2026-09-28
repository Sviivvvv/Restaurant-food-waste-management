import React, { useEffect, useState } from "react";
import { UsersIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { list_users_request, create_user_request, update_user_request, deactivate_user_request } from "../api/user_api.js";
import { list_branches_request } from "../api/branch_api.js";

const empty_form = { name: "", email: "", password: "", role: "staff", branch: "" };

// small color coded label for a user's role, used in the users table
const role_badge = { staff: "badge-sky", manager: "badge-violet", admin: "badge-amber" };

// admin page: add new employees, update their details, assign roles, and deactivate accounts
export default function AdminUsersPage() {
  const [users, set_users] = useState([]);
  const [branches, set_branches] = useState([]);
  const [form, set_form] = useState(empty_form);
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  function load_users() {
    set_is_loading(true);
    list_users_request()
      .then(set_users)
      .finally(() => set_is_loading(false));
  }

  useEffect(() => {
    load_users();
    list_branches_request().then(set_branches);
  }, []);

  // creates a new user account with the role and branch chosen in the form
  async function handle_submit(event) {
    event.preventDefault();
    set_error_message("");
    try {
      await create_user_request({ ...form, branch: form.branch || undefined });
      set_form(empty_form);
      load_users();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not create this user");
    }
  }

  // changes a user's role directly from the table
  async function handle_role_change(user_id, new_role) {
    await update_user_request(user_id, { role: new_role });
    load_users();
  }

  // deactivates a user account so they can no longer log in
  async function handle_deactivate(user_id) {
    await deactivate_user_request(user_id);
    load_users();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <UsersIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Add employees, assign roles, and deactivate accounts</p>
        </div>
      </div>

      <form onSubmit={handle_submit} className="card grid grid-cols-2 md:grid-cols-5 gap-4 items-end mb-6">
        <div>
          <label className="label-text">Name</label>
          <input required className="input-field" value={form.name} onChange={(e) => set_form({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label-text">Email</label>
          <input required type="email" className="input-field" value={form.email} onChange={(e) => set_form({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label-text">Password</label>
          <input required className="input-field" value={form.password} onChange={(e) => set_form({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label className="label-text">Role</label>
          <select className="input-field" value={form.role} onChange={(e) => set_form({ ...form, role: e.target.value })}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="label-text">Branch</label>
          <select className="input-field" value={form.branch} onChange={(e) => set_form({ ...form, branch: e.target.value })}>
            <option value="">No branch</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary col-span-2 md:col-span-5">
          <UserPlusIcon className="h-4 w-4" /> Add user
        </button>
      </form>

      {error_message && <p className="text-sm text-rose-600 mb-4">{error_message}</p>}

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="font-medium text-slate-800">{user.name}</td>
                  <td className="text-slate-500">{user.email}</td>
                  <td>
                    <select
                      className={`${role_badge[user.role]} border-0 cursor-pointer pr-6`}
                      value={user.role}
                      onChange={(e) => handle_role_change(user._id, e.target.value)}
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{user.branch?.name || "-"}</td>
                  <td>
                    <span className={user.is_active ? "badge-brand" : "badge-slate"}>
                      {user.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td>
                    {user.is_active && (
                      <button className="btn-danger-text" onClick={() => handle_deactivate(user._id)}>
                        Deactivate
                      </button>
                    )}
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
