import React, { useState } from "react";
import { API_BASE } from "../apiConfig";

const Cart = ({ cartItems, setCartItems }) => {
  const [loading, setLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  // Helper to reliably get product ID
  const getItemId = (item) => item._id || item.id;

  // Key for unique matching when products have size variants
  const getCartKey = (item) => `${getItemId(item)}-${item.selectedSize || "default"}`;

  const updateQuantity = (id, selectedSize, delta) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          const matchId = getItemId(item) === id;
          const matchSize = (item.selectedSize || "default") === (selectedSize || "default");
          
          if (matchId && matchSize) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id, selectedSize) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const matchId = getItemId(item) === id;
        const matchSize = (item.selectedSize || "default") === (selectedSize || "default");
        return !(matchId && matchSize);
      })
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setCheckoutMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, total: calculateTotal() }),
      });

      if (!response.ok) {
        throw new Error("Checkout failed. Please try again.");
      }

      setCartItems([]);
      setCheckoutMessage("Order placed successfully! Thank you.");
    } catch (err) {
      setCheckoutMessage(err.message || "An error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Shopping Cart</h2>
        <p className="text-gray-500">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Shopping Cart</h2>

      {checkoutMessage && (
        <div className="mb-4 p-4 rounded bg-blue-100 text-blue-800 font-medium">
          {checkoutMessage}
        </div>
      )}

      <div className="space-y-4">
        {cartItems.map((item) => {
          const itemId = getItemId(item);
          const cartKey = getCartKey(item);

          return (
            <div
              key={cartKey}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.title || item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-lg">{item.title || item.name}</h3>
                  {item.selectedSize && (
                    <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-green-700 font-medium">${item.price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* Quantity Controller */}
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => updateQuantity(itemId, item.selectedSize, -1)}
                    className="px-3 py-1 hover:bg-gray-200 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(itemId, item.selectedSize, 1)}
                    className="px-3 py-1 hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <span className="font-semibold w-20 text-right">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(itemId, item.selectedSize)}
                  className="text-red-500 hover:text-red-700 font-semibold text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 border-t pt-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500">Total Amount:</p>
          <p className="text-3xl font-bold text-green-700">
            ${calculateTotal().toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;