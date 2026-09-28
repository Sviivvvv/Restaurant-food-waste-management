import React, { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { list_item_prices_request } from "../api/item_price_api.js";
import { format_currency } from "../utils/format_currency.js";
import { useAuth } from "../context/auth_context.jsx";

// search and select box that only lets staff pick an item that already has a registered price,
// so a typo or an unpriced item can never reach the backend
export default function ItemPicker({ selected_item, on_select }) {
  const { current_user } = useAuth();
  const [items, set_items] = useState([]);
  const [search_text, set_search_text] = useState("");
  const [is_open, set_is_open] = useState(false);
  const box_ref = useRef(null);

  // loads the priced items available to this staff member's branch once
  useEffect(() => {
    list_item_prices_request({ branch: current_user.branch?._id, active_only: "true" }).then(set_items);
  }, [current_user.branch]);

  // closes the dropdown whenever a click lands outside the picker
  useEffect(() => {
    function handle_click_outside(event) {
      if (box_ref.current && !box_ref.current.contains(event.target)) set_is_open(false);
    }
    document.addEventListener("mousedown", handle_click_outside);
    return () => document.removeEventListener("mousedown", handle_click_outside);
  }, []);

  const filtered_items = items.filter((item) => item.item_name.toLowerCase().includes(search_text.toLowerCase()));

  function handle_select(item) {
    on_select(item);
    set_search_text("");
    set_is_open(false);
  }

  return (
    <div className="relative" ref={box_ref}>
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="input-field pl-10"
          placeholder={selected_item ? selected_item.item_name : "Search for an item"}
          value={search_text}
          onFocus={() => set_is_open(true)}
          onChange={(e) => {
            set_search_text(e.target.value);
            set_is_open(true);
          }}
        />
      </div>

      {is_open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered_items.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-slate-400">No priced items match, ask a manager to add one</p>
          ) : (
            filtered_items.map((item) => (
              <button
                key={item._id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-slate-50"
                onClick={() => handle_select(item)}
              >
                <span className="flex items-center gap-1.5 text-slate-800">
                  {selected_item?._id === item._id && <CheckCircleIcon className="h-3.5 w-3.5 text-brand-600" />}
                  {item.item_name}
                </span>
                <span className="text-slate-400">{format_currency(item.unit_cost)} / {item.unit}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
