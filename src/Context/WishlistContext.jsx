import { createContext, useContext, useState } from "react";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Controls the wishlist notification badge
  const [wishlistViewed, setWishlistViewed] = useState(false);

  const toggleWishlist = (product) => {
    // Whenever a favourite is added/removed,
    // show the badge again
    setWishlistViewed(false);

    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find(
        (item) => item.id === product.id
      );

      if (exists) {
        return prevWishlist.filter(
          (item) => item.id !== product.id
        );
      }

      return [...prevWishlist, product];
    });
  };

  const isFavourite = (id) => {
    return wishlist.some(
      (item) => item.id === id
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isFavourite,
        wishlistViewed,
        setWishlistViewed,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};