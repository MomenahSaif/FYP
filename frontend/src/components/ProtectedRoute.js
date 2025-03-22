import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userEmail = localStorage.getItem('userEmail'); // Get the logged-in user's email

  // If the user is NOT an admin, redirect them to the home page
  if (userEmail !== "admin@gmail.com") {
    return <Navigate to="/" replace />;
  }

  // If the user is admin, allow access
  return children;
};

export default ProtectedRoute;
