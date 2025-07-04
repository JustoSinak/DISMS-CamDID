import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/login" />;
};

export default AdminRoute;
