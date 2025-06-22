import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// import { Web3Context } from '../contexts/Web3Context';
import Logo from '../assets/CamDID.svg';
import { User, Settings, LogOut, Upload, Sun, Moon } from 'lucide-react';

const Navbar = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const navLinkClasses = (path) => `
    transition-colors duration-200 border-b-2 ${
      location.pathname === path
        ? theme === 'dark'
          ? 'border-indigo-400 text-indigo-400'
          : 'border-indigo-600 text-indigo-600'
        : theme === 'dark'
          ? 'border-transparent text-gray-300 hover:text-indigo-400 hover:border-indigo-400'
          : 'border-transparent text-gray-600 hover:text-indigo-600 hover:border-indigo-600'
    }
  `;

  // If children are provided, render a simple dashboard navbar
  if (children) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={Logo} alt="CamDID Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">
                <span className="text-emerald-500">Cam</span>
                <span className="text-red-600">DID</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </nav>
    );
  }

  // Original navbar for main pages
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled
        ? theme === 'dark'
          ? 'bg-gray-900/95 shadow-lg shadow-gray-900/50'
          : 'bg-white/95 shadow-lg'
        : theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-16">
            {/* Logo and Brand */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img src={Logo} alt="CamDID Logo" className="w-8 h-8" />
                <span
                  className={`text-xl font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  <span className="text-emerald-500">Cam</span>
                  <span className="text-red-600">DID</span>
                </span>
              </Link>
            </div>

            {/* Centered Navigation Links */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-8 justify-center">
              <Link to="/" className={navLinkClasses("/")}>
                Home
              </Link>
              <Link to="/about" className={navLinkClasses("/about")}>
                About
              </Link>
              <Link to="/contact" className={navLinkClasses("/contact")}>
                Contact
              </Link>
              <Link to="/faq" className={navLinkClasses("/faq")}>
                FAQ
              </Link>
            </div>

            {/* Right Side Buttons */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Auth Buttons */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login-as"
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register-as"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      theme === "dark"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.firstName}</span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${
                        theme === "dark"
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <Link
                        to="/dashboard/citizen"
                        className={`block px-4 py-2 text-sm ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Dashboard</span>
                        </div>
                      </Link>
                      <Link
                        to="/settings"
                        className={`block px-4 py-2 text-sm ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden ${
          theme === 'dark'
            ? 'bg-gray-900 border-t border-gray-800'
            : 'bg-white border-t border-gray-200'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                location.pathname === '/'
                  ? theme === 'dark'
                    ? 'text-indigo-400 border-l-4 border-indigo-400'
                    : 'text-indigo-600 border-l-4 border-indigo-600'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:text-indigo-400'
                    : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                location.pathname === '/about'
                  ? theme === 'dark'
                    ? 'text-indigo-400 border-l-4 border-indigo-400'
                    : 'text-indigo-600 border-l-4 border-indigo-600'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:text-indigo-400'
                    : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                location.pathname === '/contact'
                  ? theme === 'dark'
                    ? 'text-indigo-400 border-l-4 border-indigo-400'
                    : 'text-indigo-600 border-l-4 border-indigo-600'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:text-indigo-400'
                    : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/faq"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                location.pathname === '/faq'
                  ? theme === 'dark'
                    ? 'text-indigo-400 border-l-4 border-indigo-400'
                    : 'text-indigo-600 border-l-4 border-indigo-600'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:text-indigo-400'
                    : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              FAQ
            </Link>

            {/* Theme Toggle Button - Mobile */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5 mr-2" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 mr-2" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {!isAuthenticated ? (
              <div className="space-y-2 pt-4">
                <Link
                  to="/login"
                  className={`block w-full px-3 py-2 rounded-lg text-center font-medium ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block w-full px-3 py-2 rounded-lg text-center font-medium ${
                    theme === 'dark'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="space-y-2 pt-4">
                <Link
                  to="/citizen/dashboard"
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;



