import api_client from "./api_client";

// gets total loss, total weight, and breakdowns by category and reason
export function get_summary_request(filters = {}) {
  return api_client.get("/reports/summary", { params: filters }).then((res) => res.data);
}

// gets the top wasted items ranked by weight and by dollar loss
export function get_top_items_request(filters = {}) {
  return api_client.get("/reports/top-items", { params: filters }).then((res) => res.data);
}

// gets daily totals for the waste trend line chart
export function get_trends_request(filters = {}) {
  return api_client.get("/reports/trends", { params: filters }).then((res) => res.data);
}
