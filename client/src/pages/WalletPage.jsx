import React from 'react';

const WalletPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Credential Wallet</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Credentials</span>
                  <span className="text-lg font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Credentials</span>
                  <span className="text-lg font-semibold text-green-600">10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expired Credentials</span>
                  <span className="text-lg font-semibold text-red-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Requests</span>
                  <span className="text-lg font-semibold text-yellow-600">3</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Credentials List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">My Credentials</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add New
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Sample Credential Cards */}
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">National ID Card</h3>
                      <p className="text-sm text-gray-500">Issued by: Government of Cameroon</p>
                      <p className="text-sm text-gray-500">Expires: Dec 31, 2025</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Driver's License</h3>
                      <p className="text-sm text-gray-500">Issued by: Ministry of Transport</p>
                      <p className="text-sm text-gray-500">Expires: Mar 15, 2024</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Renew</button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">University Degree</h3>
                      <p className="text-sm text-gray-500">Issued by: University of Yaoundé</p>
                      <p className="text-sm text-gray-500">Expires: Never</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Share</button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Professional Certificate</h3>
                      <p className="text-sm text-gray-500">Issued by: Professional Board</p>
                      <p className="text-sm text-gray-500">Expires: Jun 30, 2026</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Verify</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
