import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Shield, AlertCircle } from 'lucide-react';
import Sidebar from '../shared/Sidebar';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Collapse sidebar automatically on small screens
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial check
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateIdentity = () => {
    navigate('/create-identity');
  };

  const handleCollapseChange = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  // Determine main content margin based on sidebar state and screen size
  const mainContentMarginClass = () => {
    if (windowWidth < 768) {
      // On small screens, no margin-left, sidebar overlays content
      return 'ml-0';
    }
    return isCollapsed ? 'ml-20' : 'ml-80';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onCollapseChange={handleCollapseChange} />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${mainContentMarginClass()}`}>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-600">Hey Welcome to your Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your digital identity and credentials</p>
          </div>

          {/* Identity Management Section */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Identity Management</h2>
                  <p className="text-gray-500 mt-1">Create and manage your digital identity</p>
                </div>
                <button
                  onClick={handleCreateIdentity}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                >
                  Create Identity
                </button>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Digital Identity Status</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Create your digital identity to start using the platform's features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Credentials</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">12</p>
                </div>
                <div className="text-green-600">
                  <span className="text-sm font-medium">+2</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verifications</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">24</p>
                </div>
                <div className="text-green-600">
                  <span className="text-sm font-medium">+5</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trust Score</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">98%</p>
                </div>
                <div className="text-green-600">
                  <span className="text-sm font-medium">+0.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {/* Activity items would go here */}
              <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
