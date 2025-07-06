import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user, 'path:', location.pathname);

  if (loading) {
    console.log('PrivateRoute - Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('PrivateRoute - Not authenticated, redirecting to login');
    // Redirect to login with the attempted location
    return <Navigate to="/login-as" state={{ from: location }} replace />;
  }

  // Allow access to most protected routes
  // Only redirect to correct dashboard if user is trying to access a different role's dashboard
  const currentPath = location.pathname;
  const userRole = user?.role;

  console.log('PrivateRoute - User role:', userRole, 'Requested path:', currentPath);

  // Check if user is trying to access a dashboard route
  if (currentPath.startsWith('/dashboard/')) {
    const requestedRole = currentPath.split('/')[2];
    if (requestedRole && requestedRole !== userRole) {
      console.log('PrivateRoute - Role mismatch, redirecting to correct dashboard');
      // Redirect to the correct dashboard for their role
      return <Navigate to={`/dashboard/${userRole}`} replace />;
    }
  }

  console.log('PrivateRoute - Access granted, rendering children');
  return children;
};

export default PrivateRoute; 