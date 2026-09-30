const ItemPrice = require("../models/item_price_model");
const Branch = require("../models/branch_model");

// id of the branch a non-admin user belongs to, as a string (null if none assigned)
function own_branch_id(user) {
  return user.branch ? String(user.branch._id || user.branch) : null;
}

// a manager at a deactivated branch can still read prices but cannot change them; admins are never blocked
async function blocked_by_inactive_branch(user) {
  if (user.role === "admin") return false;
  const branch = user.branch ? await Branch.findById(user.branch._id || user.branch).select("is_active") : null;
  return !branch || !branch.is_active;
}
const INACTIVE_MESSAGE = "Your branch is not active, so item prices cannot be changed";

// managers may only change prices that belong to their own branch; shared (branch: null)
// prices and other branches' prices are admin-only, since changing them affects other locations
function can_manage(user, item_price) {
  if (user.role === "admin") return true;
  return item_price.branch !== null && String(item_price.branch) === own_branch_id(user);
}

// Lists item prices, optionally scoped to a branch and to active items only.
// Admins can see any branch; everyone else is always scoped to their own branch plus shared items.
// When a branch is passed explicitly (the staff item picker), a branch specific price for the same
// item name overrides the shared one so each name appears once; the management page shows both.
async function list_item_prices(req, res, next) {
  try {
    const filter = {};
    const branch = req.user.role === "admin" ? req.query.branch : own_branch_id(req.user);
    if (branch) filter.$or = [{ branch }, { branch: null }];
    else if (req.user.role !== "admin") filter.branch = null;
    if (req.query.active_only === "true") filter.is_active = true;

    let item_prices = await ItemPrice.find(filter).populate("branch", "name").sort({ item_name: 1 });

    if (branch && req.query.branch) {
      const by_name = new Map();
      for (const item_price of item_prices) {
        const existing = by_name.get(item_price.item_name);
        if (!existing || (item_price.branch && !existing.branch)) {
          by_name.set(item_price.item_name, item_price);
        }
      }
      item_prices = [...by_name.values()].sort((a, b) => a.item_name.localeCompare(b.item_name));
    }

    res.json(item_prices);
  } catch (error) {
    next(error);
  }
}

// Manager or Admin: defines the standard unit cost for an ingredient or dish
async function create_item_price(req, res, next) {
  try {
    const { item_name, unit, unit_cost, branch } = req.body;
    if (!item_name || !unit || unit_cost === undefined) {
      return res.status(400).json({ message: "Item name, unit, and unit cost are required" });
    }
    if (await blocked_by_inactive_branch(req.user)) {
      return res.status(403).json({ message: INACTIVE_MESSAGE });
    }
    // managers always price for their own branch; only an admin can create a shared price or pick a branch
    const target_branch = req.user.role === "admin" ? branch || null : own_branch_id(req.user);
    if (req.user.role !== "admin" && !target_branch) {
      return res.status(403).json({ message: "You need to be assigned to a branch to add item prices" });
    }
    const item_price = await ItemPrice.create({ item_name, unit, unit_cost, branch: target_branch });
    res.status(201).json(item_price);
  } catch (error) {
    // compound unique index on (item_name, branch): the same item already has a price at this branch
    if (error.code === 11000) {
      return res.status(409).json({ message: "This item already has a price for this branch" });
    }
    next(error);
  }
}

// Manager (own branch only) or Admin: edits an item's name, unit, or cost, or activates/deactivates it
async function update_item_price(req, res, next) {
  try {
    const { item_name, unit, unit_cost, is_active } = req.body;
    const item_price = await ItemPrice.findById(req.params.id);

    if (!item_price) {
      return res.status(404).json({ message: "Item price not found" });
    }
    if (!can_manage(req.user, item_price)) {
      return res.status(403).json({ message: "Shared and other branches' prices can only be changed by an admin" });
    }
    if (await blocked_by_inactive_branch(req.user)) {
      return res.status(403).json({ message: INACTIVE_MESSAGE });
    }

    if (item_name !== undefined) item_price.item_name = item_name;
    if (unit !== undefined) item_price.unit = unit;
    if (unit_cost !== undefined) item_price.unit_cost = unit_cost;
    if (is_active !== undefined) item_price.is_active = is_active;

    await item_price.save();
    res.json(item_price);
  } catch (error) {
    // renaming to an item that already has a price at the same branch hits the (item_name, branch) unique index
    if (error.code === 11000) {
      return res.status(409).json({ message: "This item already has a price for this branch" });
    }
    next(error);
  }
}

// Manager only: permanently deletes an item price. Safe to hard delete because waste
// entries store their own copy of item_name and unit_cost, not a reference to this record.
async function delete_item_price(req, res, next) {
  try {
    const item_price = await ItemPrice.findById(req.params.id);
    if (!item_price) {
      return res.status(404).json({ message: "Item price not found" });
    }
    if (!can_manage(req.user, item_price)) {
      return res.status(403).json({ message: "Shared and other branches' prices can only be deleted by an admin" });
    }
    if (await blocked_by_inactive_branch(req.user)) {
      return res.status(403).json({ message: INACTIVE_MESSAGE });
    }
    await item_price.deleteOne();
    res.json({ message: "Item price deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_item_prices, create_item_price, update_item_price, delete_item_price };