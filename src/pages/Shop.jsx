import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "../components/Navbar";
import "../styles/shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toggleWishlist, isFavourite } = useWishlist();

  useEffect(() => {
    setLoading(true);
    
    // Build API endpoint based on selected category filter
    const url =
      selectedCategory === "all"
        ? "http://localhost:5000/api/products"
        : `http://localhost:5000/api/products?category=${encodeURIComponent(selectedCategory)}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, [selectedCategory]);

  if (loading) {
    return <div className="loading-container">Loading Products...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="shop-page">
        <div className="shop-header">
          <span className="shop-subtitle">Luxury Beauty Store</span>
          <h1>
            Discover Beauty <br /> Designed For You
          </h1>
          <p>
            Explore our premium collection of skincare, makeup, fragrances,
            lashes and beauty essentials.
          </p>
        </div>

        <div className="filter-container">
          {[
            "all",
            "Skincare",
            "Makeup",
            "Haircare",
            "Nails",
            "Lashes",
            "Fragrance",
          ].map((category) => (
            <button
              key={category}
              className={`filter-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "All Products" : category}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              <div className="product-image">
                <img
                  src={product.image}
                  alt={product.name}
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ cursor: "pointer" }}
                />

                <button
                  className="wishlist-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                >
                  {isFavourite(product._id) ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <div className="product-info">
                <span className="category-tag">{product.category}</span>

                <h3
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {product.name}
                </h3>

                <p>{product.description}</p>

                <div className="product-footer">
                  <span className="price">
                    ₦{Number(product.price).toLocaleString()}
                  </span>

                  <button
                    className="cart-btn"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    Shop now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Shop;