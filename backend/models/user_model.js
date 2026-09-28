const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Represents a person who can log in: Staff, Manager, or Admin
const user_schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ["staff", "manager", "admin"], required: true, default: "staff" },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Hashes the password before saving, only when it changed
user_schema.pre("save", async function hash_password_before_save(next) {
  if (!this.isModified("password_hash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Checks a plain text password against the stored hash
user_schema.methods.check_password = function check_password(plain_text_password) {
  return bcrypt.compare(plain_text_password, this.password_hash);
};

module.exports = mongoose.model("User", user_schema);
