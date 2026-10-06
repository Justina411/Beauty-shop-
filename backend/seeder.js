// backend/seeder.js
require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI
  ? process.env.MONGO_URI.trim().replace(/^["']|["']$/g, "")
  : null;

if (!MONGO_URI) {
  console.error("❌ Fatal Error: MONGO_URI is missing in process.env");
  process.exit(1);
}

const importData = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Successfully connected to MongoDB!");

    await Product.deleteMany(); // Clear existing products

    const filePath = path.join(__dirname, "..", "public", "data", "products.json");

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found at: ${filePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(rawData);

    // Remove static JSON id so MongoDB generates native _id
    const formattedProducts = products.map(({ id, ...rest }) => rest);

    await Product.insertMany(formattedProducts);
    console.log("🎉 Data successfully imported to MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

importData();