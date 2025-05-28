// identity-blockchain-app/client/src/components/dashboard/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import CredentialList from "./CredentialList";
import ActivityHistory from "./ActivityHistory";
import { WalletIcon, IdentificationIcon, ClockIcon } from "@heroicons/react/outline";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f0fdf4] text-slate-700 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-500">Welcome to your CamDID Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your digital identity with privacy and control.</p>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/wallet" className="bg-emerald-100 hover:bg-emerald-200 rounded-2xl shadow p-6 transition-all">
            <div className="flex items-center space-x-4">
              <WalletIcon className="w-8 h-8 text-emerald-500" />
              <div>
                <h2 className="text-lg font-semibold">My Wallet</h2>
                <p className="text-sm text-slate-600">View & share credentials</p>
              </div>
            </div>
          </Link>

          <Link to="/credentials" className="bg-violet-100 hover:bg-violet-200 rounded-2xl shadow p-6 transition-all">
            <div className="flex items-center space-x-4">
              <IdentificationIcon className="w-8 h-8 text-violet-500" />
              <div>
                <h2 className="text-lg font-semibold">My Credentials</h2>
                <p className="text-sm text-slate-600">Manage issued credentials</p>
              </div>
            </div>
          </Link>

          <Link to="/activity" className="bg-yellow-100 hover:bg-yellow-200 rounded-2xl shadow p-6 transition-all">
            <div className="flex items-center space-x-4">
              <ClockIcon className="w-8 h-8 text-yellow-500" />
              <div>
                <h2 className="text-lg font-semibold">Activity</h2>
                <p className="text-sm text-slate-600">View login & VC history</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Credential List & Activity Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-emerald-600">Recent Credentials</h3>
            <CredentialList />
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-bold mb-4 text-emerald-600">Recent Activity</h3>
            <ActivityHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
