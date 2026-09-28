const User = require("../models/user_model");
const generate_token = require("../utils/generate_token");

// Logs a user in with email and password, returns the user and a login token
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate("branch", "name");

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const password_matches = await user.check_password(password);
    if (!password_matches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generate_token(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch
      }
    });
  } catch (error) {
    next(error);
  }
}

// Returns the currently logged in user, used by the frontend to restore a session
async function get_current_user(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-password_hash").populate("branch", "name");
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { login, get_current_user };
