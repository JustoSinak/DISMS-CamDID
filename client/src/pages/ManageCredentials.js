import React from 'react';
import CredentialManager from '../components/credentials/CredentialManager';

const ManageCredentials = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CredentialManager />
      </div>
    </div>
  );
};

export default ManageCredentials;
