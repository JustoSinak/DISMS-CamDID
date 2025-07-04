// ✅ App.jsx (Refined for routing clarity)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider } from './contexts/ThemeContext';

import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import RoleSelection from './components/auth/RoleSelection';

import UserDashboard from './components/dashboard/UserDashboard';
import IssuerDashboard from './components/dashboard/IssuerDashboard';
import VerifierDashboard from './components/dashboard/VerifierDashboard';

import ChooseCredentialType from './pages/ChooseCredentialType';
import CreateIdentity from './pages/CreateIdentity';
import CreateCredential from './pages/citizen/CreateCredential';
import ManageCredentials from './pages/ManageCredentials';
import MyIdentity from './pages/MyIdentity';
import ShareIdentity from './pages/ShareIdentity';
import Settings from './pages/Settings';
import WalletPage from './pages/WalletPage';
import Credentials from './pages/citizen/Credentials';

// Issuer Pages
import PendingRequests from './pages/issuer/PendingRequests';
import IssuedCredentials from './pages/issuer/IssuedCredentials';
import RevokeCredentials from './pages/issuer/RevokeCredentials';
import ManageTemplates from './pages/issuer/ManageTemplates';

// Verifier Pages
import VerifyCredential from './pages/verifier/VerifyCredential';
import VerificationHistory from './pages/verifier/VerificationHistory';

const withLayout = (Component) => (props) => (
  <Layout>
    <Component {...props} />
  </Layout>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Web3Provider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={withLayout(Home)()} />
              <Route path="/about" element={withLayout(About)()} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={withLayout(Contact)()} />

              {/* Auth Routes */}
              <Route path="/register-as" element={<RoleSelection />} />
              <Route path="/login-as" element={<RoleSelection />} />
              <Route path="/register/:role" element={<Register />} />
              <Route path="/login/:role" element={<Login />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard/citizen" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
              <Route path="/dashboard/issuer" element={<PrivateRoute><IssuerDashboard /></PrivateRoute>} />
              <Route path="/dashboard/verifier" element={<PrivateRoute><VerifierDashboard /></PrivateRoute>} />

              {/* Issuer Routes */}
              <Route path="/issuer/pending-requests" element={<PrivateRoute><PendingRequests /></PrivateRoute>} />
              <Route path="/issuer/issued-credentials" element={<PrivateRoute><IssuedCredentials /></PrivateRoute>} />
              <Route path="/issuer/revoke-credentials" element={<PrivateRoute><RevokeCredentials /></PrivateRoute>} />
              <Route path="/issuer/manage-templates" element={<PrivateRoute><ManageTemplates /></PrivateRoute>} />

              {/* Verifier Routes */}
              <Route path="/verifier/verify-credential" element={<PrivateRoute><VerifyCredential /></PrivateRoute>} />
              <Route path="/verifier/verification-history" element={<PrivateRoute><VerificationHistory /></PrivateRoute>} />

              {/* Credential Creation Flow */}
              <Route path="/create-credential" element={<PrivateRoute><ChooseCredentialType /></PrivateRoute>} />
              <Route path="/create-identity" element={<PrivateRoute><CreateIdentity /></PrivateRoute>} />
              <Route path="/create-credential/:type" element={<PrivateRoute><CreateCredential /></PrivateRoute>} />

              {/* Credential & Identity Management */}
              <Route path="/manage-credentials" element={<PrivateRoute>{withLayout(ManageCredentials)()}</PrivateRoute>} />
              <Route path="/my-identity" element={<PrivateRoute>{withLayout(MyIdentity)()}</PrivateRoute>} />
              <Route path="/share-identity" element={<PrivateRoute>{withLayout(ShareIdentity)()}</PrivateRoute>} />

              {/* Settings & Wallet */}
              <Route path="/settings" element={<PrivateRoute>{withLayout(Settings)()}</PrivateRoute>} />
              <Route path="/credential-wallet" element={<PrivateRoute>{withLayout(WalletPage)()}</PrivateRoute>} />

              {/* Legacy Routes (if needed) */}
              <Route path="/citizen/credentials" element={<Credentials />} />
              <Route path="/citizen/credentials/create" element={<CreateCredential />} />

              {/* Fallbacks */}
              <Route path="/dashboard" element={<Navigate to="/login-as" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
