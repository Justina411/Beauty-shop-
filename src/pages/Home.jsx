import { Link } from "react-router-dom";
import React from "react";
import "../styles/home.css";
import Navbar from "../components/Navbar";

import Model from "/images/model1.png";
import Skincare from "/images/skincare.jpg";
import Haircare from "/images/haircare.jpg";
import Nailcare from "/images/nailcare.jpg";
import Fragrances from "/images/fragrances.jpg";
import Makeup from "/images/makeup.jpg";
import Model3 from "/images/model3.png"; 
import Model4 from "/images/model4.png"; 
import Model2 from "/images/model2.jpg"; 


const Home = () => {
  return (
    <>
    <Navbar/>
    <div className="home">

     
      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            Glow with Confidence, Shop With Trust
          </div>
          <h1>
            Your Ultimate <span>Beauty & Cosmetics Hub</span>
          </h1>
          <p>
            Beauty shop gives elegance, glow and love using the art of makeup and skincare
          </p>
          <div className="hero-buttons">
            <Link to="/shop"><button className="btn-primary">Shop Now</button></Link>
            <Link to="/shop"><button className="btn-link">View all products </button></Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-placeholder">
            <img src={Model} alt="Model" className="hero-model-img" />
          </div>
        </div>
      </section>

    
      <div className="scroll-bar">
        <div className="scroll-track">
          <span>Skin care 🪙 </span><span>Makeup🪙</span><span>Nail Care 🪙</span><span>Hair Care 🪙</span><span>Fragrances 🪙</span><span>Body Care 🪙</span>
          <span>Skin care 🪙</span><span>Makeup 🪙</span><span>Nail Care 🪙</span><span>Hair Care 🪙</span><span>Fragrances 🪙</span><span>Body Care 🪙</span>
        </div>
      </div>

     
      <section className="categories">
        <h2>Our Categories</h2>
        <h3>Shop By <span>Category</span></h3>

        <div className="category-grid">
          <div className="cat-card">
            <div className="img-placeholder">
              <img src={Skincare} alt="Skin care" />
            </div>
            <p className="cat-title">Skin care</p>
            <small className="cat-count">32 products</small>
          </div>

          <div className="cat-card">
            <div className="img-placeholder">
              <img src={Makeup} alt="Make up" />
            </div>
            <p className="cat-title">Make up</p>
            <small className="cat-count">16 products</small>
          </div>

          <div className="cat-card">
            <div className="img-placeholder">
              <img src={Haircare} alt="Hair care" />
            </div>
            <p className="cat-title">Hair care</p>
            <small className="cat-count">60 products</small>
          </div>

          <div className="cat-card">
            <div className="img-placeholder">
              <img src={Fragrances} alt="Fragrances" />
            </div>
            <p className="cat-title">Fragrances</p>
            <small className="cat-count">80 products</small>
          </div>

          <div className="cat-card">
            <div className="img-placeholder">
              <img src={Nailcare} alt="Nail care" />
            </div>
            <p className="cat-title">Nail care</p>
            <small className="cat-count">40 products</small>
          </div>
        </div>
      </section>

     
      <section className="promo">
        <div className="promo-card dark">
          <div className="tag">First 25% Discount</div>
          <h3>Special <span>Hair Care</span> Deals</h3>
          <p>Beauty shop gives 25% hair  <br />discount</p>
          <Link to="/shop"><button className="btn-promo-dark">Shop Now </button></Link>
          <div className="promo-img">
            <img src={Model3} alt="Hair care promo" />
          </div>
        </div>

        <div className="promo-card light">
          <div className="tag">First 25% Discount</div>
          <h3>Save Big On <span>Skincare</span></h3>
          <p>Beauty shop gives 20% skin  <br />discount</p>
          <Link to="/shop"><button className="btn-promo-light">Shop Now </button></Link>
          <div className="promo-img">
            <img src={Model4} alt="Skincare promo" />
          </div>
        </div>
      </section>

      <section className="about">
      
        <div className="about-image-wrapper">
          <img src={Model2} alt="About Us Portrait" className="about-single-img" />
        </div>

        <div className="about-text">
          <h2>About Us</h2>
          <h3>Your Journey to <span>Effortless Elegance</span></h3>
          <p>
            Beauty shop gives elegance, glow and love using makeup and skincare products.
          </p>

          <div className="stats-container">
            <div className="stat-box">
              <h4>24+</h4>
              <p>Categories</p>
            </div>
            <div className="stat-box-divider"></div>
            <div className="stat-box">
              <h4>2500+</h4>
              <p>Products</p>
            </div>
            <div className="stat-box-divider"></div>
            <div className="stat-box">
              <h4>99%</h4>
              <p>Satisfied customer</p>
            </div>
          </div>
        </div>
      </section>

    </div>
      <section className="newsletter">
        <div className="newsletter-card">
          <div className="newsletter-content">
            <h2>Join Our Newsletter</h2>
            <h3>Subscribe to get <span>20% off</span> your first order</h3>
            <p>Stay up to date with our latest collections, exclusive offers, and beauty tips.</p>
          </div>
          
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                required 
              />
              <button type="submit" className="btn-submit">
                Subscribe 
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;