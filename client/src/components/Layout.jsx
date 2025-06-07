import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-white text-gray-900'
    }`}>
      <Navbar />
      <div className={`w-full ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        {children}
      </div>

      <style jsx global>{`
        /* Global styles for dark mode */
        .dark {
          color-scheme: dark;
        }
        
        /* Default dark mode text colors */
        .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
          color: #f3f4f6;
        }
        
        .dark p {
          color: #9ca3af;
        }
        
        /* Dark mode form elements */
        .dark input, .dark textarea, .dark select {
          background-color: #374151;
          border-color: #4b5563;
          color: #f3f4f6;
        }
        
        .dark input:focus, .dark textarea:focus, .dark select:focus {
          border-color: #10b981;
          ring-color: #059669;
        }
        
        /* Dark mode buttons */
        .dark button {
          background-color: #374151;
          color: #f3f4f6;
        }
        
        .dark button:hover {
          background-color: #4b5563;
        }
        
        /* Dark mode links */
        .dark a {
          color: #10b981;
        }
        
        .dark a:hover {
          color: #059669;
        }
      `}</style>
    </div>
  );
};

export default Layout; 