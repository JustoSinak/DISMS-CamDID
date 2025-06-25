// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   FaHome,
//   FaIdCard,
//   FaShareAlt,
//   FaWallet,
//   FaCog,
//   FaQuestionCircle,
//   FaShieldAlt,
//   FaPlus,
//   FaEdit,
//   FaDatabase,
//   FaBars,
//   FaTimes
// } from 'react-icons/fa';

// const Sidebar = ({ isCollapsed, onCollapseChange, isMobileMenuOpen, onMobileMenuClose }) => {
//   const { user } = useAuth();

//   // Navigation items with icons
//   const navItems = [
//     { path: '/dashboard/citizen', name: 'Dashboard', icon: <FaHome /> },
    
//     { path: '/create-credential', name: 'Create Credential', icon: <FaPlus /> },
//     { path: '/manage-credentials', name: 'Manage Credential', icon: <FaEdit /> },
//     { path: '/credential-wallet', name: 'Credentials', icon: <FaWallet /> },
//     { path: '/share-identity', name: 'Share Credential', icon: <FaShareAlt /> },
//     { path: '/admin/schema-registry', name: 'Schema Registry', icon: <FaDatabase /> },
//     { path: '/settings', name: 'Settings', icon: <FaCog /> },
//   ];

//   const toggleSidebar = () => {
//     onCollapseChange(!isCollapsed);
//   };

//   const handleNavClick = () => {
//     // Close mobile menu when navigation item is clicked
//     if (onMobileMenuClose) {
//       onMobileMenuClose();
//     }
//   };
//   const { logout } = useAuth();
//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isMobileMenuOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={onMobileMenuClose}
//         />
//       )}

//       {/* Sidebar */}
//       <aside 
//         className={`
//           fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out z-50
//           ${isCollapsed ? 'w-20' : 'w-64'}
//           ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
//           md:translate-x-0
//         `}
//       >
//         {/* Header */}
//         <div className="p-4 flex items-center border-b border-gray-700 justify-between">
//           <div className="flex items-center min-w-0">
//             {/* Profile Image/Avatar */}
//             <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
//               {user?.profileImage ? (
//                 <img 
//                   src={user.profileImage} 
//                   alt={`${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`} 
//                   className="w-full h-full rounded-full object-cover" 
//                 />
//               ) : (
//                 user?.profile?.lastName ? user.profile.lastName.charAt(0).toUpperCase() : 'U'
//               )}
//             </div>
            
//             {/* User Info - Only show when not collapsed */}
//             {!isCollapsed && (
//               <div className="ml-3 min-w-0 flex-1">
//                 <h3 className="text-sm font-semibold truncate">
//                   {user?.profile?.firstName && user?.profile?.lastName
//                     ? `${user.profile.firstName} ${user.profile.lastName}`
//                     : user?.name || 'User'}
//                 </h3>
//                 <div className="text-xs text-gray-400 truncate">
//                   <span>{user?.did ? `${user.did.substring(0, 10)}...` : 'Not registered'}</span>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Toggle Button */}
//           <button
//             onClick={toggleSidebar}
//             className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1 hidden md:block"
//             aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//           >
//             <FaBars size={16} />
//           </button>

//           {/* Mobile Close Button */}
//           <button
//             onClick={onMobileMenuClose}
//             className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1 md:hidden"
//             aria-label="Close menu"
//           >
//             <FaTimes size={16} />
//           </button>
//         </div>

//         {/* Verification Status */}
//         <div className="p-4 border-b border-gray-700">
//           <div className="flex items-center justify-center">
//             <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
//               user?.verified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
//             }`}>
//               {user?.verified ? 'Verified' : 'Unverified'}
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
//           <ul className="space-y-1">
//             {navItems.map((item) => (
//               <li key={item.path}>
//                 <NavLink
//                   to={item.path}
//                   onClick={handleNavClick}
//                   className={({ isActive }) =>
//                     `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
//                       isActive 
//                         ? 'bg-gray-700 text-white' 
//                         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//                     }`
//                   }
//                   title={isCollapsed ? item.name : ''}
//                 >
//                   <span className="flex-shrink-0">{item.icon}</span>
//                   {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* Footer Links */}
//         <div className="p-4 border-t border-gray-700 space-y-2">
//           <div 
//             className="flex items-center text-gray-300 text-sm hover:text-white cursor-pointer transition-colors duration-200"
//             title={isCollapsed ? 'Help Center' : ''}
//           >
//             <FaQuestionCircle className="flex-shrink-0" />
//             {!isCollapsed && <span className="ml-3">Help Center</span>}
//           </div>
//           <div 
//             className="flex items-center text-gray-300 text-sm hover:text-white cursor-pointer transition-colors duration-200"
//             title={isCollapsed ? 'Privacy Controls' : ''}
//           >
//             <FaShieldAlt className="flex-shrink-0" />
//             {!isCollapsed && <span className="ml-3">Privacy Controls</span>}
//           </div>
//         </div>

