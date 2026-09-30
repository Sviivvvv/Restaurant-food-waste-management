import React, { useEffect, useState } from "react";
import { TagIcon, PlusIcon, TrashIcon, ArchiveBoxIcon, LockClosedIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import { useTableControls, TableSearch, TablePagination, NoSearchResults } from "../components/table_controls.jsx";
import StatusToggleButton from "../components/status_toggle_button.jsx";
import {
  list_item_prices_request,
  create_item_price_request,
  update_item_price_request,
  delete_item_price_request
} from "../api/item_price_api.js";
import { format_currency } from "../utils/format_currency.js";
import { list_branches_request } from "../api/branch_api.js";
import { useAuth } from "../context/auth_context.jsx";

const empty_form = { item_name: "", unit: "kg", unit_cost: "", branch: "" };

// manager and admin page: defines the standard unit cost for each ingredient or dish.
// A price is either shared (every branch) or specific to one branch, and a branch price overrides a shared one.
// Managers see their branch's prices plus the shared ones, but can only change their own branch's;
// admins see and manage everything, and choose the branch when adding a price.
export default function ManagerItemPricesPage() {
  const { current_user } = useAuth();
  const is_admin = current_user.role === "admin";
  const own_branch_id = current_user.branch?._id;
  // a manager at a deactivated branch can view prices but not change them (the server enforces this too)
  const is_locked = !is_admin && current_user.branch?.is_active === false;
  const [branches, set_branches] = useState([]);
  const [editing_id, set_editing_id] = useState(null);
  const [edit_form, set_edit_form] = useState({ item_name: "", unit: "kg", unit_cost: "" });
  const [item_prices, set_item_prices] = useState([]);
  const [form, set_form] = useState(empty_form);
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  // newest first, searchable, 10 per page
  const table = useTableControls(item_prices, (item_price) => [item_price.item_name, item_price.branch?.name || "Shared", item_price.unit]);

  function load_item_prices() {
    set_is_loading(true);
    list_item_prices_request()
      .then(set_item_prices)
      .finally(() => set_is_loading(false));
  }

  useEffect(load_item_prices, []);

  // only an admin picks the branch when adding; a manager's prices always go to their own branch
  useEffect(() => {
    if (is_admin) list_branches_request().then(set_branches);
  }, [is_admin]);

  // true when the logged in user is allowed to change this price (mirrors the server rule)
  function can_manage(item_price) {
    if (is_admin) return true;
    if (is_locked) return false;
    return Boolean(item_price.branch) && item_price.branch._id === own_branch_id;
  }

  // adds a new item price using the values in the form
  async function handle_submit(event) {
    event.preventDefault();
    set_error_message("");
    try {
      await create_item_price_request({ ...form, unit_cost: Number(form.unit_cost), branch: form.branch || null });
      set_form(empty_form);
      load_item_prices();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not save this item price");
    }
  }

  // toggles an item price between active and inactive
  async function handle_toggle_active(item_price) {
    set_error_message("");
    try {
      await update_item_price_request(item_price._id, { is_active: !item_price.is_active });
      load_item_prices();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not update this item price");
    }
  }

  // permanently removes an item price
  async function handle_delete(item_price) {
    if (!window.confirm(`Delete "${item_price.item_name}" permanently?`)) return;
    set_error_message("");
    try {
      await delete_item_price_request(item_price._id);
      load_item_prices();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not delete this item price");
    }
  }

  // opens the inline editor for one price row
  function start_edit(item_price) {
    set_error_message("");
    set_editing_id(item_price._id);
    set_edit_form({ item_name: item_price.item_name, unit: item_price.unit, unit_cost: String(item_price.unit_cost) });
  }

  // saves an edited name, unit, or cost; past waste entries keep the cost they were logged with (4.2)
  async function handle_save_edit(event) {
    event.preventDefault();
    if (!edit_form.item_name.trim() || edit_form.unit_cost === "") return;
    set_error_message("");
    try {
      await update_item_price_request(editing_id, {
        item_name: edit_form.item_name.trim(),
        unit: edit_form.unit,
        unit_cost: Number(edit_form.unit_cost)
      });
      set_editing_id(null);
      load_item_prices();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not save this item price");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <TagIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Item Prices</h1>
          <p className="page-subtitle">
            {is_admin
              ? "Standard unit costs used to calculate monetary loss"
              : `Prices used at ${current_user.branch?.name || "your branch"}. Shared prices are set by an admin; add your own to override one.`}
          </p>
        </div>
      </div>

      {is_locked && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {current_user.branch.name} is inactive, so prices can be viewed but not added or changed.
        </p>
      )}

      <form
        onSubmit={handle_submit}
        className={`card flex flex-wrap gap-4 items-end mb-6 ${is_locked ? "opacity-60 pointer-events-none" : ""}`}
      >
        <div>
          <label className="label-text">Item name</label>
          <input
            required
            className="input-field"
            value={form.item_name}
            onChange={(e) => set_form({ ...form, item_name: e.target.value })}
          />
        </div>
        <div>
          <label className="label-text">Unit</label>
          <select className="input-field" value={form.unit} onChange={(e) => set_form({ ...form, unit: e.target.value })}>
            <option value="kg">kg</option>
            <option value="liter">liter</option>
            <option value="unit">unit</option>
          </select>
        </div>
        <div>
          <label className="label-text">Unit cost</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            value={form.unit_cost}
            onChange={(e) => set_form({ ...form, unit_cost: e.target.value })}
          />
        </div>
        {is_admin && (
          <div>
            <label className="label-text">Branch</label>
            <select className="input-field" value={form.branch} onChange={(e) => set_form({ ...form, branch: e.target.value })}>
              <option value="">Shared (all branches)</option>
              {branches.filter((branch) => branch.is_active).map((branch) => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Add item price
        </button>
      </form>

      {error_message && <p className="text-sm text-rose-600 mb-4">{error_message}</p>}

      <div className="card">
        {is_loading ? (
          <LoadingSpinner />
        ) : item_prices.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 text-slate-400">
            <ArchiveBoxIcon className="h-8 w-8 mb-2" />
            <p className="text-sm">No item prices set yet.</p>
          </div>
        ) : (
          <>
          <TableSearch table={table} placeholder="Search item or branch..." />
          {table.page_rows.length === 0 ? (
            <NoSearchResults table={table} />
          ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Branch</th>
                <th>Unit</th>
                <th>Cost per unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {table.page_rows.map((item_price) =>
                editing_id === item_price._id ? (
                <tr key={item_price._id}>
                  <td>
                    <input
                      autoFocus
                      form="edit-price-form"
                      className="input-field py-1.5"
                      value={edit_form.item_name}
                      onChange={(e) => set_edit_form({ ...edit_form, item_name: e.target.value })}
                    />
                  </td>
                  <td>
                    {item_price.branch ? <span className="badge-sky">{item_price.branch.name}</span> : <span className="badge-violet">Shared</span>}
                  </td>
                  <td>
                    <select
                      form="edit-price-form"
                      className="input-field py-1.5"
                      value={edit_form.unit}
                      onChange={(e) => set_edit_form({ ...edit_form, unit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="unit">unit</option>
                    </select>
                  </td>
                  <td>
                    <input
                      form="edit-price-form"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-field py-1.5 w-28"
                      value={edit_form.unit_cost}
                      onChange={(e) => set_edit_form({ ...edit_form, unit_cost: e.target.value })}
                    />
                  </td>
                  <td>
                    <span className={item_price.is_active ? "badge-brand" : "badge-slate"}>
                      {item_price.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <form id="edit-price-form" onSubmit={handle_save_edit} className="flex items-center gap-2">
                      <button type="submit" className="btn-save">Save</button>
                      <button type="button" className="btn-cancel" onClick={() => set_editing_id(null)}>Cancel</button>
                    </form>
                  </td>
                </tr>
                ) : (
                <tr key={item_price._id}>
                  <td className="font-medium text-slate-800">{item_price.item_name}</td>
                  <td>
                    {item_price.branch ? (
                      <span className="badge-sky">{item_price.branch.name}</span>
                    ) : (
                      <span className="badge-violet">Shared</span>
                    )}
                  </td>
                  <td>{item_price.unit}</td>
                  <td>{format_currency(item_price.unit_cost)}</td>
                  <td>
                    <span className={item_price.is_active ? "badge-brand" : "badge-slate"}>
                      {item_price.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {!can_manage(item_price) ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400" title={is_locked ? "Your branch is inactive" : "Only an admin can change shared prices"}>
                        <LockClosedIcon className="h-3.5 w-3.5" /> {is_locked ? "Branch inactive" : "Admin only"}
                      </span>
                    ) : (
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn-edit" onClick={() => start_edit(item_price)}>
                        <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                      </button>
                      <StatusToggleButton is_active={item_price.is_active} onClick={() => handle_toggle_active(item_price)} />
                      <button
                        className="btn-delete"
                        onClick={() => handle_delete(item_price)}
                        title="Delete item"
                        aria-label={`Delete ${item_price.item_name}`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    )}
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
