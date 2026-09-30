const User = require("../models/user_model");

// Admin only: lists all users, optionally filtered by role or branch
async function list_users(req, res, next) {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.branch) filter.branch = req.query.branch;

    const users = await User.find(filter).select("-password_hash").populate("branch", "name").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

// Admin only: creates a new staff, manager, or admin account
async function create_user(req, res, next) {
  try {
    const { name, email, password, role, branch } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    const existing_user = await User.findOne({ email: email.toLowerCase() });
    if (existing_user) {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    const new_user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash: password,
      role,
      branch: branch || null
    });

    res.status(201).json({
      id: new_user._id,
      name: new_user.name,
      email: new_user.email,
      role: new_user.role,
      branch: new_user.branch
    });
  } catch (error) {
    next(error);
  }
}

// Admin only: updates a user's name, email, role, branch, password, or active status
async function update_user(req, res, next) {
  try {
    const { name, email, role, branch, is_active, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // an email change must not collide with another account, since email is the login identifier
    if (email !== undefined && email.toLowerCase() !== user.email) {
      const taken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (taken) {
        return res.status(409).json({ message: "A user with this email already exists" });
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (branch !== undefined) user.branch = branch || null;
    if (is_active !== undefined) user.is_active = is_active;
    if (password) user.password_hash = password;

    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, branch: user.branch, is_active: user.is_active });
  } catch (error) {
    next(error);
  }
}

// Admin only: deactivates a user instead of deleting them, so their past waste entries stay linked
async function deactivate_user(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deactivated" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_users, create_user, update_user, deactivate_user };
