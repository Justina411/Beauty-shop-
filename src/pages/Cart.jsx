import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import Payment from "./Payment";
import "../styles/cart.css";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const getItemId = (item) => String(item._id || item.id);

  const calculateTotal = () => {
    return cart.reduce(
      (acc, item) =>
        acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Your Shopping Cart</h2>
          <p>Your cart is empty. Add some beautiful products to get started!</p>
          <a href="/shop" className="continue-shopping">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Shopping Cart</h1>

      <div className="shipping-top">
        <p>You're on your way to receiving your beauty essentials!</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: "70%" }}></div>
        </div>
      </div>

      <div className="cart-container">
        {/* LEFT SIDE */}
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
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;

                return (
                  <tr key={`${itemId}-${item.selectedSize || "default"}`}>
                    <td>
                      <div className="product-information">
                        <img
                          src={item.image || "/images/placeholder.jpg"}
                          alt={item.title || item.name || "Product"}
                        />
                        <div>
                          <h4>{item.title || item.name}</h4>
                          {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="quantity-box">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(itemId, item.selectedSize)}
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(itemId, item.selectedSize)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>${price.toFixed(2)}</td>
                    <td>${(price * quantity).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeFromCart(itemId, item.selectedSize)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="coupon-section">
            <div>
              <h3>Have a coupon?</h3>
              <p>Enter your coupon code to receive a discount.</p>
            </div>
            <div className="coupon-input">
              <input type="text" placeholder="Coupon code" />
              <button type="button">Apply</button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - SUMMARY */}
        <div className="cart-right">
          <div className="summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${calculateTotal().toFixed(2)}</span>
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
              <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="checkout-btn"
              onClick={handleOpenPayment}
            >
              Proceed to Payment
            </button>

            <a href="/shop" className="continue-btn">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>

      <div className="shipping-banner">
        <h2>Shop With Confidence</h2>
        <div className="shipping-features">
          <div className="shipping-box">
            <h3>Free Shipping</h3>
            <p>Enjoy convenient delivery on eligible orders.</p>
          </div>
          <div className="shipping-box">
            <h3>Secure Payment</h3>
            <p>Your payment information is kept safe and secure.</p>
          </div>
          <div className="shipping-box">
            <h3>Quality Products</h3>
            <p>Carefully selected beauty products for your routine.</p>
          </div>
        </div>
      </div>

      {/* PAYMENT OVERLAY MODAL */}
      {showPaymentModal && (
        <Payment
          total={calculateTotal()}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default Cart;