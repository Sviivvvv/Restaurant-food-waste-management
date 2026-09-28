const mongoose = require("mongoose");

// Standard cost of one unit of an ingredient or dish, used to calculate monetary loss
const item_price_schema = new mongoose.Schema(
  {
    item_name: { type: String, required: true, trim: true },
    unit: { type: String, enum: ["kg", "liter", "unit"], required: true },
    unit_cost: { type: Number, required: true, min: 0 },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// An item name should only appear once per branch (or once globally if branch is null)
item_price_schema.index({ item_name: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model("ItemPrice", item_price_schema);
