import React, { useEffect, useState } from "react";
import { TagIcon, PlusIcon, TrashIcon, ArchiveBoxIcon } from "@heroicons/react/24/solid";
import LoadingSpinner from "../components/loading_spinner.jsx";
import {
  list_item_prices_request,
  create_item_price_request,
  update_item_price_request,
  delete_item_price_request
} from "../api/item_price_api.js";
import { format_currency } from "../utils/format_currency.js";

const empty_form = { item_name: "", unit: "kg", unit_cost: "" };

// manager page: defines the standard unit cost for each ingredient or dish
export default function ManagerItemPricesPage() {
  const [item_prices, set_item_prices] = useState([]);
  const [form, set_form] = useState(empty_form);
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState("");

  function load_item_prices() {
    set_is_loading(true);
    list_item_prices_request()
      .then(set_item_prices)
      .finally(() => set_is_loading(false));
  }

  useEffect(load_item_prices, []);

  // adds a new item price using the values in the form
  async function handle_submit(event) {
    event.preventDefault();
    set_error_message("");
    try {
      await create_item_price_request({ ...form, unit_cost: Number(form.unit_cost) });
      set_form(empty_form);
      load_item_prices();
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not save this item price");
    }
  }

  // toggles an item price between active and inactive
  async function handle_toggle_active(item_price) {
    await update_item_price_request(item_price._id, { is_active: !item_price.is_active });
    load_item_prices();
  }

  // permanently removes an item price
  async function handle_delete(item_price_id) {
    await delete_item_price_request(item_price_id);
    load_item_prices();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <TagIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Item Prices</h1>
          <p className="page-subtitle">Standard unit costs used to calculate monetary loss</p>
        </div>
      </div>

      <form onSubmit={handle_submit} className="card flex flex-wrap gap-4 items-end mb-6">
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Cost per unit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {item_prices.map((item_price) => (
                <tr key={item_price._id}>
                  <td className="font-medium text-slate-800">{item_price.item_name}</td>
                  <td>{item_price.unit}</td>
                  <td>{format_currency(item_price.unit_cost)}</td>
                  <td>
                    <span className={item_price.is_active ? "badge-brand" : "badge-slate"}>
                      {item_price.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button className="text-sm font-medium text-brand-700 hover:underline" onClick={() => handle_toggle_active(item_price)}>
                        {item_price.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button className="btn-danger-text" onClick={() => handle_delete(item_price._id)}>
                        <TrashIcon className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
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
