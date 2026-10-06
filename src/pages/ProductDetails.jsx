import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../apiConfig";

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

  if (loading) return <div className="p-6 text-center">Loading product...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!product) return <div className="p-6 text-center">Product not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Product Images */}
      <div>
        <div className="w-full h-96 mb-4 rounded-lg overflow-hidden border">
          <img
            src={selectedImage || product.image}
            alt={product.title || product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {product.images && product.images.length > 1 && (
          <div className="flex space-x-2">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => setSelectedImage(img)}
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                  selectedImage === img ? "border-black" : "border-transparent"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.title || product.name}</h1>
        <p className="text-2xl font-semibold text-green-700 mb-4">
          ${currentPrice.toFixed(2)}
        </p>
        <p className="text-gray-600 mb-6">{product.description}</p>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-6">
            <label className="block font-medium mb-2">Select Size:</label>
            <div className="flex space-x-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded ${
                    selectedSize === size
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Picker */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="font-medium">Quantity:</label>
          <div className="flex items-center border rounded">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 text-lg font-bold hover:bg-gray-200"
            >
              -
            </button>
            <span className="px-4 py-1">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 text-lg font-bold hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>

        {/* Reviews Section */}
        <div className="mt-12 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

          {/* Add Review Form */}
          <form onSubmit={handleReviewSubmit} className="mb-6 space-y-4">
            {reviewMessage && (
              <p className="text-sm font-semibold text-blue-600">{reviewMessage}</p>
            )}
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <div className="flex items-center space-x-2">
              <label className="font-medium">Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="border p-2 rounded"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={3}
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>

          {/* Reviews List */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((rev, index) => (
                <div key={rev._id || index} className="p-4 border rounded shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{rev.name || "Anonymous"}</span>
                    <span className="text-yellow-500 font-bold">
                      {"★".repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="text-gray-700">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to leave one!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;