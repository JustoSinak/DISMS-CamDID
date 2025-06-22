import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaHome,
  FaIdCard,
  FaShareAlt,
  FaWallet,
  FaCog,
  FaQuestionCircle,
  FaShieldAlt,
  FaPlus,
  FaEdit,
  FaDatabase
} from 'react-icons/fa';


const Sidebar = () => {
  const { user } = useAuth();

  // Navigation items with icons
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/create-identity', name: 'Register ID', icon: <FaIdCard /> },
    { path: '/my-identity', name: 'Manage Identity', icon: <FaIdCard /> },
    { path: '/share-identity', name: 'Share Identity', icon: <FaShareAlt /> },
    { path: '/create-credential', name: 'Create Credential', icon: <FaPlus /> },
    { path: '/manage-credentials', name: 'Manage Credential', icon: <FaEdit /> },
    { path: '/credential-wallet', name: 'Credentials', icon: <FaWallet /> },
    { path: '/admin/schema-registry', name: 'Schema Registry', icon: <FaDatabase /> },
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 flex items-center border-b border-gray-700">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`} className="w-full h-full rounded-full object-cover" />
          ) : (
            user?.profile?.lastName ? user.profile.lastName.charAt(0).toUpperCase() : 'U'
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-semibold">
            {user?.profile?.lastName || user?.name || 'User'}
          </h3>
          <div className="text-xs text-gray-400">
            <span>{user?.did ? `${user.did.substring(0, 10)}...` : 'Not registered'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className={`px-2 py-1 text-xs font-semibold rounded-full ${user?.verified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {user?.verified ? 'Verified' : 'Unverified'}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <div className="flex items-center text-gray-300 text-sm hover:text-white cursor-pointer">
          <FaQuestionCircle className="mr-3" />
          <span>Help Center</span>
        </div>
        <div className="flex items-center text-gray-300 text-sm hover:text-white cursor-pointer">
          <FaShieldAlt className="mr-3" />
          <span>Privacy Controls</span>
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-400 space-y-1">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span>Ethereum Mainnet</span>
        </div>
        <div>
          Gas: 45 Gwei
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
