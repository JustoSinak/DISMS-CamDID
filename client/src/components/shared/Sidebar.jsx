import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  User, Shield, CreditCard, Share2, QrCode, Settings, Bell, FileText,
  Lock, Database, Users, Activity, LogOut, ChevronLeft, ChevronRight,
  Wallet, Eye, CheckCircle, Menu, X
} from 'lucide-react';

const DashboardSidebar = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com', verified: true });
  const imageInputRef = useRef(null);
  const location = useLocation();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

  const handleProfileSave = () => {
    // Here you would typically send the updated profile data to your backend
    setIsEditingProfile(false);
  };

  const web3Status = { connected: true, network: 'Ethereum Mainnet', balance: '0.245 ETH' };
  const identityStatus = { created: true, verified: 2, pending: 1 };

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainMenuItems = [
    { id: 'overview', label: 'Overview', icon: Activity, path: '/citizen/dashboard' },
    { id: 'create-identity', label: 'Create Identity', icon: User, path: '/create-identity' },
    { id: 'my-identity', label: 'My Identity', icon: Shield, path: '/my-identity' },
    {
      id: 'credentials',
      label: 'Credentials',
      icon: CreditCard,
      badge: identityStatus.pending > 0 ? identityStatus.pending : null,
      path: '/citizen/credentials',
      subItems: [
        { label: 'All Credentials', path: '/citizen/credentials' },
        { label: 'Add New', path: '/citizen/credentials/create' }
      ]
    },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/citizen/documents' },
    { id: 'share', label: 'Share Identity', icon: Share2, path: '/citizen/share' },
    { id: 'qr-scanner', label: 'QR Scanner', icon: QrCode, path: '/citizen/qr-scanner' }
  ];

  const securityMenuItems = [
    { id: 'privacy', label: 'Privacy Control', icon: Eye, path: '/citizen/privacy' },
    { id: 'access-control', label: 'Access Control', icon: Lock, path: '/citizen/access-control' },
    { id: 'verification-history', label: 'Verification History', icon: Shield, path: '/citizen/verification-history' }
  ];

  const blockchainMenuItems = [
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/citizen/wallet' },
    { id: 'storage', label: 'Decentralized Storage', icon: Database, path: '/citizen/storage' },
    { id: 'third-party', label: 'Third-party Access', icon: Users, path: '/citizen/third-party' }
  ];

  const settingsMenuItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3, path: '/citizen/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/citizen/settings' }
  ];

  const MenuItem = ({ item }) => {
    const isActive = location.pathname === item.path || 
      (item.subItems && item.subItems.some(subItem => location.pathname === subItem.path));
    const [showSubItems, setShowSubItems] = useState(false);

    return (
      <div>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `group relative flex items-center px-3 py-3 mb-1 rounded-xl transition-all duration-200 cursor-pointer
            ${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
            ${isCollapsed ? 'justify-center' : 'justify-between'}`
          }
          onClick={() => item.subItems && setShowSubItems(!showSubItems)}
        >
          <div className="flex items-center min-w-0">
            <item.icon size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium text-sm truncate">{item.label}</span>}
          </div>

          {!isCollapsed && item.badge && (
            <div className="ml-2 px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              {item.badge}
            </div>
          )}

          {isCollapsed && item.badge && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {item.badge}
            </div>
          )}

          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              <div className="font-medium">{item.label}</div>
              {item.subItems && (
                <div className="mt-1 space-y-1">
                  {item.subItems.map(subItem => (
                    <div key={subItem.path} className="text-xs text-gray-300">
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
              <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          )}
        </NavLink>

        {!isCollapsed && item.subItems && showSubItems && (
          <div className="ml-8 space-y-1">
            {item.subItems.map(subItem => (
              <NavLink
                key={subItem.path}
                to={subItem.path}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm rounded-lg transition-colors
                  ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                }
              >
                {subItem.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className={`flex items-center px-3 py-2 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? 'justify-center' : ''}`}>
      {<Icon size={14} className={!isCollapsed ? 'mr-2' : ''} />}
      {!isCollapsed && title}
    </div>
  );

  const StatusCard = () => (
    <div className={`mx-3 mb-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl ${isCollapsed ? 'hidden' : 'block'}`}>
      <div className="flex items-center mb-2">
        <CheckCircle size={16} className="text-green-600 mr-2" />
        <span className="text-sm font-semibold text-gray-900">Identity Verified</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Your digital identity is secure and verified on the blockchain.
      </p>
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Network:</span>
          <span className="font-medium text-gray-900">{web3Status.network}</span>
        </div>
        <div className="flex justify-between">
          <span>Balance:</span>
          <span className="font-medium text-gray-900">{web3Status.balance}</span>
        </div>
      </div>
    </div>
  );

  const UserProfile = () => (
    <div className={`mx-3 mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${isCollapsed ? 'hidden' : 'block'}`}>
      <div className="flex items-center">
        <div className="relative cursor-pointer" onClick={() => imageInputRef.current.click()}>
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          )}
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={12} className="text-white" />
            </div>
          )}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          {isEditingProfile ? (
            <div className="flex flex-col space-y-1">
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Full Name"
              />
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
                placeholder="Email"
              />
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
        </div>
        {!isEditingProfile && (
          <button
            onClick={handleProfileEdit}
            className="ml-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />
      {isEditingProfile && (
        <div className="mt-2 flex space-x-2">
          <button
            onClick={handleProfileSave}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditingProfile(false)}
            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Shield size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SecureID
            </h1>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
          role="button"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 hidden lg:block"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close mobile sidebar"
          role="button"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 pb-0">
        <UserProfile />
        {!isCollapsed && <StatusCard />}
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <SectionHeader title="Main" icon={Activity} />
        <div className="mb-6">{mainMenuItems.map((item) => <MenuItem key={item.id} item={item} />)}</div>

        <SectionHeader title="Security" icon={Shield} />
        <div className="mb-6">{securityMenuItems.map((item) => <MenuItem key={item.id} item={item} />)}</div>

        <SectionHeader title="Blockchain" icon={Database} />
        <div className="mb-6">{blockchainMenuItems.map((item) => <MenuItem key={item.id} item={item} />)}</div>

        <SectionHeader title="Settings" icon={Settings} />
        <div className="mb-6">{settingsMenuItems.map((item) => <MenuItem key={item.id} item={item} />)}</div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <MenuItem item={{ id: 'logout', label: 'Sign Out', icon: LogOut, path: '/logout' }} />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg lg:hidden"
        aria-label="Open sidebar"
        role="button"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar - uses relative positioning to be part of document flow */}
      <div
        className={`hidden lg:block bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex-shrink-0
        ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {sidebarContent}
      </div>

      {/* Mobile Sidebar - uses fixed positioning for overlay */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-xl z-50 transition-all duration-300 ease-in-out lg:hidden
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default DashboardSidebar;