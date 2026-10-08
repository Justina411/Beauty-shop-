export const API_BASE = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? "https://beauty-shop-2k9f.onrender.com" 
    : "http://localhost:5000");