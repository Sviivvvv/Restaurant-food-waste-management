const mongoose = require("mongoose");

// Waste category, for example Prep, Plate, Bar, Spoilage
const category_schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", category_schema);
