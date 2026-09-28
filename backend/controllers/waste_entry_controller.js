const mongoose = require("mongoose");
const WasteEntry = require("../models/waste_entry_model");
const ItemPrice = require("../models/item_price_model");

// Builds a MongoDB filter object from the query string, shared by list endpoints and report aggregations.
// Values are cast to ObjectId here because aggregate() does not auto cast the way find() does,
// so a raw string would silently match nothing once a specific branch, category, or reason is picked.
function build_filter(query) {
  const filter = {};

  if (query.branch && mongoose.Types.ObjectId.isValid(query.branch)) filter.branch = new mongoose.Types.ObjectId(query.branch);
  if (query.category && mongoose.Types.ObjectId.isValid(query.category)) filter.category = new mongoose.Types.ObjectId(query.category);
  if (query.reason && mongoose.Types.ObjectId.isValid(query.reason)) filter.reason = new mongoose.Types.ObjectId(query.reason);
  if (query.recorded_by && mongoose.Types.ObjectId.isValid(query.recorded_by)) filter.recorded_by = new mongoose.Types.ObjectId(query.recorded_by);

  if (query.start_date || query.end_date) {
    filter.createdAt = {};
    if (query.start_date) filter.createdAt.$gte = new Date(query.start_date);
    if (query.end_date) filter.createdAt.$lte = new Date(query.end_date);
  }

  return filter;
}

// Finds the registered price for an item, a branch specific price always wins over a shared one
async function resolve_item_price(item_name, branch) {
  const branch_price = await ItemPrice.findOne({ item_name, branch, is_active: true });
  if (branch_price) return branch_price;
  return ItemPrice.findOne({ item_name, branch: null, is_active: true });
}

// Staff: records a new waste entry, unit and unit cost always come from the registered item catalog
async function create_waste_entry(req, res, next) {
  try {
    const { item_name, category, reason, quantity_discarded, notes } = req.body;

    if (!item_name || !category || !reason || !quantity_discarded) {
      return res.status(400).json({ message: "Item name, category, reason, and quantity are required" });
    }

    const item_price = await resolve_item_price(item_name, req.user.branch);

    if (!item_price) {
      return res.status(400).json({ message: "This item has no registered price, ask a manager to add one before logging it" });
    }

    const entry = await WasteEntry.create({
      item_name,
      category,
      reason,
      branch: req.user.branch,
      recorded_by: req.user._id,
      quantity_discarded,
      unit: item_price.unit,
      unit_cost: item_price.unit_cost,
      total_monetary_loss: quantity_discarded * item_price.unit_cost,
      notes: notes || ""
    });

    const populated_entry = await entry.populate([
      { path: "category", select: "name" },
      { path: "reason", select: "name" }
    ]);

    res.status(201).json(populated_entry);
  } catch (error) {
    next(error);
  }
}

// Staff: lists only the entries the logged in user recorded, for their own shift log
async function list_my_entries(req, res, next) {
  try {
    const filter = build_filter(req.query);
    filter.recorded_by = req.user._id;

    const entries = await WasteEntry.find(filter)
      .populate("category", "name")
      .populate("reason", "name")
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    next(error);
  }
}

// Manager and Admin: lists every waste entry, with optional filters from the query string
async function list_all_entries(req, res, next) {
  try {
    const filter = build_filter(req.query);

    const entries = await WasteEntry.find(filter)
      .populate("category", "name")
      .populate("reason", "name")
      .populate("branch", "name")
      .populate("recorded_by", "name")
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    next(error);
  }
}

// Staff: lets the person who created an entry fix a mistake shortly after logging it.
// unit and unit_cost are never accepted from the client, they are re-resolved from the item catalog
// whenever the item name changes so a stale or fabricated price can never be saved.
async function update_my_entry(req, res, next) {
  try {
    const entry = await WasteEntry.findOne({ _id: req.params.id, recorded_by: req.user._id });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found or not yours to edit" });
    }

    const { item_name, category, reason, quantity_discarded, notes } = req.body;

    if (item_name !== undefined && item_name !== entry.item_name) {
      const item_price = await resolve_item_price(item_name, entry.branch);
      if (!item_price) {
        return res.status(400).json({ message: "This item has no registered price, ask a manager to add one before logging it" });
      }
      entry.item_name = item_name;
      entry.unit = item_price.unit;
      entry.unit_cost = item_price.unit_cost;
    }

    if (category !== undefined) entry.category = category;
    if (reason !== undefined) entry.reason = reason;
    if (quantity_discarded !== undefined) entry.quantity_discarded = quantity_discarded;
    if (notes !== undefined) entry.notes = notes;

    await entry.save();
    res.json(entry);
  } catch (error) {
    next(error);
  }
}

module.exports = { create_waste_entry, list_my_entries, list_all_entries, update_my_entry, build_filter };
