const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

// Checks that a valid login token was sent, and attaches the logged in user to the request
async function require_login(req, res, next) {
  try {
    const auth_header = req.headers.authorization || "";
    const token = auth_header.startsWith("Bearer ") ? auth_header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "No login token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const current_user = await User.findById(decoded.id).select("-password_hash");

    if (!current_user || !current_user.is_active) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }

    req.user = current_user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired login token" });
  }
}

module.exports = require_login;
