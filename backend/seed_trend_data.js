// Run with: npm run seed:trend (optionally: npm run seed:trend -- 60 for 60 days)
// Adds extra backdated waste entries over the recent past, on top of whatever already exists,
// so the dashboard trend chart has a full month (or more) of history to plot. This does not
// touch branches, users, categories, reasons, or item prices, it only appends waste entries,
// and it never skips based on existing counts the way seed_data.js does.

require("dotenv").config();
const mongoose = require("mongoose");
const db_connect = require("./config/db_connect");
const Branch = require("./models/branch_model");
const User = require("./models/user_model");
const Category = require("./models/category_model");
const WasteReason = require("./models/waste_reason_model");
const WasteEntry = require("./models/waste_entry_model");
const { weighted_catalog, random_between, pick_random, round_quantity } = require("./utils/seed_catalog");

async function seed_trend_data() {
  await db_connect();

  const days_of_history = Number(process.argv[2]) || 30;

  const branches = await Branch.find();
  const categories = await Category.find();
  const reasons = await WasteReason.find();

  if (branches.length === 0 || categories.length === 0 || reasons.length === 0) {
    console.error("No branches, categories, or waste reasons found, run npm run seed first");
    await mongoose.connection.close();
    process.exit(1);
  }

  // one staff member per branch to record entries as, falls back to any user on that branch
  const staff_by_branch = {};
  for (const branch of branches) {
    const staff = (await User.findOne({ branch: branch._id, role: "staff" })) || (await User.findOne({ branch: branch._id }));
    if (staff) staff_by_branch[branch._id.toString()] = staff;
  }

  const categories_by_name = {};
  for (const category of categories) categories_by_name[category.name] = category;
  const reasons_by_name = {};
  for (const reason of reasons) reasons_by_name[reason.name] = reason;

  const today = new Date();
  const entry_specs = [];

  for (let day_offset = days_of_history - 1; day_offset >= 0; day_offset--) {
    for (const branch of branches) {
      const staff = staff_by_branch[branch._id.toString()];
      if (!staff) continue;

      const entries_today = Math.floor(random_between(1, 4)); // 1 to 3 entries per branch per day, always some activity
      for (let i = 0; i < entries_today; i++) {
        const item = pick_random(weighted_catalog);
        const category_name = pick_random(item.categories);
        const reason_name = pick_random(item.reasons);
        const quantity = round_quantity(random_between(item.range[0], item.range[1]), item.unit);

        const entry_date = new Date(today);
        entry_date.setDate(entry_date.getDate() - day_offset);
        entry_date.setHours(Math.floor(random_between(8, 23)), Math.floor(random_between(0, 60)), 0, 0);

        entry_specs.push({
          _id: new mongoose.Types.ObjectId(),
          item_name: item.name,
          category: categories_by_name[category_name]._id,
          reason: reasons_by_name[reason_name]._id,
          branch: branch._id,
          recorded_by: staff._id,
          quantity_discarded: quantity,
          unit: item.unit,
          unit_cost: item.cost,
          total_monetary_loss: quantity * item.cost,
          notes: "",
          createdAt: entry_date,
          updatedAt: entry_date
        });
      }
    }
  }

  // inserted through the raw driver (WasteEntry.collection), not WasteEntry.create(), because
  // Mongoose marks createdAt as immutable whenever timestamps is on, so a normal create() followed
  // by an update to back-date it gets silently ignored and every entry ends up stamped with today
  const batch_size = 200;
  for (let i = 0; i < entry_specs.length; i += batch_size) {
    await WasteEntry.collection.insertMany(entry_specs.slice(i, i + batch_size));
  }

  console.log(`Added ${entry_specs.length} waste entries across the last ${days_of_history} days`);
  await mongoose.connection.close();
  process.exit(0);
}

seed_trend_data().catch((error) => {
  console.error("Adding trend data failed:", error);
  process.exit(1);
});
