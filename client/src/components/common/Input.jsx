import React from 'react';

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={`mt-1 block w-full rounded-md shadow-sm border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:ring-emerald-500 focus:border-emerald-500`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
