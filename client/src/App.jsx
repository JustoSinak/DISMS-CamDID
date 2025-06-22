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
import MyIdentity from './pages/MyIdentity';
import ShareIdentity from './pages/ShareIdentity';
import Settings from './pages/Settings';
import WalletPage from './pages/WalletPage';
import UserDashboard from './components/dashboard/UserDashboard';
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Credentials from './pages/citizen/Credentials';
import CreateCredential from './pages/citizen/CreateCredential';
import ChooseCredentialType from './pages/ChooseCredentialType';
import ManageCredentials from './pages/ManageCredentials';

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
              
              {/* Identity creation route */}
              <Route path="/create-identity" element={
                <PrivateRoute>
                  <CreateIdentity />
                </PrivateRoute>
              } />
              
              {/* Identity management routes */}
              <Route path="/my-identity" element={
                <PrivateRoute>
                  {withLayout(MyIdentity)()}
                </PrivateRoute>
              } />
              
              <Route path="/share-identity" element={
                <PrivateRoute>
                  {withLayout(ShareIdentity)()}
                </PrivateRoute>
              } />
              
              {/* Settings and Wallet routes */}
              <Route path="/settings" element={
                <PrivateRoute>
                  {withLayout(Settings)()}
                </PrivateRoute>
              } />
              
              <Route path="/credential-wallet" element={
                <PrivateRoute>
                  {withLayout(WalletPage)()}
                </PrivateRoute>
              } />
              
              {/* Redirect /dashboard to role selection if no role specified */}
              <Route path="/dashboard" element={<Navigate to="/login-as" replace />} />
              
              {/* Credential routes */}
              <Route path="/citizen/credentials" element={<Credentials />} />
              <Route path="/citizen/credentials/create" element={<CreateCredential />} />
              <Route path="/create-credential" element={
                <PrivateRoute>
                  <ChooseCredentialType />
                </PrivateRoute>
              } />
              <Route path="/create-credential/:type" element={
                <PrivateRoute>
                  <CreateCredential />
                </PrivateRoute>
              } />
              
              <Route
                path="/userdashboard"
                element={
                  <PrivateRoute>
                    {withLayout(UserDashboard)()}
                  </PrivateRoute>
                }
              />

              {/* Manage Credentials route */}
              <Route path="/manage-credentials" element={
                <PrivateRoute>
                  {withLayout(ManageCredentials)()}
                </PrivateRoute>
              } />

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

