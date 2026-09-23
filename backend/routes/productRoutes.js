const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// @desc    Get all products or filter by category
// @route   GET /api/products
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching products", error: error.message });
  }
});

// @desc    Get single product by MongoDB ID
// @route   GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Invalid product ID or server error", error: error.message });
  }
});

// @desc    Add a new review to a product
// @route   POST /api/products/:id/reviews
router.post("/:id/reviews", async (req, res) => {
  try {
    const { user, rating, comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Review comment is required." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = {
      user: user || "Anonymous Customer",
      rating: Number(rating) || 5,
      comment: comment.trim(),
      createdAt: new Date(),
    };

    if (!product.reviews) {
      product.reviews = [];
    }

    product.reviews.push(newReview);
    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Error posting review", error: error.message });
  }
});

module.exports = router;