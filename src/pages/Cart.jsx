import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../Context/CartContext";
import Payment from "./Payment";
import "../styles/cart.css";

const Cart = () => {
  const [showPayment, setShowPayment] = useState(false);

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Helper to safely extract MongoDB _id or standard id
  const getItemId = (item) => item._id || item.id;

  /*
    Calculate subtotal safely converting string/number prices
  */
  const cartSubtotal = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * item.quantity,
    0
  );

  const freeShippingTarget = 50000;

  const progress = Math.min(
    (cartSubtotal / freeShippingTarget) * 100,
    100
  );

  const remaining = Math.max(
    freeShippingTarget - cartSubtotal,
    0
  );

  const shipping =
    cartSubtotal >= freeShippingTarget ? 0 : 2500;

  const vat = cartSubtotal * 0.075;

  const grandTotal = cartSubtotal + shipping + vat;

  // Clear cart and hide modal after successful payment
  const handlePaymentSuccess = () => {
    clearCart();
    setShowPayment(false);
  };

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h1 className="cart-title">Shopping Cart</h1>

        <div className="shipping-top">
          {remaining > 0 ? (
            <p>
              Spend{" "}
              <strong>
                ₦{remaining.toLocaleString()}
              </strong>{" "}
              more to enjoy{" "}
              <strong>FREE SHIPPING</strong>
            </p>
          ) : (
            <p>
              🎉 Congratulations! You qualify for{" "}
              <strong>FREE SHIPPING</strong>
            </p>
          )}

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't added any beauty products yet.
            </p>

            <Link
              to="/shop"
              className="continue-shopping"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-container">

            <div className="cart-left">

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item, index) => {
                    const itemId = getItemId(item);
                    const size = item.selectedSize || "";

                    return (
                      <tr key={`${itemId}-${size}-${index}`}>
                        <td>
                          <div className="product-information">

                            <img
                              src={item.image}
                              alt={item.name}
                            />

                            <div>
                              <h4>{item.name}</h4>

                              <p>
                                {item.category}
                              </p>

                              {/* Show selected size if available */}
                              {item.selectedSize && (
                                <small>
                                  Size: {item.selectedSize}
                                </small>
                              )}
                            </div>

                          </div>
                        </td>

                        <td>
                          <div className="quantity-box">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(itemId, item.selectedSize)
                              }
                            >
                              -
                            </button>

                            <span>
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(itemId, item.selectedSize)
                              }
                            >
                              +
                            </button>

                          </div>
                        </td>

                        <td>
                          ₦{(Number(item.price) || 0).toLocaleString()}
                        </td>

                        <td>
                          ₦{(
                            (Number(item.price) || 0) * item.quantity
                          ).toLocaleString()}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() =>
                              removeFromCart(itemId, item.selectedSize)
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

              <div className="coupon-section">

                <div>
                  <h3>Have a Coupon?</h3>

                  <p>
                    Add your coupon code for an instant discount.
                  </p>
                </div>

                <div className="coupon-input">

                  <input
                    type="text"
                    placeholder="Coupon Code"
                  />

                  <button type="button">
                    Apply
                  </button>

                </div>

              </div>
            </div>

            <div className="cart-right">

              <div className="summary-card">

                <h2>Cart Summary</h2>

                {/* SUBTOTAL */}
                <div className="summary-row">
                  <span>Subtotal</span>

                  <span>
                    ₦{cartSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* SHIPPING */}
                <div className="summary-row">
                  <span>Shipping</span>

                  <span>
                    {shipping === 0
                      ? "FREE"
                      : `₦${shipping.toLocaleString()}`}
                  </span>
                </div>

                {/* VAT */}
                <div className="summary-row">
                  <span>VAT (7.5%)</span>

                  <span>
                    ₦{vat.toLocaleString()}
                  </span>
                </div>

                <hr />

                {/* GRAND TOTAL */}
                <div className="summary-total">
                  <span>Total</span>

                  <span>
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>

                {/* MAKE PAYMENT */}
                <button
                  type="button"
                  className="checkout-btn"
                  onClick={() =>
                    setShowPayment(true)
                  }
                >
                  Make Payment
                </button>

                <Link
                  to="/shop"
                  className="continue-btn"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>
          </div>
        )}

        <div className="shipping-banner">

          <h2>
            Why Shop With Beauty Shop?
          </h2>

          <div className="shipping-features">

            <div className="shipping-box">
              <h3>🚚 Free Shipping</h3>

              <p>
                Enjoy free nationwide delivery on
                orders above ₦50,000.
              </p>
            </div>

            <div className="shipping-box">
              <h3>🔒 Secure Payment</h3>

              <p>
                Your payment is protected with secure
                encrypted checkout.
              </p>
            </div>

            <div className="shipping-box">
              <h3>💎 Premium Beauty</h3>

              <p>
                100% authentic skincare, makeup,
                fragrances, haircare and lashes.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* PAYMENT OVERLAY */}
      {showPayment && (
        <Payment
          total={grandTotal}
          onClose={() =>
            setShowPayment(false)
          }
          onSuccess={handlePaymentSuccess}
        />
      )}

    </>
  );
};

export default Cart;