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
import { Web3Provider } from './contexts/Web3Context';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';

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

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './components/Home';
// import Login from './components/auth/Login';
// import Register from './components/auth/Register';
// 

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         {/* Add more routes as needed */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Home from './pages/Home';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <div className="container mx-auto px-4 py-6">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<div><h2>Login Page</h2><p>Login page is under construction.</p></div>} />
//           <Route path="/register" element={<div><h2>Register Page</h2><p>Register page is under construction.</p></div>} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </div>
//     </div>
//   );
// }

// export default App;
