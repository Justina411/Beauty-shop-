import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Check if token exists in localStorage
  const token = localStorage.getItem("auth_token");

  // If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the requested page/component
  return children;
};

export default ProtectedRoute;