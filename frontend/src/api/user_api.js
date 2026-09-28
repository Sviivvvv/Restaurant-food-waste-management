import api_client from "./api_client";

// admin: lists all user accounts
export function list_users_request() {
  return api_client.get("/users").then((res) => res.data);
}

// admin: creates a new staff, manager, or admin account
export function create_user_request(user_data) {
  return api_client.post("/users", user_data).then((res) => res.data);
}

// admin: updates a user's role, branch, name, or active state
export function update_user_request(user_id, user_data) {
  return api_client.put(`/users/${user_id}`, user_data).then((res) => res.data);
}

// admin: deactivates a user account instead of deleting it
export function deactivate_user_request(user_id) {
  return api_client.patch(`/users/${user_id}/deactivate`).then((res) => res.data);
}
