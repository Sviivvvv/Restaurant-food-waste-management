const mongoose = require("mongoose");

// One record of food being discarded, entered by a staff member
const waste_entry_schema = new mongoose.Schema(
  {
    item_name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    reason: { type: mongoose.Schema.Types.ObjectId, ref: "WasteReason", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity_discarded: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["kg", "liter", "unit"], required: true },
    unit_cost: { type: Number, required: true, min: 0 },
    total_monetary_loss: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

// Recalculates the monetary loss before validation runs, so it always matches quantity and cost.
// This must be pre("validate") rather than pre("save"): Mongoose validates required fields
// before save hooks run, so a save hook here would be too late for a brand new document that
// did not already have total_monetary_loss set, and validation would fail first.
waste_entry_schema.pre("validate", function calculate_total_loss(next) {
  this.total_monetary_loss = this.quantity_discarded * this.unit_cost;
  next();
});

// Helpful indexes for the manager's filters and trend reports
waste_entry_schema.index({ branch: 1, createdAt: -1 });
waste_entry_schema.index({ category: 1 });
waste_entry_schema.index({ reason: 1 });
waste_entry_schema.index({ recorded_by: 1 });

module.exports = mongoose.model("WasteEntry", waste_entry_schema);
