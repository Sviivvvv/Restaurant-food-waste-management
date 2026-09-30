const WasteReason = require("../models/waste_reason_model");

// Lists all waste reasons, optionally scoped to active ones only
async function list_waste_reasons(req, res, next) {
  try {
    const filter = {};
    if (req.query.active_only === "true") filter.is_active = true;

    const reasons = await WasteReason.find(filter).sort({ name: 1 });
    res.json(reasons);
  } catch (error) {
    next(error);
  }
}

// Admin only: adds a new waste reason
async function create_waste_reason(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const reason = await WasteReason.create({ name });
    res.status(201).json(reason);
  } catch (error) {
    // names are unique, so creating or renaming to an existing name is reported clearly
    if (error.code === 11000) {
      return res.status(409).json({ message: "A waste reason with this name already exists" });
    }
    next(error);
  }
}

// Admin only: renames, activates, or deactivates a waste reason
async function update_waste_reason(req, res, next) {
  try {
    const { name, is_active } = req.body;
    const reason = await WasteReason.findById(req.params.id);

    if (!reason) {
      return res.status(404).json({ message: "Waste reason not found" });
    }

    if (name !== undefined) reason.name = name;
    if (is_active !== undefined) reason.is_active = is_active;

    await reason.save();
    res.json(reason);
  } catch (error) {
    // names are unique, so creating or renaming to an existing name is reported clearly
    if (error.code === 11000) {
      return res.status(409).json({ message: "A waste reason with this name already exists" });
    }
    next(error);
  }
}

// Admin only: deactivates a waste reason instead of deleting it, so past waste entries
// that reference it stay resolvable. Waste reasons can only be activated or deactivated, never removed.
async function delete_waste_reason(req, res, next) {
  try {
    const reason = await WasteReason.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!reason) {
      return res.status(404).json({ message: "Waste reason not found" });
    }
    res.json({ message: "Waste reason deactivated" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_waste_reasons, create_waste_reason, update_waste_reason, delete_waste_reason };