// backend/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Product.deleteMany(); // Clear existing products

    // Construct path that works seamlessly on Windows PowerShell
    const filePath = path.join(__dirname, "..", "public", "data", "products.json");
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at: ${filePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(rawData);

    // Remove static JSON id so MongoDB generates native _id
    const formattedProducts = products.map(({ id, ...rest }) => rest);

    await Product.insertMany(formattedProducts);
    console.log("Data successfully imported to MongoDB!");
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

importData();