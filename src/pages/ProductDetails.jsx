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

  // =========================
  // FETCH PRODUCT
  // =========================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/products/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch product details.");
        }

        const data = await res.json();

        setProduct(data);

        // Select first available size
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        } else {
          setSelectedSize("");
        }

        // Select first available image
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else if (data.image) {
          setSelectedImage(data.image);
        } else {
          setSelectedImage("");
        }

        // Reset quantity when product changes
        setQuantity(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // PRICE
  // =========================

  const getPriceForSize = () => {
    if (!product) return 0;

    // Use backend variant pricing if available
    if (
      product.variants &&
      selectedSize &&
      product.variants[selectedSize] !== undefined
    ) {
      return Number(product.variants[selectedSize]);
    }

    // Fallback pricing
    const dynamicPrices = {
      "30 ml": product.price,
      "60 ml": product.price ? product.price * 1.8 : 0,
      "80 ml": product.price ? product.price * 2.3 : 0,
      "100 ml": product.price ? product.price * 2.8 : 0,
    };

    return Number(dynamicPrices[selectedSize] || product.price || 0);
  };

  const currentPrice = getPriceForSize();

  // =========================
  // QUANTITY
  // =========================

  const handleDecreaseQuantity = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };

  // =========================
  // ADD TO CART
  // =========================

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

  // =========================
  // REVIEW SUBMIT
  // =========================

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    const newReview = {
      name: reviewerName.trim() || "Anonymous",
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    // Save previous reviews in case request fails
    const previousReviews = product.reviews || [];

    // Optimistic update
    setProduct((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
    }));

    try {
      const res = await fetch(
        `${API_BASE}/api/products/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newReview),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to post review.");
      }

      const updatedProduct = await res.json();

      // Sync with database response
      setProduct(updatedProduct);

      // Clear form
      setReviewerName("");
      setComment("");
      setRating(5);

      setReviewMessage("Review added successfully!");
    } catch (err) {
      // Roll back optimistic update
      setProduct((prev) => ({
        ...prev,
        reviews: previousReviews,
      }));

      setReviewMessage(
        "Could not post review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =========================
  // LOADING STATE
  // =========================

  if (loading) {
    return (
      <div className="product-page-state">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  // =========================
  // ERROR STATE
  // =========================

  if (error) {
    return (
      <div className="product-page-state error-state">
        <h3>Something went wrong</h3>
        <p>{error}</p>
      </div>
    );
  }

  // =========================
  // PRODUCT NOT FOUND
  // =========================

  if (!product) {
    return (
      <div className="product-page-state">
        <h3>Product not found</h3>
        <p>
          The product you are looking for is unavailable.
        </p>
      </div>
    );
  }

  const productName = product.title || product.name;
  const productImage = selectedImage || product.image;

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="product-detail-page">
      <div className="product-container">

        {/* =========================
            LEFT SIDE - IMAGES
        ========================= */}

        <div className="product-left">

          <div className="main-image">
            <img
              src={productImage}
              alt={productName}
            />

            <div className="image-label">
              Beauty Collection
            </div>
          </div>

          {/* Product thumbnails */}
          {product.images &&
            product.images.length > 1 && (
              <div className="thumbnail-row">
                {product.images.map((img, index) => (
                  <button
                    type="button"
                    key={index}
                    className={`thumbnail-button ${
                      selectedImage === img
                        ? "active-thumb"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedImage(img)
                    }
                  >
                    <img
                      src={img}
                      alt={`${productName} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* =========================
            RIGHT SIDE - PRODUCT INFO
        ========================= */}

        <div className="product-right">

          {/* Category */}
          <p className="breadcrumb-category">
            {product.category || "Beauty Collection"}
          </p>

          {/* Product title */}
          <div className="title-row">
            <h1>{productName}</h1>

            <span className="stock-badge">
              <span className="stock-dot"></span>
              In Stock
            </span>
          </div>

          {/* Rating */}
          <div className="stars-row">
            <span className="stars">
              ★★★★★
            </span>

            <span className="rating-text">
              {product.reviews?.length || 0}{" "}
              {product.reviews?.length === 1
                ? "review"
                : "reviews"}
            </span>
          </div>

          {/* Price */}
          <div className="price-section">
            <span className="current-price">
              ${currentPrice.toFixed(2)}
            </span>

            {product.oldPrice && (
              <span className="old-price">
                ${Number(product.oldPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="description">
            {product.description ||
              "Discover a carefully selected beauty essential designed to complement your everyday routine."}
          </p>

          {/* =========================
              SIZE / VOLUME
          ========================= */}

          {product.sizes &&
            product.sizes.length > 0 && (
              <div className="size-selector-zone">

                <label>
                  Select Size / Volume
                </label>

                <div className="size-pills">
                  {product.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`size-pill ${
                        selectedSize === size
                          ? "active"
                          : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

              </div>
            )}

          {/* =========================
              PURCHASE CONTROLS
          ========================= */}

          <div className="purchase-controls">

            {/* Quantity */}
            <div className="quantity-counter">

              <button
                type="button"
                onClick={handleDecreaseQuantity}
                aria-label="Decrease quantity"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={handleIncreaseQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>

            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-add-cart"
            >
              Add to Cart
            </button>

          </div>

          {/* =========================
              PRODUCT INFORMATION
          ========================= */}

          <div className="meta-info-block">

            <p>
              <strong>Category:</strong>{" "}
              {product.category || "Beauty"}
            </p>

            {product.brand && (
              <p>
                <strong>Brand:</strong>{" "}
                {product.brand}
              </p>
            )}

            <p>
              <strong>Availability:</strong>{" "}
              In Stock
            </p>

          </div>

          {/* =========================
              REVIEWS
          ========================= */}

          <div className="add-review-form-container">

            <h4>
              Customer Reviews
            </h4>

            {/* Existing Reviews */}

            {product.reviews &&
            product.reviews.length > 0 ? (
              <div
                style={{
                  marginBottom: "24px",
                }}
              >
                {product.reviews.map(
                  (rev, index) => (
                    <div
                      key={
                        rev._id || index
                      }
                      className="ui-review-card"
                    >

                      <div className="rev-header">

                        <strong>
                          {rev.name ||
                            "Anonymous"}
                        </strong>

                        <span className="rev-stars">
                          {"★".repeat(
                            Math.max(
                              0,
                              Math.min(
                                5,
                                Number(
                                  rev.rating
                                ) || 0
                              )
                            )
                          )}
                        </span>

                      </div>

                      <p>
                        {rev.comment}
                      </p>

                    </div>
                  )
                )}
              </div>
            ) : (
              <p
                style={{
                  color: "#888",
                  marginBottom: "20px",
                  fontSize: "13px",
                }}
              >
                No reviews yet. Be the first
                to leave one!
              </p>
            )}

            {/* =========================
                REVIEW FORM
            ========================= */}

            <form onSubmit={handleReviewSubmit}>

              {/* Review message */}

              {reviewMessage && (
                <p
                  style={{
                    color:
                      reviewMessage.includes(
                        "successfully"
                      )
                        ? "#123b23"
                        : "#a52a2a",
                    fontWeight: "600",
                    fontSize: "13px",
                    marginBottom: "15px",
                  }}
                >
                  {reviewMessage}
                </p>
              )}

              {/* Name */}

              <div className="review-form-group">

                <label htmlFor="reviewerName">
                  Your Name
                </label>

                <input
                  id="reviewerName"
                  type="text"
                  placeholder="Your name (optional)"
                  value={reviewerName}
                  onChange={(e) =>
                    setReviewerName(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Rating */}

              <div className="review-form-group">

                <label htmlFor="rating">
                  Rating
                </label>

                <select
                  id="rating"
                  value={rating}
                  onChange={(e) =>
                    setRating(
                      Number(
                        e.target.value
                      )
                    )
                  }
                >
                  {[5, 4, 3, 2, 1].map(
                    (r) => (
                      <option
                        key={r}
                        value={r}
                      >
                        {r} Star
                        {r > 1
                          ? "s"
                          : ""}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* Comment */}

              <div className="review-form-group">

                <label htmlFor="comment">
                  Your Review
                </label>

                <textarea
                  id="comment"
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) =>
                    setComment(
                      e.target.value
                    )
                  }
                  required
                  rows={4}
                />

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={
                  submittingReview
                }
                className="btn-submit-review"
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </form>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;