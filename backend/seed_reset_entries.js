// Run with: npm run seed:reset
// Deletes every waste entry, used to clear out bad sample data (for example entries that were
// seeded before the createdAt backdating bug was fixed and are all stamped with the same day).
// Does not touch accounts, branches, categories, waste reasons, or item prices.

require("dotenv").config();
const mongoose = require("mongoose");
const db_connect = require("./config/db_connect");
const WasteEntry = require("./models/waste_entry_model");

async function reset_entries() {
  await db_connect();
  const result = await WasteEntry.deleteMany({});
  console.log(`Deleted ${result.deletedCount} waste entries`);
  await mongoose.connection.close();
  process.exit(0);
}

reset_entries().catch((error) => {
  console.error("Resetting waste entries failed:", error);
  process.exit(1);
});
