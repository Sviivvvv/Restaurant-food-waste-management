const mongoose = require("mongoose");

// Reason an item was thrown away, for example burnt, expired, dropped, customer return
const waste_reason_schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WasteReason", waste_reason_schema);
