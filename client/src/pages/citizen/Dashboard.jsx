import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Share2, 
  History, 
  Settings, 
  Shield, 
  QrCode,
  FileText,
  Clock
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const CitizenDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const features = [
    {
      title: 'My Credentials',
      description: 'View and manage your digital credentials',
      icon: CreditCard,
      link: '/citizen/credentials',
      color: 'emerald'
    },
    {
      title: 'Share Credentials',
      description: 'Share your credentials with verifiers',
      icon: Share2,
      link: '/citizen/share',
      color: 'blue'
    },
    {
      title: 'Verification History',
      description: 'View your credential verification history',
      icon: History,
      link: '/citizen/history',
      color: 'purple'
    },
    {
      title: 'Privacy Settings',
      description: 'Manage your privacy preferences',
      icon: Shield,
      link: '/citizen/privacy',
      color: 'red'
    }
  ];

  const recentActivities = [
    {
      type: 'credential_issued',
      title: 'National ID Credential Issued',
      timestamp: '2 hours ago',
      icon: FileText
    },
    {
      type: 'credential_shared',
      title: 'Shared credentials with University',
      timestamp: '1 day ago',
      icon: Share2
    },
    {
      type: 'verification',
      title: 'Credentials verified by Employer',
      timestamp: '3 days ago',
      icon: Shield
    }
  ];

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Citizen'}
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your digital identity and credentials
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
              } shadow-lg`}
            >
              <Link to={feature.link} className="block">
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg mb-8`}>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-${
                  activity.type === 'credential_issued' ? 'emerald' :
                  activity.type === 'credential_shared' ? 'blue' :
                  'purple'
                }-100 dark:bg-opacity-20 flex items-center justify-center mr-4`}>
                  <activity.icon className={`w-5 h-5 text-${
                    activity.type === 'credential_issued' ? 'emerald' :
                    activity.type === 'credential_shared' ? 'blue' :
                    'purple'
                  }-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <QrCode className="w-6 h-6 mb-2 text-emerald-500" />
              <span className="text-sm">Show QR Code</span>
            </button>
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <Settings className="w-6 h-6 mb-2 text-blue-500" />
              <span className="text-sm">Settings</span>
            </button>
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <Clock className="w-6 h-6 mb-2 text-purple-500" />
              <span className="text-sm">History</span>
            </button>
            <button className={`p-4 rounded-lg flex flex-col items-center justify-center ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <Shield className="w-6 h-6 mb-2 text-red-500" />
              <span className="text-sm">Security</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard; 