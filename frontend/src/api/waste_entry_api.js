import api_client from "./api_client";

// staff: submits a new waste entry
export function create_waste_entry_request(entry_data) {
  return api_client.post("/waste-entries", entry_data).then((res) => res.data);
}

// staff: gets only the entries the logged in user recorded, filters is an object of query params
export function list_my_entries_request(filters = {}) {
  return api_client.get("/waste-entries/mine", { params: filters }).then((res) => res.data);
}

// staff: fixes a mistake in one of their own entries
export function update_my_entry_request(entry_id, entry_data) {
  return api_client.put(`/waste-entries/mine/${entry_id}`, entry_data).then((res) => res.data);
}

// manager and admin: gets every waste entry, filters is an object of query params
export function list_all_entries_request(filters = {}) {
  return api_client.get("/waste-entries", { params: filters }).then((res) => res.data);
}
