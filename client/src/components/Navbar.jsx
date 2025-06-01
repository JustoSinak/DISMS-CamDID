import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import { Web3Context } from '../contexts/Web3Context';
import Logo from '../assets/CamDID.svg';
import { User, Settings, LogOut, Upload } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
//   const { connectWallet, account, isConnected } = useContext(Web3Context);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Format Ethereum address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="SecureID" className="h-10 w-10" />
            <p className="text-xl font-bold"><span className="text-emerald-800">Cam</span><span className="text-red-600">DID</span></p>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/#features"
              className={`text-sm font-medium ${
                location.pathname === '/features'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
            >
              Features
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium ${
                location.pathname === '/about' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              About
            </Link>
            <Link 
              to="/faq" 
              className={`text-sm font-medium ${
                location.pathname === '/faq' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              FAQ
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm font-medium ${
                location.pathname === '/contact' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Contact
            </Link>
            
            {/* Show these links only when authenticated */}
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/credentials" 
                  className={`text-sm font-medium ${
                    location.pathname === '/credentials' 
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  Credentials
                </Link>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Wallet Connection Button */}
                <button
                  // onClick={connectWallet}
                  className="flex items-center text-xs font-medium px-3 py-2 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Connect Wallet
                </button>
                <button
                  className="flex items-center text-xs font-medium px-3 py-2 rounded-md bg-green-100 text-green-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatAddress}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user?.profileImage || 'https://via.placeholder.com/32'} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                      </div>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Your Profile
                      </Link>

                      <Link 
                        to="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>

                      <label 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Update Picture</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            // Handle profile picture update
                            const file = e.target.files?.[0];
                            if (file) {
                              // Add your profile picture update logic here
                            }
                          }}
                        />
                      </label>

                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors duration-300"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg mt-2 px-4 py-3 absolute w-full">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`text-sm font-medium py-2 ${
                location.pathname === '/' 
                  ? 'text-indigo-600' 
                  : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/#features"
              className={`text-sm font-medium py-2 ${
                location.pathname === '/features'
                  ? 'text-indigo-600'
                  : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium py-2 ${
                location.pathname === '/about' 
                  ? 'text-indigo-600' 
                  : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/faq" 
              className={`text-sm font-medium py-2 ${
                location.pathname === '/faq' 
                  ? 'text-indigo-600' 
                  : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            
            {/* Show these links only when authenticated */}
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium py-2 ${
                    location.pathname === '/dashboard' 
                      ? 'text-indigo-600' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/credentials" 
                  className={`text-sm font-medium py-2 ${
                    location.pathname === '/credentials' 
                      ? 'text-indigo-600' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Credentials
                </Link>
              </>
            )}

            {/* Mobile Authentication Section */}
            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center py-2">
                    <img 
                      src={user?.profileImage || 'https://via.placeholder.com/32'} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block text-sm font-medium py-2 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block text-sm font-medium py-2 text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left text-sm font-medium py-2 text-red-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/login" 
                    className="block text-center text-sm font-medium py-2 text-emerald-600 hover:text-emerald-700 border border-emerald-600 rounded-lg hover:bg-emerald-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register" 
                    className="block text-center text-sm font-medium py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;



