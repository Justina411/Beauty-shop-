import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../apiConfig";
import "../styles/productDetail.css";

const ProductDetails = ({ onAddToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product details.");
        const data = await res.json();
        
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else if (data.image) {
          setSelectedImage(data.image);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Compute price based on size or variant
  const getPriceForSize = () => {
    if (!product) return 0;
    
    // Check if backend has dynamic variants pricing
    if (product.variants && product.variants[selectedSize]) {
      return product.variants[selectedSize];
    }
    
    // Fallback tier multiplier (if applicable)
    const dynamicPrices = {
      "30 ml": product.price,
      "60 ml": product.price ? product.price * 1.8 : 0,
      "80 ml": product.price ? product.price * 2.3 : 0,
      "100 ml": product.price ? product.price * 2.8 : 0,
    };

    return dynamicPrices[selectedSize] || product.price || 0;
  };

  const currentPrice = getPriceForSize();

  const handleAddToCart = () => {
    if (!product) return;

    const productId = product._id || product.id;

    const itemPayload = {
      _id: productId,
      id: productId,
      title: product.title || product.name,
      name: product.name || product.title,
      price: currentPrice,
      image: selectedImage || product.image,
      selectedSize,
      quantity,
    };

    if (onAddToCart) {
      onAddToCart(itemPayload);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage("");

    const newReview = {
      name: reviewerName || "Anonymous",
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    };

    // Store previous reviews in case we need to roll back
    const previousReviews = product.reviews || [];

    // Optimistic UI update
    setProduct((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
    }));

    try {
      const res = await fetch(`${API_BASE}/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      if (!res.ok) {
        throw new Error("Failed to post review.");
      }

      const updatedProduct = await res.json();
      setProduct(updatedProduct); // Sync with actual database response
      setReviewerName("");
      setComment("");
      setRating(5);
      setReviewMessage("Review added successfully!");
    } catch (err) {
      // Roll back optimistic state update on error
      setProduct((prev) => ({
        ...prev,
        reviews: previousReviews,
      }));
      setReviewMessage("Could not post review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading product...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>;
  if (!product) return <div style={{ padding: "40px", textAlign: "center" }}>Product not found.</div>;

  return (
    <div className="product-detail-page">
      <div className="product-container">
        {/* LEFT SIDE */}
        <div className="product-left">
          <div className="main-image">
            <img
              src={selectedImage || product.image}
              alt={product.title || product.name}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-row">
              {product.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx}`}
                  onClick={() => setSelectedImage(img)}
                  className={selectedImage === img ? "active-thumb" : ""}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="product-right">
          <p className="breadcrumb-category">{product.category || "Collection"}</p>
          <div className="title-row">
            <h1>{product.title || product.name}</h1>
            <span className="stock-badge">In Stock</span>
          </div>

          <div className="price-section">
            <span className="current-price">${currentPrice.toFixed(2)}</span>
            {product.oldPrice && (
              <span className="old-price">${product.oldPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="description">{product.description}</p>

          {/* SIZE / VOLUME */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="size-selector-zone">
              <label>Select Size / Volume:</label>
              <div className="size-pills">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-pill ${selectedSize === size ? "active" : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PURCHASE CONTROLS */}
          <div className="purchase-controls">
            <div className="quantity-counter">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <button onClick={handleAddToCart} className="btn-add-cart">
              Add to Cart
            </button>
          </div>

          {/* REVIEWS */}
          <div className="add-review-form-container">
            <h4>Customer Reviews</h4>

            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              <div style={{ marginBottom: "24px" }}>
                {product.reviews.map((rev, index) => (
                  <div key={rev._id || index} className="ui-review-card">
                    <div className="rev-header">
                      <strong>{rev.name || "Anonymous"}</strong>
                      <span className="rev-stars">{"★".repeat(rev.rating)}</span>
                    </div>
                    <p>{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#888", marginBottom: "16px" }}>
                No reviews yet. Be the first to leave one!
              </p>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit}>
              {reviewMessage && (
                <p style={{ color: "#123b23", fontWeight: "600", marginBottom: "10px" }}>
                  {reviewMessage}
                </p>
              )}
              
              <div className="review-form-group">
                <label>Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>

              <div className="review-form-group">
                <label>Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="review-form-group">
                <label>Review</label>
                <textarea
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-submit-review"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;