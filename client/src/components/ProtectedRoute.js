import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading secure environment...</p>
      </div>
    );
  }
  
  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If the user doesn't have a registered DID and isn't on the register-id page
  // redirect them to complete registration first
  if (!user.did && !window.location.pathname.includes('/register-id')) {
    return <Navigate to="/register-id" replace />;
  }
  
  // If all conditions are met, render the protected content
  return children;
};

export default ProtectedRoute;