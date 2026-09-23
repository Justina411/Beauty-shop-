import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/book.css";

const slides = [
  {
    image: "/images/make.jpg",
    title: "Luxury Makeup",
    description:
      "Professional makeup services for weddings, birthdays and every special occasion.",
  },
  {
    image: "/images/healthyhair.jpg",
    title: "Healthy Hair",
    description:
      "Premium haircare treatments that restore shine and strength.",
  },
  {
    image: "/images/hairdresser.jpg",
    title: "Professional Hair Styling",
    description:
      "Transform your look with our expert hairstylists and premium products.",
  },
  {
    image: "/images/skin.jpg",
    title: "Glowing Skin",
    description:
      "Reveal radiant skin with our luxury skincare treatments.",
  },
  {
    image: "/images/fragrancemodels.jpg",
    title: "Luxury Fragrances",
    description:
      "Discover elegant fragrances that match your personality.",
  },
  {
    image: "/images/Nailsscene.jpg",
    title: "Perfect Nails",
    description:
      "Beautiful manicure and nail art crafted to perfection.",
  },
  {
    image: "/images/download (88).jpg",
    title: "Luxury Beauty",
    description:
      "Experience premium beauty services in a relaxing environment.",
  },
  {
    image: "/images/classynails.jpg",
    title: "Elegant Nail Studio",
    description:
      "Luxury nail care with beautiful designs you'll love.",
  },
  {
    image: "/images/lashes.jpg",
    title: "Beautiful Lashes",
    description:
      "Natural and dramatic lash extensions for every occasion.",
  },
  {
    image: "/images/download (89).jpg",
    title: "Elegant Nail Studio",
    description:
      "Luxury nail care with beautiful designs you'll love.",
  },
  {
    image: "/images/consultation.jpg",
    title: "Beauty Consultation",
    description:
      "Book a one-on-one beauty consultation with our experts.",
  },
  {
    image: "/images/beauty.jpg",
    title: "Beauty Experience",
    description:
      "Where luxury beauty meets exceptional customer care.",
  },
];

const Book = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [validSlides, setValidSlides] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    request: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ===========================
     CHECK WHICH IMAGES EXIST
  =========================== */

  useEffect(() => {
    const checkImages = async () => {
      const imageChecks = slides.map((slide) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = slide.image;

          img.onload = () => resolve(slide);
          img.onerror = () => {
            console.error(`Image failed to load: ${slide.image}`);
            resolve(null);
          };
        });
      });

      const results = await Promise.all(imageChecks);
      const workingSlides = results.filter((slide) => slide !== null);

      setValidSlides(workingSlides);
    };

    checkImages();
  }, []);

  /* ===========================
     AUTOMATIC SLIDER
  =========================== */

  useEffect(() => {
    if (validSlides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % validSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [validSlides.length]);

  /* ===========================
     FORM FUNCTIONS
  =========================== */

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
      } else {
        setErrorMessage(data.message || "Failed to book appointment.");
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      setErrorMessage("Network error. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAnother = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      date: "",
      time: "",
      request: "",
    });
    setErrorMessage("");
    setShowSuccess(false);
  };

  /* ===========================
     LOADING WHILE IMAGES LOAD
  =========================== */

  if (validSlides.length === 0) {
    return (
      <>
        <Navbar />
        <section className="book-page">
          <div className="book-left">
            <div className="book-overlay"></div>
          </div>
          <div className="book-right">
            <p>Loading...</p>
          </div>
        </section>
      </>
    );
  }

  const activeSlide = validSlides[currentSlide];

  return (
    <>
      <Navbar />

      <section className="book-page">
        {/* LEFT SIDE */}
        <div
          className="book-left"
          style={{
            backgroundImage: `url("${activeSlide.image}")`,
          }}
        >
          <div className="book-overlay"></div>

          <div className="book-image-content">
            <span>BEAUTY SHOP</span>
            <h1>{activeSlide.title}</h1>
            <p>{activeSlide.description}</p>

            <div className="slider-dots">
              {validSlides.map((_, index) => (
                <div
                  key={index}
                  className={currentSlide === index ? "dot active" : "dot"}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="book-right">
          <div className="form-box">
            <small>BOOK NOW</small>
            <h2>Book Appointment</h2>
            <p>
              Fill in your details below and we'll reserve your preferred beauty session.
            </p>

            {errorMessage && (
              <p style={{ color: "red", fontSize: "14px", marginBottom: "15px" }}>
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Select Service</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose Service</option>
                  <option>Professional Makeup</option>
                  <option>Luxury Skincare</option>
                  <option>Haircare Treatment</option>
                  <option>Nail Care</option>
                  <option>Lash Extension</option>
                  <option>Fragrance Consultation</option>
                </select>
              </div>

              <div className="double-input">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    min={today}
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    min="09:00"
                    max="18:00"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Request</label>
                <textarea
                  rows="5"
                  name="request"
                  placeholder="Anything you'd like us to know?"
                  value={formData.request}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="book-btn" disabled={loading}>
                {loading ? "Processing..." : "Book Appointment"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* LOADING POPUP */}
      {loading && (
        <div className="popup-overlay">
          <div className="loading-popup">
            <div className="loader"></div>
            <h2>Booking Appointment...</h2>
            <p>Please wait while we reserve your beauty session.</p>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>
            <h2>Appointment Booked!</h2>
            <p>
              <strong>{formData.name}</strong>, your appointment has been successfully booked.
              <br />
              <br />
              We can't wait to have you at <strong>Beauty Shop.</strong>
              <br />
              <br />
              One of our beauty experts will contact you shortly to confirm your appointment.
            </p>

            <div className="popup-buttons">
              <Link to="/shop" className="continue-shopping-btn">
                Continue Shopping
              </Link>
              <button className="book-again-btn" onClick={handleBookAnother}>
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Book;