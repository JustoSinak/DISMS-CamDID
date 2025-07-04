import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWeb3 } from '../../hooks/useWeb3';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Loader from '../common/Loader';
import Sidebar from '../shared/Sidebar';
import { 
  Users, 
  Shield, 
  FileText, 
  Activity, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Database,
  UserCheck,
  UserX,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { web3 } = useWeb3();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [issuers, setIssuers] = useState([]);
  const [verifiers, setVerifiers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, issuersRes, verifiersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('/api/admin/users?limit=10', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('/api/admin/issuers', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('/api/admin/verifiers', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('/api/admin/analytics?period=7d', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      const [statsData, usersData, issuersData, verifiersData, analyticsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        issuersRes.json(),
        verifiersRes.json(),
        analyticsRes.json()
      ]);

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data.users);
      if (issuersData.success) setIssuers(issuersData.data.issuers);
      if (verifiersData.success) setVerifiers(verifiersData.data.verifiers);
      if (analyticsData.success) setAnalytics(analyticsData.data);

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/health', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSystemHealth(data.data);
      }
    } catch (error) {
      console.error('System health loading error:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(`${action} successful`);
        loadDashboardData();
      } else {
        setError(result.message || `Failed to ${action}`);
      }
    } catch (error) {
      setError(`Failed to ${action}`);
      console.error(`${action} error:`, error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthStatus = () => {
    if (!systemHealth) return { status: 'unknown', color: 'text-gray-500' };
    
    const uptime = systemHealth.uptime;
    if (uptime > 86400) return { status: 'excellent', color: 'text-green-500' };
    if (uptime > 3600) return { status: 'good', color: 'text-blue-500' };
    if (uptime > 300) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'critical', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} shrink-0`}>
        <Sidebar onCollapseChange={setIsCollapsed} />
      </div>

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System monitoring and management</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'issuers', label: 'Issuer Management', icon: Shield },
                { id: 'verifiers', label: 'Verifier Management', icon: UserCheck },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'system', label: 'System', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* System Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats?.users?.total || 0}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Credentials</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats?.credentials?.total || 0}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Issuers</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats?.users?.issuers || 0}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <UserCheck className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Verifiers</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats?.users?.verifiers || 0}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* System Health */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Status</p>
                        <p className={`text-lg font-semibold ${getHealthStatus().color}`}>
                          {getHealthStatus().status.toUpperCase()}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Uptime</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {systemHealth ? Math.floor(systemHealth.uptime / 3600) : 0}h
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {systemHealth ? Math.round(systemHealth.memory.heapUsed / 1024 / 1024) : 0}MB
                        </p>
                      </div>
                      <Database className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <Button onClick={() => navigate('/admin/users')}>
                    View All Users
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate(`/admin/users/${user._id}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {user.isActive ? (
                                <button
                                  onClick={() => handleUserAction(user._id, 'deactivate', { reason: 'Admin action' })}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction(user._id, 'reactivate')}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'issuers' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Issuer Management</h3>
                  <Button onClick={() => navigate('/admin/issuers')}>
                    Manage Issuers
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {issuers.map((issuer) => (
                    <div key={issuer._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{issuer.email}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issuer.isActive ? 'active' : 'inactive')}`}>
                          {issuer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Credentials issued: {issuer.credentialCount || 0}
                      </p>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                          View Details
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm">
                          Suspend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'verifiers' && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Verifier Management</h3>
                  <Button onClick={() => navigate('/admin/verifiers')}>
                    Manage Verifiers
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {verifiers.map((verifier) => (
                    <div key={verifier._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{verifier.email}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verifier.isActive ? 'active' : 'inactive')}`}>
                          {verifier.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Verifications: {verifier.verificationCount || 0}
                      </p>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                          View Details
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm">
                          Suspend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
                {analytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">User Registrations</p>
                        <p className="text-2xl font-semibold text-blue-900">
                          {analytics.metrics?.userRegistrations || 0}
                        </p>
                        <p className="text-xs text-blue-600">Last 7 days</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Credential Issuances</p>
                        <p className="text-2xl font-semibold text-green-900">
                          {analytics.metrics?.credentialIssuances || 0}
                        </p>
                        <p className="text-xs text-green-600">Last 7 days</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600">Verifications</p>
                        <p className="text-2xl font-semibold text-purple-900">
                          {analytics.metrics?.verifications || 0}
                        </p>
                        <p className="text-xs text-purple-600">Last 7 days</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600">Active Users</p>
                        <p className="text-2xl font-semibold text-orange-900">
                          {analytics.metrics?.activeUsers || 0}
                        </p>
                        <p className="text-xs text-orange-600">Last 7 days</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No analytics data available</p>
                )}
              </Card>
            )}

            {activeTab === 'system' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button onClick={() => navigate('/admin/config')} className="w-full">
                        System Configuration
                      </Button>
                      <Button onClick={() => navigate('/admin/logs')} className="w-full">
                        View Audit Logs
                      </Button>
                      <Button onClick={() => navigate('/admin/emergency')} className="w-full">
                        Emergency Management
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">System Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Maintenance Mode</span>
                        <span className="text-sm font-medium text-green-600">Off</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Emergency Status</span>
                        <span className="text-sm font-medium text-green-600">None</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Blockchain Status</span>
                        <span className="text-sm font-medium text-green-600">Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 