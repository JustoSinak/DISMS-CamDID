import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  History, 
  Settings, 
  PlusCircle,
  ClipboardList,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';

const IssuerDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const features = [
    {
      title: 'Issue Credential',
      description: 'Create and issue new credentials',
      icon: PlusCircle,
      link: '/issuer/issue',
      color: 'emerald'
    },
    {
      title: 'Manage Templates',
      description: 'Create and manage credential templates',
      icon: ClipboardList,
      link: '/issuer/templates',
      color: 'blue'
    },
    {
      title: 'Issued Credentials',
      description: 'View and manage issued credentials',
      icon: FileText,
      link: '/issuer/credentials',
      color: 'purple'
    },
    {
      title: 'Citizens',
      description: 'View and manage citizen records',
      icon: Users,
      link: '/issuer/citizens',
      color: 'orange'
    }
  ];

  const recentActivities = [
    {
      type: 'credential_issued',
      title: 'Birth Certificate issued to John Doe',
      timestamp: '1 hour ago',
      status: 'success',
      icon: CheckCircle
    },
    {
      type: 'template_created',
      title: 'New template: Driver\'s License',
      timestamp: '3 hours ago',
      status: 'success',
      icon: ClipboardList
    },
    {
      type: 'issue_failed',
      title: 'Failed to issue ID to Jane Smith',
      timestamp: '5 hours ago',
      status: 'error',
      icon: AlertCircle
    }
  ];

  const statistics = [
    {
      title: 'Total Issued',
      value: '1,234',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Templates',
      value: '15',
      change: '+2',
      trend: 'up'
    },
    {
      title: 'Citizens Served',
      value: '892',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Success Rate',
      value: '99.8%',
      change: '+0.2%',
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
            Welcome back, {user?.firstName || 'Issuer'}
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage and issue digital credentials
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

        {/* Recent Activity */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-lg`}>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${
                  activity.status === 'success' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                } flex items-center justify-center mr-4`}>
                  <activity.icon className={`w-5 h-5 ${
                    activity.status === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`} />
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
      </div>
    </div>
  );
};

export default IssuerDashboard; 