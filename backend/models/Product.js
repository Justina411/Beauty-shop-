const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 50 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);