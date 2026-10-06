import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlist } from "../Context/WishlistContext";
import Navbar from "../components/Navbar";
import "../styles/shop.css";

const API_BASE_URL = "https://beauty-shop-2k9f.onrender.com";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { toggleWishlist, isFavourite } = useWishlist();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url =
      selectedCategory === "all"
        ? `${API_BASE_URL}/api/products`
        : `${API_BASE_URL}/api/products?category=${encodeURIComponent(selectedCategory)}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Robust array parsing (supports direct array or wrapped object)
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please ensure the server is running.");
        setProducts([]);
        setLoading(false);
      });
  }, [selectedCategory]);

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

        {loading ? (
          <div className="loading-container">Loading Products...</div>
        ) : error ? (
          <div className="error-container" style={{ textAlign: "center", color: "#e74c3c", padding: "40px" }}>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products" style={{ textAlign: "center", padding: "50px 20px", color: "#666" }}>
            <h3>No products found in this category.</h3>
          </div>
        ) : (
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
        )}
      </div>
    </>
  );
};

export default Shop;