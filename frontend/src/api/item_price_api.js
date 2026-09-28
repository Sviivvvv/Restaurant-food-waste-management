import api_client from "./api_client";

// lists item prices, optionally filtered by branch
export function list_item_prices_request(filters = {}) {
  return api_client.get("/item-prices", { params: filters }).then((res) => res.data);
}

// manager: sets the standard unit cost for an item
export function create_item_price_request(item_price_data) {
  return api_client.post("/item-prices", item_price_data).then((res) => res.data);
}

// manager: updates an item price
export function update_item_price_request(item_price_id, item_price_data) {
  return api_client.put(`/item-prices/${item_price_id}`, item_price_data).then((res) => res.data);
}

// manager: removes an item price
export function delete_item_price_request(item_price_id) {
  return api_client.delete(`/item-prices/${item_price_id}`).then((res) => res.data);
}
