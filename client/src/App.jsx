import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

// Auth Components
import Login from './components/auth/Login';
import RegisterCitizen from './components/auth/RegisterCitizen';
import RegisterVerifier from './components/auth/RegisterVerifier';
import RegisterIssuer from './components/auth/RegisterIssuer';
import RoleSelection from './components/auth/RoleSelection';

// Main Components
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Role-specific Components
import CitizenDashboard from './pages/citizen/Dashboard';
import IssuerDashboard from './pages/issuer/Dashboard';
import VerifierDashboard from './pages/verifier/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          
          {/* Auth Routes */}
          <Route path="/login-as" element={<RoleSelection mode="login" />} />
          <Route path="/register-as" element={<RoleSelection mode="register" />} />
          <Route path="/login/:role" element={<Login />} />
          
          {/* Role-specific Registration Routes */}
          <Route path="/register/citizen" element={<RegisterCitizen />} />
          <Route path="/register/verifier" element={<RegisterVerifier />} />
          <Route path="/register/issuer" element={<RegisterIssuer />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Role-specific Routes */}
          <Route
            path="/citizen/*"
            element={
              <PrivateRoute requiredRole="citizen">
                <CitizenDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/issuer/*"
            element={
              <PrivateRoute requiredRole="issuer">
                <IssuerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/verifier/*"
            element={
              <PrivateRoute requiredRole="verifier">
                <VerifierDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* Redirect /login and /register to role selection */}
          <Route path="/login" element={<Navigate to="/login-as" replace />} />
          <Route path="/register" element={<Navigate to="/register-as" replace />} />

          {/* Redirect authenticated users based on their role */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                {({ user }) => {
                  switch (user.role) {
                    case 'citizen':
                      return <Navigate to="/citizen/dashboard" replace />;
                    case 'issuer':
                      return <Navigate to="/issuer/dashboard" replace />;
                    case 'verifier':
                      return <Navigate to="/verifier/dashboard" replace />;
                    case 'admin':
                      return <Navigate to="/admin/dashboard" replace />;
                    default:
                      return <Dashboard />;
                  }
                }}
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 