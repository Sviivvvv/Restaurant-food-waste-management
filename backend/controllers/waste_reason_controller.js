const WasteReason = require("../models/waste_reason_model");

// Lists all waste reasons shown on the staff quick entry screen
async function list_waste_reasons(req, res, next) {
  try {
    const reasons = await WasteReason.find().sort({ name: 1 });
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
    next(error);
  }
}

// Admin only: edits or removes a waste reason
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
    next(error);
  }
}

// Admin only: permanently deletes a waste reason
async function delete_waste_reason(req, res, next) {
  try {
    await WasteReason.findByIdAndDelete(req.params.id);
    res.json({ message: "Waste reason deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_waste_reasons, create_waste_reason, update_waste_reason, delete_waste_reason };
