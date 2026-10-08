import React, { useState } from "react";
import { API_BASE } from "../apiConfig";
import { useCart } from "../Context/CartContext";
import "../styles/cart.css";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  // Helper to reliably get product ID
  const getItemId = (item) => String(item._id || item.id);

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce(
      (acc, item) =>
        acc +
        (Number(item.price) || 0) *
          (Number(item.quantity) || 1),
      0
    );
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setCheckoutMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          total: calculateTotal(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Checkout failed. Please try again."
        );
      }

      // Clear cart through CartContext
      clearCart();

      setCheckoutMessage(
        "Order placed successfully! Thank you."
      );
    } catch (err) {
      setCheckoutMessage(
        err.message ||
          "An error occurred during checkout."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EMPTY CART
  // =========================

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Your Shopping Cart</h2>

          <p>
            Your cart is empty. Add some beautiful
            products to get started!
          </p>

          <a
            href="/shop"
            className="continue-shopping"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* =========================
          TITLE
      ========================= */}

      <h1 className="cart-title">
        Your Shopping Cart
      </h1>

      {/* =========================
          SHIPPING PROGRESS
      ========================= */}

      <div className="shipping-top">
        <p>
          You're on your way to receiving your
          beauty essentials!
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: "70%",
            }}
          ></div>
        </div>
      </div>

      {/* =========================
          CART LAYOUT
      ========================= */}

      <div className="cart-container">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="cart-left">

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item) => {
                const itemId = getItemId(item);
                const quantity =
                  Number(item.quantity) || 1;
                const price =
                  Number(item.price) || 0;

                return (
                  <tr
                    key={`${itemId}-${
                      item.selectedSize ||
                      "default"
                    }`}
                  >

                    {/* PRODUCT */}
                    <td>
                      <div className="product-information">

                        <img
                          src={
                            item.image ||
                            "/images/placeholder.jpg"
                          }
                          alt={
                            item.title ||
                            item.name ||
                            "Product"
                          }
                        />

                        <div>
                          <h4>
                            {item.title ||
                              item.name}
                          </h4>

                          {item.selectedSize && (
                            <p>
                              Size:{" "}
                              {item.selectedSize}
                            </p>
                          )}
                        </div>

                      </div>
                    </td>

                    {/* QUANTITY */}
                    <td>
                      <div className="quantity-box">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              itemId,
                              item.selectedSize
                            )
                          }
                        >
                          -
                        </button>

                        <span>
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              itemId,
                              item.selectedSize
                            )
                          }
                        >
                          +
                        </button>

                      </div>
                    </td>

                    {/* PRICE */}
                    <td>
                      ${price.toFixed(2)}
                    </td>

                    {/* SUBTOTAL */}
                    <td>
                      $
                      {(
                        price * quantity
                      ).toFixed(2)}
                    </td>

                    {/* REMOVE */}
                    <td>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          removeFromCart(
                            itemId,
                            item.selectedSize
                          )
                        }
                      >
                        Remove
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* =========================
              COUPON
          ========================= */}

          <div className="coupon-section">

            <div>
              <h3>Have a coupon?</h3>

              <p>
                Enter your coupon code to receive
                a discount.
              </p>
            </div>

            <div className="coupon-input">
              <input
                type="text"
                placeholder="Coupon code"
              />

              <button type="button">
                Apply
              </button>
            </div>

          </div>

        </div>

        {/* =========================
            RIGHT SIDE - SUMMARY
        ========================= */}

        <div className="cart-right">

          <div className="summary-card">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>

              <span>
                $
                {calculateTotal().toFixed(2)}
              </span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>

              <span>Free</span>
            </div>

            <div className="summary-row">
              <span>Tax</span>

              <span>$0.00</span>
            </div>

            <div className="summary-total">
              <span>Total</span>

              <span>
                $
                {calculateTotal().toFixed(2)}
              </span>
            </div>

            {/* Checkout message */}

            {checkoutMessage && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  borderRadius: "8px",
                  background:
                    checkoutMessage.includes(
                      "successfully"
                    )
                      ? "#e8f5e9"
                      : "#fdecec",
                  color:
                    checkoutMessage.includes(
                      "successfully"
                    )
                      ? "#0f3d1e"
                      : "#b02a37",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {checkoutMessage}
              </div>
            )}

            <button
              type="button"
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Proceed to Checkout"}
            </button>

            <a
              href="/shop"
              className="continue-btn"
            >
              Continue Shopping
            </a>

          </div>

        </div>

      </div>

      {/* =========================
          SHIPPING BANNER
      ========================= */}

      <div className="shipping-banner">

        <h2>
          Shop With Confidence
        </h2>

        <div className="shipping-features">

          <div className="shipping-box">
            <h3>Free Shipping</h3>
            <p>
              Enjoy convenient delivery on
              eligible orders.
            </p>
          </div>

          <div className="shipping-box">
            <h3>Secure Payment</h3>
            <p>
              Your payment information is kept
              safe and secure.
            </p>
          </div>

          <div className="shipping-box">
            <h3>Quality Products</h3>
            <p>
              Carefully selected beauty products
              for your routine.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;