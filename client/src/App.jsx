import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';
import CitizenDashboard from './components/dashboard/CitizenDashboard';
import VerifierDashboard from './components/dashboard/VerifierDashboard';
import IssuerDashboard from './components/dashboard/IssuerDashboard';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import CreateIdentity from './pages/CreateIdentity';
import UserDashboard from './components/dashboard/UserDashboard';
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Credentials from './pages/citizen/Credentials';
import CreateCredential from './pages/citizen/CreateCredential';

// Wrap component with Layout if it's a page that should have the common layout
const withLayout = (Component) => {
  return (props) => (
    <Layout>
      <Component {...props} />
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Web3Provider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={withLayout(Home)()} />
              <Route path="/about" element={withLayout(About)()} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={withLayout(Contact)()} />
              <Route path="/create-identity" element={
                <PrivateRoute>
                  {withLayout(CreateIdentity)()}
                </PrivateRoute>
              } />
              
              {/* Role selection routes */}
              <Route path="/register-as" element={<RoleSelection />} />
              <Route path="/login-as" element={<RoleSelection />} />
              
              {/* Role-specific auth routes */}
              <Route path="/register/:role" element={<Register />} />
              <Route path="/login/:role" element={<Login />} />
              
              {/* Protected dashboard routes */}
              <Route
                path="/dashboard/citizen"
                element={
                  <PrivateRoute>
                    <CitizenDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/verifier"
                element={
                  <PrivateRoute>
                    <VerifierDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/issuer"
                element={
                  <PrivateRoute>
                    <IssuerDashboard />
                  </PrivateRoute>
                }
              />
              
              {/* Redirect /dashboard to role selection if no role specified */}
              <Route path="/dashboard" element={<Navigate to="/login-as" replace />} />
              
              {/* Credential routes */}
              <Route path="/citizen/credentials" element={<Credentials />} />
              <Route path="/citizen/credentials/create" element={<CreateCredential />} />
              
              <Route
              path="/userdashboard"
              element={
                <PrivateRoute>
                  {withLayout(UserDashboard)()}
                </PrivateRoute>
              }
            />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

          </Router>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

