import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load initial cart state from localStorage to prevent loss on refresh
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("shopping_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartViewed, setCartViewed] = useState(false);

  // Sync cart changes to localStorage
  useEffect(() => {
    localStorage.setItem("shopping_cart", JSON.stringify(cart));
  }, [cart]);

  // Helper to safely compare MongoDB _id or standard id
  const getItemId = (item) => String(item._id || item.id);

  // Add Item to Cart (Handles size variants & MongoDB _id / id)
  const addToCart = (product, quantity = 1) => {
    setCartViewed(false);
    const productId = getItemId(product);

    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) =>
          getItemId(item) === productId &&
          item.selectedSize === product.selectedSize
      );

      if (existing) {
        return prevCart.map((item) =>
          getItemId(item) === productId &&
          item.selectedSize === product.selectedSize
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity,
        },
      ];
    });
  };

  // Remove single item completely (by ID and size)
  const removeFromCart = (id, selectedSize) => {
    const targetId = String(id);
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            getItemId(item) === targetId &&
            (!selectedSize || item.selectedSize === selectedSize)
          )
      )
    );
  };

  // Increase Item Quantity
  const increaseQuantity = (id, selectedSize) => {
    setCartViewed(false);
    const targetId = String(id);

    setCart((prev) =>
      prev.map((item) =>
        getItemId(item) === targetId &&
        (!selectedSize || item.selectedSize === selectedSize)
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Decrease Item Quantity
  const decreaseQuantity = (id, selectedSize) => {
    setCartViewed(false);
    const targetId = String(id);

    setCart((prev) =>
      prev
        .map((item) =>
          getItemId(item) === targetId &&
          (!selectedSize || item.selectedSize === selectedSize)
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Unified Quantity Updater
  const updateQuantity = (id, delta, selectedSize) => {
    if (delta > 0) {
      increaseQuantity(id, selectedSize);
    } else if (delta < 0) {
      decreaseQuantity(id, selectedSize);
    }
  };

  // CLEAR CART FUNCTION
  const clearCart = () => {
    setCart([]);
    setCartViewed(false);
    localStorage.removeItem("shopping_cart");
  };

  // Total Item Count Badge
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total Price Calculation
  const totalPrice = cart.reduce((total, item) => {
    const price = Number(item.price) || 0;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        cartCount,
        totalPrice,
        cartViewed,
        setCartViewed,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};