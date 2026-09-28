import api_client from "./api_client";

// lists all waste reasons, optionally filtered (e.g. { active_only: "true" })
export function list_waste_reasons_request(filters = {}) {
  return api_client.get("/waste-reasons", { params: filters }).then((res) => res.data);
}

// admin: adds a new waste reason
export function create_waste_reason_request(reason_data) {
  return api_client.post("/waste-reasons", reason_data).then((res) => res.data);
}

// admin: edits a waste reason
export function update_waste_reason_request(reason_id, reason_data) {
  return api_client.put(`/waste-reasons/${reason_id}`, reason_data).then((res) => res.data);
}

// admin: deactivates a waste reason (soft delete, keeps past waste entries resolvable)
export function delete_waste_reason_request(reason_id) {
  return api_client.delete(`/waste-reasons/${reason_id}`).then((res) => res.data);
}