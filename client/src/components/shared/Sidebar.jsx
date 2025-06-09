import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  CreditCard,
  Share2,
  QrCode,
  Settings,
  Bell,
  FileText,
  Lock,
  Database,
  Users,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Eye,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

// Component implementation

const DashboardSidebar = ({ onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);
  const [activeSection, setActiveSection] = useState('overview');
  
  // Mock context data - replace with actual context usage
  const user = { name: 'John Doe', email: 'john@example.com', verified: true };
  const web3Status = { connected: true, network: 'Ethereum Mainnet', balance: '0.245 ETH' };
  const identityStatus = { created: true, verified: 2, pending: 1 };

  const mainMenuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      badge: null,
      description: 'Dashboard overview',
      path: '/citizen/dashboard'
    },
    {
      id: 'identity',
      label: 'Create Identity',
      icon: User,
      badge: null,
      description: 'Create your digital identity',
      path: '/create-identity'
    },
    {
      id: 'manage-identity',
      label: 'Manage Identity',
      icon: Shield,
      badge: null,
      description: 'Manage your digital identity',
      path: '/citizen/my-identity'
    },
    {
      id: 'credentials',
      label: 'Credentials',
      icon: CreditCard,
      badge: identityStatus.pending > 0 ? identityStatus.pending : null,
      description: 'Verifiable credentials',
      path: '/citizen/credentials'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      badge: null,
      description: 'Identity documents',
      path: '/citizen/documents'
    },
    {
      id: 'share',
      label: 'Share Identity',
      icon: Share2,
      badge: null,
      description: 'Share with third parties',
      path: '/citizen/share'
    },
    {
      id: 'qr-scanner',
      label: 'QR Scanner',
      icon: QrCode,
      badge: null,
      description: 'Scan identity QR codes',
      path: '/citizen/qr-scanner'
    }
  ];

  const securityMenuItems = [
    {
      id: 'privacy',
      label: 'Privacy Control',
      icon: Eye,
      badge: null,
      description: 'Selective disclosure settings',
      path: '/citizen/privacy'
    },
    {
      id: 'access-control',
      label: 'Access Control',
      icon: Lock,
      badge: null,
      description: 'Manage permissions',
      path: '/citizen/access-control'
    },
    {
      id: 'verification-history',
      label: 'Verification History',
      icon: Shield,
      badge: null,
      description: 'View verification logs',
      path: '/citizen/verification-history'
    }
  ];

  const blockchainMenuItems = [
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      badge: null,
      description: 'Blockchain wallet',
      path: '/citizen/wallet'
    },
    {
      id: 'storage',
      label: 'Decentralized Storage',
      icon: Database,
      badge: null,
      description: 'IPFS document storage',
      path: '/citizen/storage'
    },
    {
      id: 'third-party',
      label: 'Third-party Access',
      icon: Users,
      badge: null,
      description: 'External integrations',
      path: '/citizen/third-party'
    }
  ];

  const settingsMenuItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: 3,
      description: 'Notification preferences',
      path: '/citizen/notifications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      description: 'Application settings',
      path: '/citizen/settings'
    }
  ];

  const MenuItem = ({ item }) => {
    const navigate = useNavigate();

    const handleClick = (e) => {
      e.preventDefault();
      setActiveSection(item.id);
      navigate(item.path);
    };

    const isActive = activeSection === item.id;

    return (
      <div
        onClick={handleClick}
        className={`
          group relative flex items-center px-3 py-3 mb-1 rounded-xl cursor-pointer transition-all duration-200
          ${isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}
      >
        <div className="flex items-center min-w-0">
          <item.icon
            size={20}
            className={`flex-shrink-0 transition-colors duration-200`}
            style={{ color: isActive ? 'white' : undefined }}
          />
          {!isCollapsed && (
            <span className="ml-3 font-medium text-sm truncate">
              {item.label}
            </span>
          )}
        </div>

        {!isCollapsed && item.badge && (
          <div className={`flex-shrink-0 ml-2 px-2 py-1 text-xs font-bold rounded-full
            ${isActive
              ? 'bg-white bg-opacity-20 text-white'
              : 'bg-blue-100 text-blue-800'
            }
          `}>
            {item.badge}
          </div>
        )}

        {isCollapsed && item.badge && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {item.badge}
          </div>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-300">{item.description}</div>
            <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ title, icon: Icon }) => (
    <div className={`
      flex items-center px-3 py-2 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider
      ${isCollapsed ? 'justify-center' : ''}
    `}>
      {!isCollapsed && (
        <>
          <Icon size={14} className="mr-2" />
          {title}
        </>
      )}
      {isCollapsed && <Icon size={16} />}
    </div>
  );

  const StatusCard = () => (
    <div className={`
      mx-3 mb-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl
      ${isCollapsed ? 'hidden' : 'block'}
    `}>
      <div className="flex items-center mb-2">
        <CheckCircle size={16} className="text-green-600 mr-2" />
        <span className="text-sm font-semibold text-gray-900">Identity Verified</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">
        Your digital identity is secure and verified on the blockchain.
      </p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Network:</span>
          <span className="font-medium text-gray-900">Ethereum</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Balance:</span>
          <span className="font-medium text-gray-900">{web3Status.balance}</span>
        </div>
      </div>
    </div>
  );

  const UserProfile = () => (
    <div className={`
      mx-3 mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm
      ${isCollapsed ? 'hidden' : 'block'}
    `}>
      <div className="flex items-center">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle size={12} className="text-white" />
            </div>
          )}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 hidden lg:block"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 pb-0">
        <UserProfile />
        <StatusCard />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Main Features */}
        <SectionHeader title="Main" icon={Activity} />
        <div className="mb-6">
          {mainMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {/* Security */}
        <SectionHeader title="Security" icon={Shield} />
        <div className="mb-6">
          {securityMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {/* Blockchain */}
        <SectionHeader title="Blockchain" icon={Database} />
        <div className="mb-6">
          {blockchainMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
            />
          ))}
        </div>

        {/* Settings */}
        <SectionHeader title="Settings" icon={Settings} />
        <div className="mb-6">
          {settingsMenuItems.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <MenuItem
          item={{
            id: 'logout',
            label: 'Sign Out',
            icon: LogOut,
            description: 'Sign out of your account',
            path: '/logout'
          }}
        />
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
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-xl z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-80'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {sidebarContent}
      </div>

      {/* Main content spacer */}
      {/* Removed spacer div to reduce space between sidebar and dashboard content */}
    </>
  );
};

export default DashboardSidebar;
