export const API_BASE = 
  import.meta.env.VITE_API_BASE_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://https://beauty-shop-2k9f.onrender.com" // Replace with your actual live backend URL
    : "http://localhost:5000");