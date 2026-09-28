// Catches any error thrown in a route and returns it as a clean JSON response
function error_handler(error, req, res, next) {
  console.error(error);
  const status_code = error.status || 500;
  res.status(status_code).json({ message: error.message || "Something went wrong" });
}

// Runs when no route matches the request
function not_found_handler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

module.exports = { error_handler, not_found_handler };
