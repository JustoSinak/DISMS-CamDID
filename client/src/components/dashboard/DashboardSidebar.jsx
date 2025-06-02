import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../assets/CamDID.svg';
import { 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Wallet, 
  FileText, 
  Share2, 
  Home,
  ChevronDown,
  LayoutDashboard,
  Shield,
  History,
  HelpCircle
} from 'lucide-react';

const DashboardSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { name: 'My Wallet', icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
    { name: 'Credentials', icon: <FileText className="w-5 h-5" />, path: '/credentials' },
    { name: 'Share Identity', icon: <Share2 className="w-5 h-5" />, path: '/share' },
    { name: 'Security', icon: <Shield className="w-5 h-5" />, path: '/security' },
    { name: 'Activity', icon: <History className="w-5 h-5" />, path: '/activity' },
  ];

  const secondaryNavigation = [
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
    { name: 'Help & Support', icon: <HelpCircle className="w-5 h-5" />, path: '/support' },
  ];

  return (
    <div className="flex flex-col h-screen bg-white border-r border-gray-200 w-64 fixed">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="CamDID Logo" className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold">
            <span className="text-emerald-800">Cam</span>
            <span className="text-red-600">DID</span>
          </span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={user?.profileImage || 'https://via.placeholder.com/32'}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
          />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700">{user?.name || 'User'}</h3>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}

        <div className="border-t border-gray-200 my-4"></div>

        {secondaryNavigation.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar; 