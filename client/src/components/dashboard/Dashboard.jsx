// identity-blockchain-app/client/src/components/dashboard/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import CredentialList from "./CredentialList";
import ActivityHistory from "./ActivityHistory";
import Sidebar from "../shared/Sidebar";
import { 
  WalletIcon, 
  IdentificationIcon, 
  ClockIcon, 
  PlusCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const stats = [
    { name: 'Total Credentials', value: '12', change: '+2', changeType: 'increase' },
    { name: 'Verifications', value: '24', change: '+5', changeType: 'increase' },
    { name: 'Trust Score', value: '98%', change: '+0.5%', changeType: 'increase' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto transition-all duration-300">
        <div className="p-8">
          {/* Header with Create Credential Button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-emerald-600">Welcome to your CamDID Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your digital identity with privacy and control.</p>
            </div>
            <Link
              to="/create-identity"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Create Credential
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex items-center ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link to="/wallet" className="bg-white hover:bg-emerald-50 rounded-xl shadow-sm border border-gray-200 p-6 transition-all group">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 p-3 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <WalletIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Wallet</h2>
                  <p className="text-sm text-gray-500">View & share credentials</p>
                </div>
              </div>
            </Link>

            <Link to="/credentials" className="bg-white hover:bg-violet-50 rounded-xl shadow-sm border border-gray-200 p-6 transition-all group">
              <div className="flex items-center space-x-4">
                <div className="bg-violet-100 p-3 rounded-lg group-hover:bg-violet-200 transition-colors">
                  <IdentificationIcon className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">My Credentials</h2>
                  <p className="text-sm text-gray-500">Manage issued credentials</p>
                </div>
              </div>
            </Link>

            <Link to="/activity" className="bg-white hover:bg-amber-50 rounded-xl shadow-sm border border-gray-200 p-6 transition-all group">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <ClockIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
                  <p className="text-sm text-gray-500">View login & VC history</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Credential List & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Credentials</h3>
                <Link 
                  to="/credentials"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all
                </Link>
              </div>
              <CredentialList />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Link 
                  to="/activity"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all
                </Link>
              </div>
              <ActivityHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
