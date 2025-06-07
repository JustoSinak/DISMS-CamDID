import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  History, 
  Settings, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const VerifierDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const features = [
    {
      title: 'Scan Credential',
      description: 'Scan and verify digital credentials',
      icon: QrCode,
      link: '/verifier/scan',
      color: 'emerald'
    },
    {
      title: 'Search Records',
      description: 'Search through verification history',
      icon: Search,
      link: '/verifier/search',
      color: 'blue'
    },
    {
      title: 'Verification History',
      description: 'View past verifications',
      icon: History,
      link: '/verifier/history',
      color: 'purple'
    },
    {
      title: 'Settings',
      description: 'Configure verification settings',
      icon: Settings,
      link: '/verifier/settings',
      color: 'orange'
    }
  ];

  const recentVerifications = [
    {
      type: 'success',
      title: 'National ID verified',
      citizen: 'John Doe',
      timestamp: '5 minutes ago',
      icon: CheckCircle
    },
    {
      type: 'pending',
      title: 'Birth Certificate verification',
      citizen: 'Jane Smith',
      timestamp: '10 minutes ago',
      icon: Clock
    },
    {
      type: 'failed',
      title: 'Driver\'s License invalid',
      citizen: 'Mike Johnson',
      timestamp: '1 hour ago',
      icon: XCircle
    }
  ];

  const statistics = [
    {
      title: 'Today\'s Verifications',
      value: '45',
      change: '+5',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      change: '+0.5%',
      trend: 'up'
    },
    {
      title: 'Average Time',
      value: '45s',
      change: '-5s',
      trend: 'down'
    },
    {
      title: 'Total Verifications',
      value: '1,234',
      change: '+12%',
      trend: 'up'
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
            Welcome back, {user?.firstName || 'Verifier'}
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Verify and validate digital credentials
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-white'
              } shadow-lg`}
            >
              <h3 className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {stat.title}
              </h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
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

        {/* Recent Verifications */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">Recent Verifications</h2>
          <div className="space-y-4">
            {recentVerifications.map((verification, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${
                  verification.type === 'success' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20' 
                    : verification.type === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                    : 'bg-red-100 dark:bg-red-900/20'
                } flex items-center justify-center mr-4`}>
                  <verification.icon className={`w-5 h-5 ${
                    verification.type === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : verification.type === 'pending'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{verification.title}</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {verification.citizen} • {verification.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard; 