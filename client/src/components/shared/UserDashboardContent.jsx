import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  IdentificationIcon,
  DocumentCheckIcon,
  BellIcon,
  PlusIcon,
  UserPlusIcon,
  Bars3Icon,
  QrCodeIcon,
  ShareIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import BiometricAuth from '../auth/BiometricAuth';
import QRScanner from '../common/QRScanner';

const UserDashboardContent = ({ onMobileMenuOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Dashboard statistics
  const stats = [
    {
      name: 'Total Credentials',
      value: dashboardData?.credentialCount || '0',
      change: '+12%',
      changeType: 'increase',
      icon: DocumentCheckIcon,
      color: 'emerald'
    },
    {
      name: 'Verifications',
      value: dashboardData?.verificationCount || '0',
      change: '+5%',
      changeType: 'increase',
      icon: ShieldCheckIcon,
      color: 'blue'
    },
    {
      name: 'Shares',
      value: dashboardData?.shareCount || '0',
      change: '+8%',
      changeType: 'increase',
      icon: ShareIcon,
      color: 'purple'
    },
    {
      name: 'Active Sessions',
      value: dashboardData?.activeSessionCount || '0',
      change: '0',
      changeType: 'neutral',
      icon: ClockIcon,
      color: 'yellow'
    }
  ];

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data from API
      const response = await fetch('/api/user/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        setNotifications(data.data.notifications || []);
        setRecentActivity(data.data.recentActivity || []);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = () => {
    navigate('/create-credential'); // Redirect to credential type selection
  };

  const handleBiometricSuccess = (data) => {
    setShowBiometric(false);
    toast.success('Biometric authentication successful!');
  };

  const handleBiometricError = (error) => {
    setShowBiometric(false);
    toast.error('Biometric authentication failed');
  };

  const handleQRScan = (qrData) => {
    setShowQRScanner(false);

    if (qrData.type === 'credential_share') {
      navigate(`/verify-shared/${qrData.shareId}`);
    } else {
      toast.error('Invalid QR code');
    }
  };

  // Unused functions removed to fix ESLint warnings

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onMobileMenuOpen}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md p-2"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-emerald-600">Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-600">
                Welcome back, {user?.profile?.firstName || user?.email || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your digital identity with privacy and control.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowQRScanner(true)}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                <QrCodeIcon className="w-5 h-5 mr-2" />
                Scan QR
              </button>
              <button
                onClick={handleCreateCredential}
                className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Credential
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      {stat.change !== '0' && (
                        <p className={`ml-2 text-sm font-medium ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Digital Identity Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:border-emerald-500 transition-all duration-200 hover:shadow-md">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                <IdentificationIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Digital Identity</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage your digital identity</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/create-credential"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Create Identity
                  </Link>
                  <Link
                    to="/my-identity"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Manage Identity
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Authentication Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Biometric Security</h3>
                <p className="text-sm text-gray-500 mb-4">Enhance security with biometric authentication</p>
                <button
                  onClick={() => setShowBiometric(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                >
                  Setup Biometrics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'credential_created' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      {activity.type === 'credential_shared' && (
                        <ShareIcon className="w-5 h-5 text-blue-500" />
                      )}
                      {activity.type === 'verification_requested' && (
                        <ClockIcon className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.type === 'warning' && (
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                      )}
                      {notification.type === 'success' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                      {notification.type === 'error' && (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                      {notification.type === 'info' && (
                        <BellIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                      <p className="text-xs text-gray-400">{notification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No new notifications</p>
            )}
          </div>
        </div>
      </div>

      {/* Biometric Authentication Modal */}
      {showBiometric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Biometric Authentication</h3>
            <BiometricAuth
              mode="register"
              type="fingerprint"
              onSuccess={handleBiometricSuccess}
              onError={handleBiometricError}
              className="mb-4"
            />
            <button
              onClick={() => setShowBiometric(false)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
        onError={(error) => {
          console.error('QR Scanner error:', error);
          toast.error('QR Scanner error');
        }}
      />
    </main>
  );
};

export default UserDashboardContent;
