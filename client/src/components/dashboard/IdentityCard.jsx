import React from 'react';

const IdentityCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full mb-4">
      <div className="mb-6">
        <h3 className="text-slate-800 text-xl font-semibold m-0">
          Digital Identity Card
        </h3>
      </div>
      
      <div>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="text-gray-600 font-medium w-24 flex-shrink-0">Name:</span>
            <span className="text-slate-800 break-all">{user.name}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-600 font-medium w-24 flex-shrink-0">DID:</span>
            <span className="text-slate-800 break-all">{user.did}</span>
          </div>
          
          {user.email && (
            <div className="flex items-center">
              <span className="text-gray-600 font-medium w-24 flex-shrink-0">Email:</span>
              <span className="text-slate-800 break-all">{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentityCard; 