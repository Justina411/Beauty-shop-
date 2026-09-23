import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaTrash } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { useWishlist } from "../Context/WishlistContext";
import "../styles/wishlist.css";

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <>
      <Navbar />

      <div className="wishlist-page">

        <div className="wishlist-header">
          <small>YOUR FAVORITES</small>
          <h1>My Wishlist</h1>
          <p>
            Save your favourite beauty products and shop them anytime.
          </p>
        </div>

        {wishlist.length === 0 ? (

          <div className="empty-wishlist">

            <FaHeart className="empty-heart" />

            <h2>Your wishlist is empty</h2>

            <p>
              Start adding products you love.
            </p>

            <Link
              to="/shop"
              className="wishlist-shop-btn"
            >
              Shop Now
            </Link>

          </div>

        ) : (

          <div className="wishlist-grid">

            {wishlist.map((product) => (

              <div
                className="wishlist-card"
                key={product.id}
              >

                <Link
                  to={`/product/${product.id}`}
                  className="wishlist-link"
                >

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                </Link>

                <div className="wishlist-info">

                  <span className="wishlist-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <div className="wishlist-footer">

                    <span className="wishlist-price">
                      ₦{product.price}
                    </span>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        toggleWishlist(product)
                      }
                    >
                      <FaTrash />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </>
  );
};

export default Wishlist;