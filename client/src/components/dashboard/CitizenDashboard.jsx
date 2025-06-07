import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import { 
  IdentificationIcon,
  DocumentCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto transition-all duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-600">Citizen Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your digital identity and credentials</p>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Digital Identity Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-500 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <IdentificationIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Digital Identity</h3>
                  <p className="text-sm text-gray-500">View and manage your digital identity</p>
                </div>
              </div>
              <Link
                to="/manage-identity"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Manage Identity
              </Link>
            </div>

            {/* Credentials Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-500 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DocumentCheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Credentials</h3>
                  <p className="text-sm text-gray-500">View and share your credentials</p>
                </div>
              </div>
              <Link
                to="/credentials"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                View Credentials
              </Link>
            </div>

            {/* Verification Requests Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-emerald-500 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BellIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Verification Requests</h3>
                  <p className="text-sm text-gray-500">Manage verification requests</p>
                </div>
              </div>
              <Link
                to="/requests"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                View Requests
              </Link>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Full name</div>
                <div className="col-span-2 text-sm text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Email address</div>
                <div className="col-span-2 text-sm text-gray-900">{user?.email}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-gray-500">Role</div>
                <div className="col-span-2 text-sm text-gray-900">Citizen</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard; 