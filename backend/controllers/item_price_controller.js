const ItemPrice = require("../models/item_price_model");

// Lists item prices, optionally scoped to a branch and to active items only.
// When a branch is given, shared (branch: null) items are included too, and a branch
// specific price for the same item name overrides the shared one so each name appears once.
async function list_item_prices(req, res, next) {
  try {
    const filter = {};
    if (req.query.branch) filter.$or = [{ branch: req.query.branch }, { branch: null }];
    if (req.query.active_only === "true") filter.is_active = true;

    let item_prices = await ItemPrice.find(filter).populate("branch", "name").sort({ item_name: 1 });

    if (req.query.branch) {
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

// Manager only: defines the standard unit cost for an ingredient or dish
async function create_item_price(req, res, next) {
  try {
    const { item_name, unit, unit_cost, branch } = req.body;
    if (!item_name || !unit || unit_cost === undefined) {
      return res.status(400).json({ message: "Item name, unit, and unit cost are required" });
    }
    const item_price = await ItemPrice.create({ item_name, unit, unit_cost, branch: branch || null });
    res.status(201).json(item_price);
  } catch (error) {
    next(error);
  }
}

// Manager only: updates an existing item price
async function update_item_price(req, res, next) {
  try {
    const { item_name, unit, unit_cost, is_active } = req.body;
    const item_price = await ItemPrice.findById(req.params.id);

    if (!item_price) {
      return res.status(404).json({ message: "Item price not found" });
    }

    if (item_name !== undefined) item_price.item_name = item_name;
    if (unit !== undefined) item_price.unit = unit;
    if (unit_cost !== undefined) item_price.unit_cost = unit_cost;
    if (is_active !== undefined) item_price.is_active = is_active;

    await item_price.save();
    res.json(item_price);
  } catch (error) {
    next(error);
  }
}

// Manager only: permanently deletes an item price. Safe to hard delete because waste
// entries store their own copy of item_name and unit_cost, not a reference to this record.
async function delete_item_price(req, res, next) {
  try {
    const item_price = await ItemPrice.findByIdAndDelete(req.params.id);
    if (!item_price) {
      return res.status(404).json({ message: "Item price not found" });
    }
    res.json({ message: "Item price deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_item_prices, create_item_price, update_item_price, delete_item_price };