//         {/* Network Status */}
//         <div className="p-4 border-t border-gray-700 text-xs text-gray-400 space-y-1">
//           <div className="flex items-center">
//             <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
//             {!isCollapsed && <span className="ml-2">Ethereum Mainnet</span>}
//           </div>
//           {!isCollapsed && (
//             <div className="text-xs">
//               Gas: 45 Gwei
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//             >
//               <FaSignOutAlt className="w-5 h-5 mr-3" />
//               Logout
//             </button>   
//           )}
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;




// ✅ Sidebar.jsx (Refined)
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
  FaDatabase,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ isCollapsed, onCollapseChange, isMobileMenuOpen, onMobileMenuClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard/citizen', name: 'Dashboard', icon: <FaHome /> },
    { path: '/create-credential', name: 'Create Credential', icon: <FaPlus /> },
    { path: '/manage-credentials', name: 'Manage Credential', icon: <FaEdit /> },
    { path: '/credential-wallet', name: 'Credentials', icon: <FaWallet /> },
    { path: '/share-identity', name: 'Share Credential', icon: <FaShareAlt /> },
    { path: '/admin/schema-registry', name: 'Schema Registry', icon: <FaDatabase /> },
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
  ];

  const toggleSidebar = () => onCollapseChange(!isCollapsed);

  const handleNavClick = () => {
    if (onMobileMenuClose) onMobileMenuClose();
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onMobileMenuClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        <div className="p-4 flex items-center border-b border-gray-700 justify-between">
          <div className="flex items-center min-w-0">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.profile?.lastName?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            {!isCollapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {user?.profile?.firstName && user?.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user?.name || 'User'}
                </h3>
                <div className="text-xs text-gray-400 truncate">
                  <span>{user?.did ? `${user.did.substring(0, 10)}...` : 'Not registered'}</span>
                </div>
              </div>
            )}
          </div>

          <button onClick={toggleSidebar} className="text-gray-300 hover:text-white hidden md:block p-1">
            <FaBars size={16} />
          </button>
          <button onClick={onMobileMenuClose} className="text-gray-300 hover:text-white md:hidden p-1">
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-center">
            <div className={`px-2 py-1 text-xs font-semibold rounded-full ${user?.verified ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {user?.verified ? 'Verified' : 'Unverified'}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  title={isCollapsed ? item.name : ''}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="flex items-center text-gray-300 text-sm hover:text-white cursor-pointer">
            <FaQuestionCircle className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Help Center</span>}
          </div>
          <div className="flex items-center text-gray-300 text-sm hover:text-white cursor-pointer">
            <FaShieldAlt className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Privacy Controls</span>}
          </div>
          <button
            onClick={logout}
            type="button"
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            <FaSignOutAlt className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;







// import React from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import { FaHome, FaPlus, FaEdit, FaWallet, FaUser, FaShare, FaCog, FaSignOutAlt } from 'react-icons/fa';
// import { useAuth } from '../../contexts/AuthContext';

// const Sidebar = ({ isOpen, onClose }) => {
//   const location = useLocation();
//   const { logout } = useAuth();

//   const navItems = [
//     { path: '/dashboard/citizen', name: 'Dashboard', icon: <FaHome /> },
//     { 
//       path: '/create-credential', 
//       name: 'Create Credential', 
//       icon: <FaPlus /> 
//     },
//     { 
//       path: '/manage-credentials', 
//       name: 'Manage Credentials', 
//       icon: <FaEdit /> 
//     },
//     { 
//       path: '/credential-wallet', 
//       name: 'Credential Wallet', 
//       icon: <FaWallet /> 
//     },
//     { 
//       path: '/my-identity', 
//       name: 'My Identity', 
//       icon: <FaUser /> 
//     },
//     { 
//       path: '/share-identity', 
//       name: 'Share Identity', 
//       icon: <FaShare /> 
//     },
//     { 
//       path: '/settings', 
//       name: 'Settings', 
//       icon: <FaCog /> 
//     }
//   ];

//   const handleLogout = () => {
//     logout();
//     onClose();
//   };

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={onClose}
//         />
//       )}
      
//       {/* Sidebar */}
//       <div className={`
//         fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
//         ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//         lg:translate-x-0 lg:static lg:z-auto
//       `}>
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-xl font-bold text-gray-800">Digital Identity</h2>
//         </div>
        
//         <nav className="mt-6">
//           <ul className="space-y-2 px-4">
//             {navItems.map((item) => (
//               <li key={item.path}>
//                 <NavLink
//                   to={item.path}
//                   className={({ isActive }) => `
//                     flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
//                     ${isActive 
//                       ? 'bg-emerald-100 text-emerald-700 border-r-4 border-emerald-500' 
//                       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//                     }
//                   `}
//                   onClick={onClose}
//                 >
//                   <span className="w-5 h-5 mr-3">{item.icon}</span>
//                   {item.name}
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
          
//           {/* Logout button at bottom */}
//           <div className="absolute bottom-6 left-4 right-4">
//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//             >
//               <FaSignOutAlt className="w-5 h-5 mr-3" />
//               Logout
//             </button>
//           </div>
//         </nav>
//       </div>
//     </>
//   );
// };

// export default Sidebar;