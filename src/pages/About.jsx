import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/about.css";

import Aboutmodel from "/images/aboutmodel.png";
import Skincaremodel from "/images/skincaremodel.jpg";
import Fragrancemodel from "/images/fragrancemodel.jpg";
import Haircaremodel from "/images/haircaremodel.jpg";
import Speaker from "/images/download (84).jpg";

import Haircare from "/images/makeup shoots.jpg";
import Nailcares from "/images/Nails.jpg";
import Makeup from "/images/Makeups.jpg";
import Lash from "/images/download (86).jpg";
import Fragrances from "/images/fragrance.jpg";
import Skincares from "/images/Skincares.jpg";
import Beautymodel from "/images/aboutbeauty.jpg";
import Navbar from "../components/Navbar";

function About() {
  // Raw targets from DB or defaults
  const [counts, setCounts] = useState({
    products: 0,
    customers: 0,
    experts: 0,
    brands: 0,
  });

  // Display state for animated counter
  const [displayStats, setDisplayStats] = useState({
    products: 0,
    customers: 0,
    experts: 0,
    brands: 0,
  });

  // 1. Fetch live stats from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCounts({
            products: data.stats.products || 50,
            customers: data.stats.customers || 120,
            experts: 30, // Static baseline for experts
            brands: data.stats.brands || 20,
          });
        }
      })
      .catch((err) => {
        console.log("Using fallback counts for animation:", err);
        setCounts({
          products: 5000,
          customers: 2500,
          experts: 30,
          brands: 20,
        });
      });
  }, []);

  // 2. Animate counter continuously in a loop
  useEffect(() => {
    // Only run if we actually have numbers to count to
    if (counts.products === 0) return;

    const duration = 2500; // Time taken to count up (2.5 seconds)
    const holdDuration = 4000; // Time to pause on final numbers before restarting (4 seconds)
    const frameDuration = 1000 / 60; // 60 FPS update speed
    const totalFrames = Math.round(duration / frameDuration);

    let timer;
    let holdTimer;

    const runCounter = () => {
      let frame = 0;
      
      // Smooth counting interval
      timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        setDisplayStats({
          products: Math.floor(counts.products * progress),
          customers: Math.floor(counts.customers * progress),
          experts: Math.floor(counts.experts * progress),
          brands: Math.floor(counts.brands * progress),
        });

        // Once counting reaches target, hold, then loop
        if (frame >= totalFrames) {
          clearInterval(timer);
          setDisplayStats(counts); // Ensure exact target is hit

          // Pause on the full count, then reset and start over
          holdTimer = setTimeout(() => {
            runCounter();
          }, holdDuration);
        }
      }, frameDuration);
    };

    runCounter();

    // Cleanup function to stop timers if the component unmounts
    return () => {
      clearInterval(timer);
      clearTimeout(holdTimer);
    };
  }, [counts]);

  return (
    <>
      <Navbar />
      <main className="about-page">
        <section className="about-hero">
          <div className="hero-content">
            <span className="hero-tag">ABOUT BEAUTY SHOP</span>
            <h1>
              Beauty Begins
              <br />
              With Confidence
            </h1>
            <p>
              At Beauty Shop, we believe beauty is more than appearance—it's
              confidence, self-expression and self-care. We provide authentic
              makeup, skincare, haircare, fragrances, lash products and
              professional beauty services all in one place.
            </p>
            <div className="hero-btns">
              <Link to="/shop">
                <button className="primary-btn">Shop Products</button>
              </Link>
              <Link to="/book">
                <button className="secondary-btn">Book Appointment</button>
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img src={Aboutmodel} alt="Beauty Model" />
            <div className="circle one"></div>
            <div className="circle two"></div>
          </div>
        </section>

        {/* ================= OUR STORY ================= */}
        <section className="our-story">
          <div className="story-images">
            <div className="img-card large">
              <img src={Haircaremodel} alt="Hair Care" />
            </div>
            <div className="small-images">
              <div className="img-card">
                <img src={Fragrancemodel} alt="Fragrance" />
              </div>
              <div className="img-card">
                <img src={Skincaremodel} alt="Skincare" />
              </div>
            </div>
          </div>

          <div className="story-content">
            <span>WHO WE ARE</span>
            <h2>
              Your Trusted
              <br />
              Beauty Destination
            </h2>
            <p>
              We are passionate about helping every woman discover her confidence
              through premium beauty products and exceptional beauty services.
              Whether you're shopping for skincare, makeup, luxury fragrances,
              haircare or booking a professional makeover, Beauty Shop provides
              everything you need under one beautiful experience.
            </p>
            <div className="story-features">
              <div>
                <h3>✓ Authentic Products</h3>
                <p>Premium beauty brands sourced from trusted suppliers.</p>
              </div>
              <div>
                <h3>✓ Beauty Experts</h3>
                <p>Experienced professionals dedicated to your beauty journey.</p>
              </div>
              <div>
                <h3>✓ Fast Delivery</h3>
                <p>Nationwide delivery right to your doorstep.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}
        <section className="services">
          <span className="section-tag">OUR SERVICES</span>
          <h2>
            Everything You Need
            <br />
            To Look Beautiful
          </h2>
          <div className="service-grid">
            <div className="service-card">
              <div className="service-icon">💄</div>
              <h3>Makeup</h3>
              <p>Luxury makeup collections from trusted brands.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌿</div>
              <h3>Skincare</h3>
              <p>Products designed to nourish and protect your skin.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💇🏽‍♀️</div>
              <h3>Hair Care</h3>
              <p>Healthy hair starts with premium hair products.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">👁</div>
              <h3>Lashes</h3>
              <p>Beautiful lashes that enhance your natural beauty.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🌸</div>
              <h3>Fragrances</h3>
              <p>Signature scents for every personality and occasion.</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📅</div>
              <h3>Appointments</h3>
              <p>Book beauty sessions with our experienced professionals.</p>
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE US ================= */}
        <section className="why-us">
          <div className="why-left">
            <span>WHY CHOOSE US</span>
            <h2>
              Experience Luxury
              <br />
              Beauty Like Never Before
            </h2>
            <p>
              We combine premium products with outstanding customer service
              to create an unforgettable shopping and beauty experience.
            </p>
            <div className="why-list">
              <div>✔ 100% Authentic Products</div>
              <div>✔ Secure Payment</div>
              <div>✔ Fast Nationwide Delivery</div>
              <div>✔ Professional Beauty Experts</div>
              <div>✔ Affordable Luxury</div>
              <div>✔ Easy Appointment Booking</div>
            </div>
          </div>
          <div className="why-right">
            <img src={Speaker} alt="Beauty Expert" />
          </div>
        </section>

        {/* ================= GALLERY ================= */}
        <section className="gallery">
          <span className="section-tag">BEAUTY GALLERY</span>
          <h2>Explore Our Beautiful Collection</h2>
          <div className="gallery-grid">
            <div className="gallery-item large">
              <img src={Haircare} alt="Hair Care" />
            </div>
            <div className="gallery-item">
              <img src={Fragrances} alt="Fragrance" />
            </div>
            <div className="gallery-item">
              <img src={Makeup} alt="Makeup" />
            </div>
            <div className="gallery-item">
              <img src={Lash} alt="Lashes" />
            </div>
            <div className="gallery-item large">
              <img src={Nailcares} alt="Nails" />
            </div>
            <div className="gallery-item">
              <img src={Skincares} alt="Skincare" />
            </div>
          </div>
        </section>

        {/* ================= BOOKING PROCESS ================= */}
        <section className="booking-process">
          <span className="section-tag">HOW IT WORKS</span>
          <h2>Book Your Beauty Appointment In Minutes</h2>
          <div className="process-container">
            <div className="process-card">
              <div className="number">01</div>
              <h3>Select Service</h3>
              <p>Choose your desired beauty service or shop products.</p>
            </div>
            <div className="process-card">
              <div className="number">02</div>
              <h3>Choose Date</h3>
              <p>Pick your preferred appointment date and time.</p>
            </div>
            <div className="process-card">
              <div className="number">03</div>
              <h3>Confirm Booking</h3>
              <p>Complete your booking securely online.</p>
            </div>
            <div className="process-card">
              <div className="number">04</div>
              <h3>Enjoy Your Beauty Session</h3>
              <p>Visit us and let our experts take care of you.</p>
            </div>
          </div>
        </section>

        {/* ================= ANIMATED STATS ================= */}
        <section className="stats-section">
          <div className="stat-box">
            <h2>{displayStats.products}+</h2>
            <p>Beauty Products</p>
          </div>
          <div className="stat-box">
            <h2>{displayStats.customers}+</h2>
            <p>Happy Customers</p>
          </div>
          <div className="stat-box">
            <h2>{displayStats.experts}+</h2>
            <p>Beauty Experts</p>
          </div>
          <div className="stat-box">
            <h2>{displayStats.brands}+</h2>
            <p>Premium Brands</p>
          </div>
        </section>

        {/* ================= TESTIMONIALS ================= */}
        <section className="testimonials">
          <span className="section-tag">TESTIMONIALS</span>
          <h2>What Our Customers Say</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>
                "The products are authentic and delivery was incredibly fast.
                I'll definitely shop again."
              </p>
              <h4>★★★★★</h4>
              <span>— Happy Customer</span>
            </div>
            <div className="testimonial-card">
              <p>
                "Booking my makeup appointment was easy and the service exceeded my expectations."
              </p>
              <h4>★★★★★</h4>
              <span>— Beauty Lover</span>
            </div>
            <div className="testimonial-card">
              <p>
                "I absolutely love the fragrance collection. Beautiful packaging and amazing customer service."
              </p>
              <h4>★★★★★</h4>
              <span>— Returning Client</span>
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION ================= */}
        <section className="about-cta">
          <div className="cta-content">
            <h2>
              Ready To
              <br />
              Transform Your Beauty?
            </h2>
            <p>
              Discover premium beauty products or schedule your next appointment with our professional beauty specialists.
            </p>
            <div className="cta-buttons">
              <Link to="/shop">
                <button className="primary-btn">Shop Now</button>
              </Link>
              <Link to="/book">
                <button className="secondary-btn">Book Appointment</button>
              </Link>
            </div>
          </div>
          <div className="cta-image">
            <img src={Beautymodel} alt="Beauty Model" />
          </div>
        </section>
      </main>
    </>
  );
}

export default About;