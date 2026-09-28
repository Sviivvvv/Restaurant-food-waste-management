const mongoose = require("mongoose");

// Represents one restaurant location
const branch_schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    regional_manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branch", branch_schema);
