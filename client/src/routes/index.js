import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import CreateIdentity from '../pages/CreateIdentity';
import ChooseCredentialType from '../pages/ChooseCredentialType'; // Import the new page
import ShareIdentity from '../pages/ShareIdentity';
import ViewCredential from '../pages/ViewCredential';
import MyIdentity from '../pages/MyIdentity';
import SchemaRegistry from '../pages/admin/SchemaRegistry';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-credential" element={<ChooseCredentialType />} /> {/* New route for choosing type */}
          <Route path="create-identity/initial" element={<CreateIdentity />} /> {/* Updated route for initial identity */}
          <Route path="share-identity" element={<ShareIdentity />} />
          <Route path="view-credential/:credentialId" element={<ViewCredential />} />
          <Route path="my-identity" element={<MyIdentity />} />
          <Route path="admin/schema-registry" element={<SchemaRegistry />} />
        </Route>

        {/* Share Route */}
        <Route path="/share" element={<ShareIdentity />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
