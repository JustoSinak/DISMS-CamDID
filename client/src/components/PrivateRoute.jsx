import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the attempted location
    return <Navigate to="/login-as" state={{ from: location }} replace />;
  }

  // Allow access to create-identity page regardless of role
  if (location.pathname === '/create-identity') {
    return children;
  }

  // Check if user is trying to access the correct dashboard for their role
  const currentPath = location.pathname;
  const userRole = user?.role;
  const isCorrectDashboard = currentPath.includes(`/dashboard/${userRole}`);

  if (!isCorrectDashboard) {
    // Redirect to the correct dashboard for their role
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }

  return children;
};

export default PrivateRoute; 