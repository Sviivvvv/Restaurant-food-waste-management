import api_client from "./api_client";

// sends email and password to the backend, returns the token and user
export function login_request(email, password) {
  return api_client.post("/auth/login", { email, password }).then((res) => res.data);
}

// asks the backend who the current logged in user is, used to restore a session on refresh
export function get_current_user_request() {
  return api_client.get("/auth/me").then((res) => res.data);
}
