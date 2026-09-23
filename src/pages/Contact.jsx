import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import "../styles/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit directly to Backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMsg({
          type: "success",
          text: "Thank you! Your message has been received. We will get back to you shortly.",
        });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatusMsg({
          type: "error",
          text: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Submit Error:", error);
      setStatusMsg({
        type: "error",
        text: "Server error. Please check your internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Direct WhatsApp Send Action
  const handleWhatsAppSend = () => {
    if (!formData.name || !formData.message) {
      alert("Please enter your name and message first.");
      return;
    }
    const whatsappNumber = "2348141105863";
    const text = `Hello Beauty Shop!%0A%0AName: ${formData.name}%0AEmail: ${formData.email}%0A%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <>
      <Navbar />

      <div className="contact-page">
        {/* HERO */}
        <div className="contact-header">
          <span>GET IN TOUCH</span>
          <h1>Contact Us</h1>
          <p>
            Have a question, need help with an order, or want to book an
            appointment? We'd love to hear from you.
          </p>
        </div>

        {/* CONTACT CONTENT */}
        <div className="contact-container">
          {/* LEFT SIDE */}
          <div className="contact-info">
            <div className="contact-info-heading">
              <span>CONTACT INFORMATION</span>
              <h2>Get In Touch</h2>
              <p>
                Reach out to us anytime. We're always happy to assist you.
              </p>
            </div>

            {/* WHATSAPP */}
            <a
              href="https://wa.me/2348141105863"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-item"
            >
              <div className="contact-icon">
                <FaWhatsapp />
              </div>
              <div>
                <h4>WhatsApp</h4>
                <p>0814 110 5863</p>
              </div>
            </a>

            {/* EMAIL */}
            <a
              href="mailto:atujustinairuoma411@gmail.com"
              className="contact-item"
            >
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <div>
                <h4>Email Us</h4>
                <p>atujustinairuoma411@gmail.com</p>
              </div>
            </a>

            {/* PHONE CALL */}
            <a href="tel:+2348141105863" className="contact-item">
              <div className="contact-icon">
                <FaPhoneAlt />
              </div>
              <div>
                <h4>Call Us</h4>
                <p>0814 110 5863</p>
              </div>
            </a>

            {/* LOCATION */}
            <div className="contact-item location-item">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h4>Location</h4>
                <p>Nigeria</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="contact-form-container">
            <div className="form-heading">
              <span>SEND US A MESSAGE</span>
              <h2>Let's Talk Beauty</h2>
              <p>
                Fill in the form below to send us a direct message.
              </p>
            </div>

            {statusMsg.text && (
              <div className={`status-banner ${statusMsg.type}`}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="contact-form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-group">
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

              <div className="contact-form-group">
                <label>Your Message</label>
                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="send-message-btn"
                  disabled={loading}
                >
                  <FaPaperPlane />
                  {loading ? "Sending Message..." : "Send Message"}
                </button>

                <button
                  type="button"
                  className="whatsapp-alt-btn"
                  onClick={handleWhatsAppSend}
                >
                  <FaWhatsapp /> Send via WhatsApp
                </button>
              </div>
            </form>

            <div className="quick-contact">
              <p>Or contact us directly</p>
              <div className="quick-contact-icons">
                <a
                  href="https://wa.me/2348141105863"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href="mailto:atujustinairuoma411@gmail.com"
                  title="Email"
                >
                  <FaEnvelope />
                </a>
                <a href="tel:+2348141105863" title="Call">
                  <FaPhoneAlt />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TRUST SECTION */}
        <div className="contact-bottom">
          <div className="contact-bottom-box">
            <span>💬</span>
            <div>
              <h3>Quick Response</h3>
              <p>Send us a message and we'll get back to you as soon as possible.</p>
            </div>
          </div>

          <div className="contact-bottom-box">
            <span>💚</span>
            <div>
              <h3>We're Here To Help</h3>
              <p>Need help with a product, order or appointment? Reach out anytime.</p>
            </div>
          </div>

          <div className="contact-bottom-box">
            <span>✨</span>
            <div>
              <h3>Beauty Made Easy</h3>
              <p>Your beauty needs are important to us, and we're happy to assist.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;