import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../Context/CartContext";
import "../styles/productDetail.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("additional");
  const [selectedSize, setSelectedSize] = useState("30 ml");

  // Form State for User Reviews
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dynamic Overlay Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Fetch single product from MongoDB backend
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Product not found");
        }
        return res.json();
      })
      .then((found) => {
        if (found) {
          setProduct({
            ...found,
            reviews: found.reviews || [], // Preserve existing MongoDB reviews
          });
          setMainImage(
            found.images && found.images.length > 0
              ? found.images[0]
              : found.image
          );
        }
        setQuantity(1);
        setSelectedSize("30 ml");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading product:", err);
        setError(err.message);
        setLoading(false);
      });

    // Fetch all products to display in "Explore Related Products"
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading related products:", err));
  }, [id]);

  // Submit Review to Backend (No clearing of reviews)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showNotification("Please write a review before submitting.", "error");
      return;
    }

    setSubmittingReview(true);

    const tempReview = {
      user: reviewerName.trim() || "Anonymous Customer",
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    };

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tempReview),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Append newly saved review without wiping out existing list
        setProduct((prevProduct) => ({
          ...prevProduct,
          reviews: data.reviews && data.reviews.length > 0 
            ? data.reviews 
            : [...(prevProduct.reviews || []), tempReview],
        }));

        setReviewerName("");
        setRating(5);
        setComment("");
        showNotification("✨ Thank you! Your review has been added.", "success");
      } else {
        showNotification(data.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      console.error("Error posting review:", err);
      // Keep local state updated even if server connection lags
      setProduct((prevProduct) => ({
        ...prevProduct,
        reviews: [...(prevProduct.reviews || []), tempReview],
      }));
      showNotification("Review added! Check backend connection if missing on refresh.", "success");
    } finally {
      setSubmittingReview(false);
    }
  };

  const sizesList = ["30 ml", "60 ml", "80 ml", "100 ml"];

  const sizePrices = product
    ? {
        "30 ml": product.price,
        "60 ml": product.price * 2,
        "80 ml": product.price * 3,
        "100 ml": product.price * 4,
      }
    : {};

  const selectedSizePrice = product ? sizePrices[selectedSize] || product.price : 0;

  // Handle Add To Cart with Auth Check & Auto-Redirect
  const handleAddToCart = () => {
    // Matched with auth_token key in Login.jsx
    const token = localStorage.getItem("auth_token");

    const itemPayload = {
      ...product,
      price: selectedSizePrice,
      selectedSize: selectedSize,
      quantity: quantity,
    };

    if (!token) {
      // User is NOT logged in -> save intent and redirect to login
      localStorage.setItem("pendingCartItem", JSON.stringify(itemPayload));
      showNotification("Please log in to add items to your cart. Redirecting...", "error");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    // User IS logged in -> add directly to cart
    addToCart(itemPayload, quantity);
    showNotification(`🛍️ ${quantity}x ${product.name} (${selectedSize}) added to cart!`, "success");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <h2 style={{ textAlign: "center", marginTop: "180px" }}>
          Loading Product...
        </h2>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", marginTop: "180px" }}>
          <h2>Product Not Found</h2>
          <p>{error || "The requested product does not exist."}</p>
          <Link
            to="/shop"
            style={{ textDecoration: "underline", color: "#123b23" }}
          >
            Return to Shop
          </Link>
        </div>
      </>
    );
  }

  const relatedProducts = products
    .filter(
      (item) =>
        item.category === product.category &&
        (item._id || item.id) !== (product._id || product.id)
    )
    .slice(0, 4);

  return (
    <>
      <Navbar />

      {/* OVERLAY TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`toast-overlay ${toast.type}`}>
          <span>{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast({ show: false, message: "", type: "success" })}
          >
            ✕
          </button>
        </div>
      )}

      <div className="product-detail-page">
        <div className="product-container">
          {/* LEFT SIDE */}
          <div className="product-left">
            <div className="main-image">
              <img src={mainImage} alt={product.name} />
            </div>

            <div className="thumbnail-row">
              {(product.images || [product.image]).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={product.name}
                  onClick={() => setMainImage(img)}
                  className={mainImage === img ? "active-thumb" : ""}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="product-right">
            <span className="breadcrumb-category">
              {product.category || "Skin Care"}
            </span>

            <div className="title-row">
              <h1>{product.name}</h1>
              <span className="stock-badge">In Stock</span>
            </div>

            <div className="stars-row">
              <span className="stars">★★★★★</span>
              <span className="rating-text">
                4.8 ({product.reviews?.length || 0} Reviews)
              </span>
            </div>

            <div className="price-section">
              <span className="current-price">
                ₦{(selectedSizePrice * quantity).toLocaleString()}
              </span>
              <span className="old-price">
                ₦{(selectedSizePrice * 1.25 * quantity).toLocaleString()}
              </span>
            </div>

            <p className="description">
              {product.description ||
                "Detailed descriptive notes regarding use case formulas."}
            </p>

            {/* SIZE SELECTOR */}
            <div className="size-selector-zone">
              <label>Size/Volume</label>
              <div className="size-pills">
                {sizesList.map((size) => (
                  <button
                    key={size}
                    className={`size-pill ${
                      selectedSize === size ? "active" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* PURCHASE CONTROLS */}
            <div className="purchase-controls">
              <div className="quantity-counter">
                <button
                  onClick={() =>
                    quantity > 1 && setQuantity(quantity - 1)
                  }
                >
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="btn-add-cart" onClick={handleAddToCart}>
                Add To Cart
              </button>

              <button className="wishlist-btn">
                <span className="heart-icon">♡</span>
              </button>
            </div>

            {/* PRODUCT META */}
            <div className="meta-info-block">
              <p>
                <strong>SKU :</strong> GRFR85648HGJ
              </p>
              <p>
                <strong>Tags :</strong> {product.category || "Skincare"},
                Serums, Vitamin C
              </p>
              <div className="share-row">
                <strong>Share :</strong>
                <span className="social-icons">🌐 📘 📷 📌</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabss-container">
          <div className="tabss-navbar">
            <button
              className={`tabs-link ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tabs-link ${
                activeTab === "additional" ? "active" : ""
              }`}
              onClick={() => setActiveTab("additional")}
            >
              Additional Information
            </button>
            <button
              className={`tabs-link ${
                activeTab === "reviews" ? "active" : ""
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          <div className="tabs-body">
            {activeTab === "description" && (
              <div className="tab-pane-content">
                <p>
                  {product.detailed_description ||
                    product.description ||
                    "Detailed descriptive notes regarding use case formulas."}
                </p>
              </div>
            )}

            {activeTab === "additional" && (
              <div className="tab-pane-content">
                <table className="specs-table">
                  <thead>
                    <tr>
                      <th>Attribute</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Skin Type</td>
                      <td>
                        Normal, Oily, Dry, Combination, Sensitive skin
                      </td>
                    </tr>
                    <tr>
                      <td>Size/Volume</td>
                      <td>30 ml, 60 ml, 80 ml, 100 ml</td>
                    </tr>
                    <tr>
                      <td>Shelf Life</td>
                      <td>24 months</td>
                    </tr>
                    <tr>
                      <td>Application Time</td>
                      <td>Morning and Evening</td>
                    </tr>
                    <tr>
                      <td>Packaging</td>
                      <td>Recyclable Glass Bottle</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="tab-pane-content">
                <div className="reviews-wrapper">
                  <h3>Customer Reviews</h3>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev, index) => (
                      <div key={index} className="ui-review-card">
                        <div className="rev-header">
                          <strong>{rev.user}</strong>
                          <span className="rev-stars">
                            {"★".repeat(rev.rating)}
                          </span>
                        </div>
                        <p className="rev-comment">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: "italic", color: "#666" }}>
                      No reviews yet. Be the first to review this product!
                    </p>
                  )}

                  {/* ADD REVIEW FORM */}
                  <div
                    className="add-review-form-container"
                    style={{
                      marginTop: "40px",
                      paddingTop: "20px",
                      borderTop: "1px solid #ddd",
                    }}
                  >
                    <h4>Write a Review</h4>
                    <form
                      onSubmit={handleReviewSubmit}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        maxWidth: "500px",
                      }}
                    >
                      <div>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                          Your Name:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Customer Name"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                          Rating:
                        </label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        >
                          <option value="5">5 Stars - Excellent</option>
                          <option value="4">4 Stars - Very Good</option>
                          <option value="3">3 Stars - Average</option>
                          <option value="2">2 Stars - Poor</option>
                          <option value="1">1 Star - Terrible</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "4px" }}>
                          Your Review:
                        </label>
                        <textarea
                          rows="4"
                          placeholder="Write your feedback here..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#123b23",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          alignSelf: "flex-start",
                        }}
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-products-section">
          <div className="section-title-wrapper">
            <span className="section-subtitle">Related Products</span>
            <h2>Explore Related Products</h2>
          </div>

          <div className="products-display-grid">
            {relatedProducts.map((item) => {
              const itemID = item._id || item.id;
              return (
                <Link
                  key={itemID}
                  to={`/product/${itemID}`}
                  className="ui-product-card"
                >
                  <div className="card-image-box">
                    <span className="sale-badge">50% off</span>
                    <div className="floating-actions">
                      <button className="action-circle">♡</button>
                      <button className="action-circle">⤢</button>
                      <button className="action-circle">👜</button>
                    </div>
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="card-info-box">
                    <div className="card-meta-line">
                      <span className="card-category-label">
                        {item.category || "Skin Care"}
                      </span>
                      <span className="card-rating-badge">★ 4.9</span>
                    </div>

                    <h4>{item.name}</h4>

                    <div className="card-price-line">
                      <span className="card-now-price">
                        ₦{item.price.toLocaleString()}
                      </span>
                      <span className="card-was-price">
                        ₦{(item.price * 2).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="trust-badges-footer">
          <div className="badge-card">
            <span className="badge-icon">📦</span>
            <div>
              <h5>Free Shipping</h5>
              <p>Free shipping for order over $50</p>
            </div>
          </div>

          <div className="badge-card">
            <span className="badge-icon">💳</span>
            <div>
              <h5>Flexible Payment</h5>
              <p>Multiple secure payment options</p>
            </div>
          </div>

          <div className="badge-card">
            <span className="badge-icon">🎧</span>
            <div>
              <h5>24×7 Support</h5>
              <p>We support online all days.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;