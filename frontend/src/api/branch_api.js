import api_client from "./api_client";

// lists all restaurant branches
export function list_branches_request() {
  return api_client.get("/branches").then((res) => res.data);
}

// admin: registers a new branch
export function create_branch_request(branch_data) {
  return api_client.post("/branches", branch_data).then((res) => res.data);
}

// admin: updates a branch's details or regional manager
export function update_branch_request(branch_id, branch_data) {
  return api_client.put(`/branches/${branch_id}`, branch_data).then((res) => res.data);
}
