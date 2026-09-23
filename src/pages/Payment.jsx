import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { PaystackButton } from "react-paystack";
import { useCart } from "../Context/CartContext";
import "../styles/payment.css";

const Payment = ({ total = 0, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem("current_user") || "{}"
  );
  const email = currentUser.email || "customer@example.com";

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const handlePaystackSuccess = (reference) => {
    // 1. Immediately switch to the big checkmark success screen
    setPaymentSuccessful(true);

    // 2. Clear the cart state/localStorage
    if (clearCart) clearCart();
    if (onSuccess) onSuccess();

    // 3. Save order to backend in the background
    fetch("http://localhost:5000/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
      body: JSON.stringify({
        reference: reference.reference,
        cartItems: cart,
        totalAmount: total,
        userEmail: email,
      }),
    }).catch((err) => console.error("Order save error:", err));
  };

  const componentProps = {
    email,
    amount: Math.round(Number(total) * 100),
    publicKey: publicKey || "",
    text: "Pay Now",
    onSuccess: handlePaystackSuccess,
    onClose: () => console.log("Payment modal closed"),
  };

  const handleContinueShopping = () => {
    onClose();
    navigate("/shop");
  };

  const handleGoHome = () => {
    onClose();
    navigate("/");
  };

  return ReactDOM.createPortal(
    <div className="payment-overlay">
      <div className="payment-container">
        <button
          className="payment-close"
          onClick={onClose}
          aria-label="Close payment"
        >
          ×
        </button>

        {!paymentSuccessful ? (
          <>
            <div className="payment-left">
              <h2>Checkout Summary</h2>
              <p>You are about to complete your order.</p>
              <div className="payment-total">
                <span>Total Amount</span>
                <strong>₦{Number(total).toLocaleString()}</strong>
              </div>
            </div>

            <div className="payment-right">
              <h2>Select Payment Option</h2>
              <p>Pay securely with card, bank transfer, or USSD via Paystack.</p>

              <PaystackButton className="pay-button" {...componentProps} />

              <button
                className="payment-continue"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          /* ========================================================= */
          /* SUCCESS SCREEN (Big Checkmark + Navigation Buttons)      */
          /* ========================================================= */
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>
              Your payment of <strong>₦{Number(total).toLocaleString()}</strong> was processed successfully.
            </p>
            <div className="success-buttons">
              <button className="pay-button" onClick={handleGoHome}>
                Back to Home
              </button>
              <button
                className="payment-continue"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Payment;