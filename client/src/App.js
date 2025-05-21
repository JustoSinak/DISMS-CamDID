import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Add other routes like /dashboard etc. when needed */}
      </Routes>
    </Router>
  );
}

export default App;



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
