import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import About from './pages/About';
import FAQ from './pages/FAQ';
import CreateIdentity from './pages/CreateIdentity';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/create-identity" element={
            <ProtectedRoute>
              <CreateIdentity />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Example admin route: */}
          {/* <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } /> */}
          {/* Add other routes like /dashboard etc. when needed */}
        </Routes>
      </Router>
    </AuthProvider>
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
