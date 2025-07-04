import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import logo from '../assets/CamDID.png';
import user from '../assets/f1.jpg';

// Tech Modern Palette
// Deep Blue: #174075 (bg/nav)
// Vivid Green: #198C43 (success, highlight)
// Bright Red: #D32F2F (error, alert)
// Soft Gray: #E6ECF3 (surface)
// Gold Accent: #FFCA29 (accent)

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const { account, connectWallet, isConnecting } = useWeb3();

  useEffect(() => {
    const fetchNotifications = async () => {
      setNotificationCount(3);
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  return (
    <header className="bg-[#174075] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img className="block h-8 w-auto" src={logo} alt="SSI DID Logo" />
              </Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'border-[#FFCA29] text-white'
                    : 'border-transparent text-[#E6ECF3] hover:border-[#198C43] hover:text-[#198C43]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/register-id"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname.includes('/register-id')
                    ? 'border-[#FFCA29] text-white'
                    : 'border-transparent text-[#E6ECF3] hover:border-[#198C43] hover:text-[#198C43]'
                }`}
              >
                Register ID
              </Link>
              <Link
                to="/share-identity"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname.includes('/share-identity')
                    ? 'border-[#FFCA29] text-white'
                    : 'border-transparent text-[#E6ECF3] hover:border-[#198C43] hover:text-[#198C43]'
                }`}
              >
                Share Identity
              </Link>
              <Link
                to="/credentials"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname.includes('/credentials')
                    ? 'border-[#FFCA29] text-white'
                    : 'border-transparent text-[#E6ECF3] hover:border-[#198C43] hover:text-[#198C43]'
                }`}
              >
                Credentials
              </Link>
              <Link
                to="/settings"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname.includes('/settings')
                    ? 'border-[#FFCA29] text-white'
                    : 'border-transparent text-[#E6ECF3] hover:border-[#198C43] hover:text-[#198C43]'
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* Right side icons and buttons */}
          <div className="hidden md:flex items-center">
            {/* Wallet connection status */}
            <div className="mr-4">
              {account ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#198C43]/20 text-[#198C43] border border-[#198C43]">
                  <span className="h-2 w-2 mr-1 bg-[#198C43] rounded-full"></span>
                  Wallet Connected
                </span>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-[#198C43] hover:bg-[#174075] transition ${
                    isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
            {/* Notifications */}
            <div className="ml-4 relative">
              <button
                onClick={toggleNotifications}
                className="bg-[#174075] p-1 rounded-full text-[#FFCA29] hover:text-[#FFCA29] focus:outline-none border-2 border-[#FFCA29]/20"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-[#D32F2F] text-xs text-white text-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              {/* Notification dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-[#E6ECF3] ring-1 ring-[#174075]/30">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 border-b border-[#198C43]/30">
                      <p className="text-sm font-medium text-[#174075]">Notifications</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 border-b border-[#198C43]/20 hover:bg-[#FFCA29]/10">
                        <p className="text-sm text-[#174075]">Your ID verification is now complete.</p>
                        <p className="text-xs text-[#174075] mt-1 opacity-70">2 hours ago</p>
                      </div>
                      <div className="px-4 py-3 border-b border-[#198C43]/20 hover:bg-[#FFCA29]/10">
                        <p className="text-sm text-[#174075]">New credential received from University of Example.</p>
                        <p className="text-xs text-[#174075] mt-1 opacity-70">Yesterday</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-[#FFCA29]/10">
                        <p className="text-sm text-[#174075]">Your credential was shared with Example Corp.</p>
                        <p className="text-xs text-[#174075] mt-1 opacity-70">2 days ago</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-[#198C43]/30">
                      <Link to="/notifications" className="text-xs text-[#174075] hover:text-[#198C43]">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Profile dropdown */}
            <div className="ml-4 relative">
              <div>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center text-sm font-medium text-[#E6ECF3] hover:text-[#FFCA29]"
                >
                  {/* <span className="mr-2">{.name || 'User'}</span> */}
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user?.profileImage || 'https://via.placeholder.com/40'}
                    alt=""
                  />
                </button>
              </div>
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[#E6ECF3] ring-1 ring-[#174075]/30">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-[#174075] hover:bg-[#FFCA29]/20"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-[#174075] hover:bg-[#FFCA29]/20"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-[#D32F2F] hover:bg-[#D32F2F]/10"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {/* Wallet connection status (mobile) */}
            <div className="mr-2">
              {account ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#198C43]/20 text-[#198C43] border border-[#198C43]">
                  <span className="h-1.5 w-1.5 mr-1 bg-[#198C43] rounded-full"></span>
                  Connected
                </span>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#198C43] hover:bg-[#174075] transition ${
                    isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
            {/* Mobile menu toggle */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#E6ECF3] hover:text-[#FFCA29] hover:bg-[#FFCA29]/10 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#174075]">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-[#FFCA29]/20 border-[#FFCA29] text-white'
                  : 'border-transparent text-[#E6ECF3] hover:bg-[#198C43]/10 hover:border-[#198C43] hover:text-[#198C43]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/register-id"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                location.pathname.includes('/register-id')
                  ? 'bg-[#FFCA29]/20 border-[#FFCA29] text-white'
                  : 'border-transparent text-[#E6ECF3] hover:bg-[#198C43]/10 hover:border-[#198C43] hover:text-[#198C43]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Register ID
            </Link>
            <Link
              to="/share-identity"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                location.pathname.includes('/share-identity')
                  ? 'bg-[#FFCA29]/20 border-[#FFCA29] text-white'
                  : 'border-transparent text-[#E6ECF3] hover:bg-[#198C43]/10 hover:border-[#198C43] hover:text-[#198C43]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Share Identity
            </Link>
            <Link
              to="/credentials"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                location.pathname.includes('/credentials')
                  ? 'bg-[#FFCA29]/20 border-[#FFCA29] text-white'
                  : 'border-transparent text-[#E6ECF3] hover:bg-[#198C43]/10 hover:border-[#198C43] hover:text-[#198C43]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Credentials
            </Link>
            <Link
              to="/settings"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                location.pathname.includes('/settings')
                  ? 'bg-[#FFCA29]/20 border-[#FFCA29] text-white'
                  : 'border-transparent text-[#E6ECF3] hover:bg-[#198C43]/10 hover:border-[#198C43] hover:text-[#198C43]'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </Link>
          </div>
          {/* Mobile profile section */}
          <div className="pt-4 pb-3 border-t border-[#E6ECF3]/30">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={user?.profileImage || 'https://via.placeholder.com/40'}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user?.name || 'User'}</div>
                <div className="text-sm font-medium text-[#E6ECF3]">{user?.email || 'user@example.com'}</div>
              </div>
              <button
                onClick={toggleNotifications}
                className="ml-auto bg-[#174075] flex-shrink-0 p-1 rounded-full text-[#FFCA29] hover:text-[#198C43] focus:outline-none"
              >
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-[#D32F2F] text-xs text-white text-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-[#E6ECF3] hover:text-white hover:bg-[#198C43]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-base font-medium text-[#E6ECF3] hover:text-white hover:bg-[#198C43]/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-base font-medium text-[#D32F2F] hover:text-white hover:bg-[#D32F2F]/70"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;