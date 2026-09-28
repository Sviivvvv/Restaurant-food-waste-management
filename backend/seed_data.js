// Run with: npm run seed
// Creates starter accounts, two branches, categories, waste reasons, standard item prices,
// and a realistic spread of sample waste entries over the last 45 days, so the manager
// dashboard, reports, and charts have real data to show instead of being empty.

require("dotenv").config();
const mongoose = require("mongoose");
const db_connect = require("./config/db_connect");
const User = require("./models/user_model");
const Branch = require("./models/branch_model");
const Category = require("./models/category_model");
const WasteReason = require("./models/waste_reason_model");
const ItemPrice = require("./models/item_price_model");
const WasteEntry = require("./models/waste_entry_model");
const { item_catalog, weighted_catalog, random_between, pick_random, round_quantity } = require("./utils/seed_catalog");

async function seed() {
  await db_connect();

  // create two branches so the admin's branch filter has something real to filter between
  const branch_specs = [
    { name: "Main Branch", location: "Colombo" },
    { name: "Downtown Branch", location: "Colombo 03" }
  ];
  const branches = [];
  for (const spec of branch_specs) {
    let branch = await Branch.findOne({ name: spec.name });
    if (!branch) {
      branch = await Branch.create(spec);
      console.log(`Created branch: ${spec.name}`);
    }
    branches.push(branch);
  }
  const [main_branch, downtown_branch] = branches;

  // create the default admin account if it does not exist yet
  const admin_email = "admin@wastetracker.com";
  if (!(await User.findOne({ email: admin_email }))) {
    await User.create({
      name: "System Admin",
      email: admin_email,
      password_hash: "Admin@123",
      role: "admin",
      branch: main_branch._id
    });
    console.log(`Created default admin account: ${admin_email} / Admin@123`);
  }

  // one manager and one staff account per branch, so both branches have real activity
  const staff_users = {};
  const user_specs = [
    { name: "Sample Manager", email: "manager@wastetracker.com", password: "Manager@123", role: "manager", branch: main_branch },
    { name: "Sample Staff", email: "staff@wastetracker.com", password: "Staff@123", role: "staff", branch: main_branch },
    { name: "Downtown Manager", email: "downtown.manager@wastetracker.com", password: "Manager@123", role: "manager", branch: downtown_branch },
    { name: "Downtown Staff", email: "downtown.staff@wastetracker.com", password: "Staff@123", role: "staff", branch: downtown_branch }
  ];
  for (const spec of user_specs) {
    let user = await User.findOne({ email: spec.email });
    if (!user) {
      user = await User.create({
        name: spec.name,
        email: spec.email,
        password_hash: spec.password,
        role: spec.role,
        branch: spec.branch._id
      });
      console.log(`Created ${spec.role} account: ${spec.email} / ${spec.password}`);
    }
    if (spec.role === "staff") staff_users[spec.branch._id.toString()] = user;
  }

  // assign each branch's manager as its regional manager, matching a real setup
  const main_manager = await User.findOne({ email: "manager@wastetracker.com" });
  await Branch.updateOne({ _id: main_branch._id }, { regional_manager: main_manager._id });
  const downtown_manager = await User.findOne({ email: "downtown.manager@wastetracker.com" });
  await Branch.updateOne({ _id: downtown_branch._id }, { regional_manager: downtown_manager._id });

  // seed standard waste categories
  const category_names = ["Prep Waste", "Plate Waste", "Expired Inventory", "Overproduction", "Bar Waste"];
  for (const name of category_names) {
    if (!(await Category.findOne({ name }))) await Category.create({ name });
  }
  console.log("Seeded waste categories");

  // seed standard waste reasons
  const reason_names = ["Burnt", "Expired", "Dropped", "Customer Return", "Over Ordered", "Quality Issue"];
  for (const name of reason_names) {
    if (!(await WasteReason.findOne({ name }))) await WasteReason.create({ name });
  }
  console.log("Seeded waste reasons");

  // look up every category and reason once, so entry generation does not hit the database each time
  const categories_by_name = {};
  for (const category of await Category.find()) categories_by_name[category.name] = category;
  const reasons_by_name = {};
  for (const reason of await WasteReason.find()) reasons_by_name[reason.name] = reason;

  // seed one global item price per catalog item, this is what the manager's Item Prices page will show
  const existing_item_price_count = await ItemPrice.countDocuments();
  if (existing_item_price_count === 0) {
    for (const item of item_catalog) {
      await ItemPrice.create({ item_name: item.name, unit: item.unit, unit_cost: item.cost, branch: null });
    }
    console.log(`Seeded ${item_catalog.length} item prices`);
  } else {
    console.log("Item prices already exist, skipping");
  }

  // generate sample waste entries for the last 45 days, only if none exist yet
  const existing_entry_count = await WasteEntry.countDocuments();
  if (existing_entry_count > 0) {
    console.log("Waste entries already exist, skipping sample data generation");
  } else {
    const days_of_history = 45;
    const today = new Date();
    const entry_specs = [];

    // build the full list of entries to create first, so we know the total count up front
    for (let day_offset = days_of_history - 1; day_offset >= 0; day_offset--) {
      for (const branch of branches) {
        const entries_today = Math.floor(random_between(0, 4)); // 0 to 3 entries per branch per day
        for (let i = 0; i < entries_today; i++) {
          const item = pick_random(weighted_catalog);
          const category_name = pick_random(item.categories);
          const reason_name = pick_random(item.reasons);
          const quantity = round_quantity(random_between(item.range[0], item.range[1]), item.unit);

          // spread entries across restaurant operating hours, 8am to 11pm
          const entry_date = new Date(today);
          entry_date.setDate(entry_date.getDate() - day_offset);
          entry_date.setHours(Math.floor(random_between(8, 23)), Math.floor(random_between(0, 60)), 0, 0);

          entry_specs.push({
            _id: new mongoose.Types.ObjectId(),
            item_name: item.name,
            category: categories_by_name[category_name]._id,
            reason: reasons_by_name[reason_name]._id,
            branch: branch._id,
            recorded_by: staff_users[branch._id.toString()]._id,
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
    console.log(`Seeded ${entry_specs.length} sample waste entries across ${days_of_history} days`);
  }

  console.log("Seeding complete");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
