const mongoose = require("mongoose");

// Connects to the MongoDB Atlas database using the URI from the .env file
async function db_connect() {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = db_connect;
