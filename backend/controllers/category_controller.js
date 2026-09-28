const Category = require("../models/category_model");

// Lists all waste categories
async function list_categories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
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
    next(error);
  }
}

// Admin only: edits or removes a waste category
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
    next(error);
  }
}

// Admin only: permanently deletes a category
async function delete_category(req, res, next) {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { list_categories, create_category, update_category, delete_category };
