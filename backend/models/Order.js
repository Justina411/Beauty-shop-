const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerEmail: {
      type: String,
      required: true,
    },
    items: [
      {
        id: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      default: "success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);