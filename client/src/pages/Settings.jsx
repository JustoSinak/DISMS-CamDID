import React from 'react';

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Profile Information</h3>
                    <p className="text-sm text-gray-500">Update your personal information</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Edit
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-500">Manage your security preferences</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Configure
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Privacy Controls</h3>
                    <p className="text-sm text-gray-500">Control your data sharing preferences</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Manage
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    <p className="text-sm text-gray-500">Configure notification preferences</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Settings
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Theme</h3>
                    <p className="text-sm text-gray-500">Choose your preferred theme</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
