import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiHeart,
  FiUser,
  FiX,
  FiLogOut,
  FiMenu,
} from "react-icons/fi";
import { BsCart3 } from "react-icons/bs";
import {
  FaFacebookF,
  FaTwitter,
  FaTiktok,
  FaInstagram,
} from "react-icons/fa";

import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WishlistContext";

import "../styles/navbar.css";

const Navbar = () => {
  const location = useLocation();
  const { cartCount, cartViewed, setCartViewed } = useCart();

  const { wishlist, wishlistViewed, setWishlistViewed } = useWishlist();

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronize User Auth State
  const checkUserAuth = () => {
    const user = JSON.parse(localStorage.getItem("current_user"));
    setCurrentUser(user || null);
  };

  useEffect(() => {
    // 1. Fetch products from API (or fallback to static json)
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        // Support array response or object containing products array
        const productList = Array.isArray(data) ? data : data.products || [];
        setProducts(productList);
      })
      .catch(() => {
        // Fallback to static JSON if server is unreachable
        fetch("/data/products.json")
          .then((res) => res.json())
          .then((data) => setProducts(data))
          .catch((err) => console.error("Error loading products:", err));
      });

    // 2. Initial Auth Check
    checkUserAuth();

    // 3. Listen for login/logout changes across tabs or updates
    window.addEventListener("storage", checkUserAuth);
    return () => window.removeEventListener("storage", checkUserAuth);
  }, []);

  // Re-check user status on route navigation
  useEffect(() => {
    checkUserAuth();
  }, [location]);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("current_user");
    localStorage.removeItem("auth_token");
    setCurrentUser(null);
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const searchResults =
    search.trim() === ""
      ? []
      : products.filter((product) =>
          product.name.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <header className="navbar">
      {/* ================= TOP BAR ================= */}
      <div className="top-bar">
        <p>Call us: +234 814 110 5863</p>

        <div className="top-right">
          <span>
            Signup and Get 20% OFF your first order
            {!currentUser && (
              <Link
                to="/login"
                style={{
                  color: "inherit",
                  marginLeft: "4px",
                }}
              >
                <b>Sign up here</b>
              </Link>
            )}
          </span>

          <div className="socials">
            <FaFacebookF />
            <FaTwitter />
            <FaTiktok />
            <FaInstagram />
          </div>
        </div>
      </div>

      {/* ================= MAIN NAV ================= */}
      <div className="main-nav">
        {/* LOGO */}
        <Link
          to="/"
          className="logo"
          onClick={closeMobileMenu}
        >
          <div className="logo-circle"></div>
          <span>Beauty Shop</span>
        </Link>

        {/* DESKTOP / MOBILE NAV LINKS */}
        <nav
          className={`nav-links ${
            mobileMenuOpen ? "mobile-open" : ""
          }`}
        >
          <Link to="/" onClick={closeMobileMenu}>
            Home
          </Link>

          <Link to="/shop" onClick={closeMobileMenu}>
            Shop
          </Link>

          <Link to="/about" onClick={closeMobileMenu}>
            About us
          </Link>

          <Link
            to="/book"
            className="nav-book-btn"
            onClick={closeMobileMenu}
          >
            Book Appointment
          </Link>

          <Link
            to="/contact"
            onClick={closeMobileMenu}
          >
            Contact Us
          </Link>
        </nav>

        {/* ================= ICONS ================= */}
        <div className="nav-icons">
          {/* SEARCH */}
          <div className="search-wrapper">
            {showSearch ? (
              <>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />

                <FiX
                  className="close-search"
                  onClick={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                />

                {search.trim() !== "" && (
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                      searchResults.map((product) => (
                        <Link
                          key={product._id || product.id}
                          to={`/product/${product._id || product.id}`}
                          className="search-item"
                          onClick={() => {
                            setSearch("");
                            setShowSearch(false);
                            closeMobileMenu();
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                          <div>
                            <h5>{product.name}</h5>
                            <p>
                              ₦
                              {Number(product.price).toLocaleString()}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="no-product">
                        No product found
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <FiSearch
                className="nav-search"
                onClick={() => setShowSearch(true)}
              />
            )}
          </div>

          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="wishlist-icon"
            onClick={() => {
              setWishlistViewed(true);
              closeMobileMenu();
            }}
          >
            <FiHeart />
            {!wishlistViewed && wishlist.length > 0 && (
              <span className="wishlist-badge">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link
            to="/cart"
            className="cart-icon"
            onClick={() => {
              setCartViewed(true);
              closeMobileMenu();
            }}
          >
            <BsCart3 />
            {!cartViewed && cartCount > 0 && (
              <span className="cart-badge">
                {cartCount}
              </span>
            )}
          </Link>

          {/* USER */}
          {currentUser ? (
            <div className="user-profile-badge">
              <FiUser className="user-icon" />
              <span className="user-name">
                Hi,{" "}
                {currentUser.name ? currentUser.name.split(" ")[0] : "User"}
              </span>
              <FiLogOut
                className="logout-icon"
                title="Logout"
                onClick={handleLogout}
              />
            </div>
          ) : (
            <Link
              to="/login"
              className="user-icon"
              onClick={closeMobileMenu}
            >
              <FiUser />
            </Link>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;