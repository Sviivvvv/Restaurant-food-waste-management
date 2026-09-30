const Branch = require("../models/branch_model");

// Lists all branches
async function list_branches(req, res, next) {
  try {
    const branches = await Branch.find().populate("regional_manager", "name email").sort({ name: 1 });
    res.json(branches);
  } catch (error) {
    next(error);
  }
}

// Admin only: registers a new restaurant location
async function create_branch(req, res, next) {
  try {
    const { name, location, regional_manager } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }
    const branch = await Branch.create({ name, location, regional_manager: regional_manager || null });
    res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
}

// Admin only: edits a branch's name or location, assigns a regional manager, or activates/deactivates it.
// Branches are never deleted: waste entries and users reference them, so deactivating keeps history intact.
async function update_branch(req, res, next) {
  try {
    const { name, location, regional_manager, is_active } = req.body;
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    if (name !== undefined) branch.name = name;
    if (location !== undefined) branch.location = location;
    if (regional_manager !== undefined) branch.regional_manager = regional_manager || null;
    if (is_active !== undefined) branch.is_active = is_active;

    await branch.save();
    res.json(branch);
  } catch (error) {
    next(error);
  }
}

module.exports = { list_branches, create_branch, update_branch };
