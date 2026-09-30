const Category = require("../models/category_model");

// Lists all waste categories, optionally scoped to active ones only
async function list_categories(req, res, next) {
  try {
    const filter = {};
    if (req.query.active_only === "true") filter.is_active = true;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

// Admin only: adds a new waste category
async function create_category(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    // names are unique, so creating or renaming to an existing name is reported clearly
    if (error.code === 11000) {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
    next(error);
  }
}

// Admin only: renames, activates, or deactivates a waste category
async function update_category(req, res, next) {
  try {
    const { name, description, is_active } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();
    res.json(category);
  } catch (error) {
    // names are unique, so creating or renaming to an existing name is reported clearly
    if (error.code === 11000) {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
    next(error);
  }
}

// Admin only: deactivates a category instead of deleting it, so past waste entries
// that reference it stay resolvable. Categorys can only be activated or deactivated, never removed.
async function delete_category(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deactivated" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_categories, create_category, update_category, delete_category };