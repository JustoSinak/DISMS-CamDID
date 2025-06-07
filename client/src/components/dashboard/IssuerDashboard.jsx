import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';

const IssuerDashboard = () => {
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
            <h1 className="text-3xl font-bold text-emerald-600">Issuer Dashboard</h1>
            <p className="text-slate-600 mt-1">Issue and manage digital credentials</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Issued</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">45</p>
                </div>
                <div className="text-green-600">
                  <span className="text-sm font-medium">+8</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Templates</p>
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
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">99.8%</p>
                </div>
                <div className="text-green-600">
                  <span className="text-sm font-medium">+0.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issuances Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Issuances</h2>
            <div className="space-y-4">
              {/* Issuance items would go here */}
              <p className="text-gray-500 text-sm">No recent issuances</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IssuerDashboard; 