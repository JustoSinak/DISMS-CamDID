import React from 'react';

const VerifyCredential = () => {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Verify Credential</h2>
        <p className="text-gray-600 mt-1">Verify the authenticity of presented credentials</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Credential Presentation</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              className="flex-1 block w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              placeholder="Enter credential presentation data"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">QR Code Scanner</label>
          <div className="mt-1">
            {/* QR code scanner component will go here */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-500">Click to scan QR code</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Verify Credential
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCredential;
