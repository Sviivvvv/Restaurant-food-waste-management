import api_client from "./api_client";

// lists all waste categories, optionally filtered (e.g. { active_only: "true" })
export function list_categories_request(filters = {}) {
  return api_client.get("/categories", { params: filters }).then((res) => res.data);
}

// admin: adds a new waste category
export function create_category_request(category_data) {
  return api_client.post("/categories", category_data).then((res) => res.data);
}

// admin: edits a waste category
export function update_category_request(category_id, category_data) {
  return api_client.put(`/categories/${category_id}`, category_data).then((res) => res.data);
}

// admin: deactivates a waste category (soft delete, keeps past waste entries resolvable)
export function delete_category_request(category_id) {
  return api_client.delete(`/categories/${category_id}`).then((res) => res.data);
}