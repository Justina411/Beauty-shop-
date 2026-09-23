import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { useCart } from "../Context/CartContext";
import "../styles/login.css";

const API_BASE_URL = "http://localhost:5000/api/auth";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Helper function to handle pending cart items and navigation post-auth
  const handlePostAuthRedirect = () => {
    const pendingItem = localStorage.getItem("pendingCartItem");
    if (pendingItem) {
      try {
        const item = JSON.parse(pendingItem);
        addToCart(item, item.quantity || 1);
        localStorage.removeItem("pendingCartItem");
        navigate("/cart");
        return;
      } catch (err) {
        console.error("Error parsing pending cart item:", err);
        localStorage.removeItem("pendingCartItem");
      }
    }
    navigate("/");
  };

  // RESTRICT ACCESS: Redirect to home ONLY if token actually exists
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      handlePostAuthRedirect();
    }
  }, [navigate]);

  const handleModeSwitch = (toSignUp) => {
    setIsSignUp(toSignUp);
    setError("");
    setSignUpData({ name: "", email: "", password: "" });
    setLoginData({ email: "", password: "" });
  };

  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // Password Strength Check Rule
  const isStrongPassword = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isStrongPassword(signUpData.password)) {
      setError(
        "Password must be at least 8 characters long, containing uppercase, lowercase, number, and special character (@$!%*?&)."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Save token and user details to log user in
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("current_user", JSON.stringify(data.user));

      // Process pending cart item or redirect
      handlePostAuthRedirect();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and user details to log user in
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("current_user", JSON.stringify(data.user));

      // Process pending cart item or redirect
      handlePostAuthRedirect();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="auth-page">
        <div className={`auth-container ${isSignUp ? "signup-mode" : "login-mode"}`}>
          
          {/* SLIDING OVERLAY PANEL */}
          <div className="overlay-panel">
            {isSignUp ? (
              <>
                <h2>Welcome Back!</h2>
                <p>Already have an account? Log in to access your profile.</p>
                <button type="button" className="toggle-btn" onClick={() => handleModeSwitch(false)}>
                  Log In
                </button>
              </>
            ) : (
              <>
                <h2>Create Account</h2>
                <p>Join Beauty Shop today to start shopping!</p>
                <button type="button" className="toggle-btn" onClick={() => handleModeSwitch(true)}>
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* LEFT SIDE: LOGIN */}
          <div className="form-box login-box">
            <h2>Login to Beauty Shop</h2>
            <p>Welcome back! Please enter your details.</p>

            {error && !isSignUp && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE: SIGN UP */}
          <div className="form-box signup-box">
            <h2>Create Account</h2>
            <p>Fill in your details below to get started.</p>

            {error && isSignUp && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSignUpSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showSignUpPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  >
                    {showSignUpPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;