import { useAuth } from "../context/auth_context.jsx";
import React, { useEffect, useState } from "react";
import { DocumentPlusIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { create_waste_entry_request } from "../api/waste_entry_api.js";
import { list_categories_request } from "../api/category_api.js";
import { list_waste_reasons_request } from "../api/waste_reason_api.js";
import { format_currency } from "../utils/format_currency.js";
import ItemPicker from "../components/item_picker.jsx";

const empty_form = { category: "", reason: "", quantity_discarded: "", notes: "" };

// staff page: quick entry form to log a discarded item, categorize it, and select why it was wasted
export default function StaffRecordWastePage() {
  const { current_user } = useAuth();
  // staff at a deactivated branch can still open the page but cannot save (the server refuses too)
  const branch_is_inactive = current_user?.branch?.is_active === false;
  const [categories, set_categories] = useState([]);
  const [reasons, set_reasons] = useState([]);
  const [form, set_form] = useState(empty_form);
  const [selected_item, set_selected_item] = useState(null);
  const [is_submitting, set_is_submitting] = useState(false);
  const [success_message, set_success_message] = useState("");
  const [error_message, set_error_message] = useState("");

  // loads the dropdown options once when the page opens, active items only so a deactivated
  // category or reason can never be picked for a brand new entry
  useEffect(() => {
    list_categories_request({ active_only: "true" }).then(set_categories);
    list_waste_reasons_request({ active_only: "true" }).then(set_reasons);
  }, []);

  function handle_field_change(field, value) {
    set_form((prev) => ({ ...prev, [field]: value }));
  }

  // submits the waste entry, the backend resolves the unit cost from the selected item's registered price
  async function handle_submit(event) {
    event.preventDefault();
    set_error_message("");
    set_success_message("");

    if (!selected_item) {
      set_error_message("Pick an item from the list before saving");
      return;
    }

    set_is_submitting(true);
    try {
      await create_waste_entry_request({
        item_name: selected_item.item_name,
        category: form.category,
        reason: form.reason,
        quantity_discarded: Number(form.quantity_discarded),
        notes: form.notes
      });
      set_success_message("Waste entry recorded");
      set_form(empty_form);
      set_selected_item(null);
    } catch (error) {
      set_error_message(error.response?.data?.message || "Could not save this entry");
    } finally {
      set_is_submitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
          <DocumentPlusIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="page-title">Record Waste</h1>
          <p className="page-subtitle">Log an item as soon as it's thrown away</p>
        </div>
      </div>

      {branch_is_inactive && (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {current_user.branch.name} is inactive, so new waste entries cannot be recorded right now.
        </p>
      )}

      <form onSubmit={handle_submit} className={`card space-y-4 ${branch_is_inactive ? "opacity-60 pointer-events-none" : ""}`}>
        <div>
          <label className="label-text">Item</label>
          <ItemPicker selected_item={selected_item} on_select={set_selected_item} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Category</label>
            <select required className="input-field" value={form.category} onChange={(e) => handle_field_change("category", e.target.value)}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Reason</label>
            <select required className="input-field" value={form.reason} onChange={(e) => handle_field_change("reason", e.target.value)}>
              <option value="">Select reason</option>
              {reasons.map((reason) => (
                <option key={reason._id} value={reason._id}>{reason.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-text">Quantity</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              value={form.quantity_discarded}
              onChange={(e) => handle_field_change("quantity_discarded", e.target.value)}
            />
          </div>
          <div>
            <label className="label-text">Unit</label>
            <input className="input-field bg-slate-50 text-slate-500" value={selected_item?.unit || "-"} disabled />
          </div>
          <div>
            <label className="label-text">Unit cost</label>
            <input
              className="input-field bg-slate-50 text-slate-500"
              value={selected_item ? format_currency(selected_item.unit_cost) : "-"}
              disabled
            />
          </div>
        </div>

        <div>
          <label className="label-text">Notes (optional)</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.notes}
            onChange={(e) => handle_field_change("notes", e.target.value)}
          />
        </div>

        {success_message && (
          <p className="flex items-center gap-2 text-sm text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            <CheckCircleIcon className="h-4 w-4" /> {success_message}
          </p>
        )}
        {error_message && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error_message}</p>
        )}

        <button type="submit" disabled={is_submitting || branch_is_inactive} className="btn-primary w-full">
          {is_submitting ? "Saving..." : "Save entry"}
        </button>
      </form>
    </div>
  );
}