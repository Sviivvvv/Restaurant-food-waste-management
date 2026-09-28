require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db_connect = require("./config/db_connect");
const { error_handler, not_found_handler } = require("./middleware/error_middleware");

const auth_routes = require("./routes/auth_routes");
const user_routes = require("./routes/user_routes");
const branch_routes = require("./routes/branch_routes");
const category_routes = require("./routes/category_routes");
const waste_reason_routes = require("./routes/waste_reason_routes");
const item_price_routes = require("./routes/item_price_routes");
const waste_entry_routes = require("./routes/waste_entry_routes");
const report_routes = require("./routes/report_routes");

const app = express();

// connects to MongoDB Atlas before the server starts handling requests
db_connect();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

// simple route to check the api is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "waste-tracker-backend" });
});

app.use("/api/auth", auth_routes);
app.use("/api/users", user_routes);
app.use("/api/branches", branch_routes);
app.use("/api/categories", category_routes);
app.use("/api/waste-reasons", waste_reason_routes);
app.use("/api/item-prices", item_price_routes);
app.use("/api/waste-entries", waste_entry_routes);
app.use("/api/reports", report_routes);

app.use(not_found_handler);
app.use(error_handler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Waste tracker backend running on port ${port}`);
});
