import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const storedUser = localStorage.getItem("Users");

  if (!storedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}