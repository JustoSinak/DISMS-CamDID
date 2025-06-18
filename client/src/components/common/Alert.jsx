import React from 'react';

const Alert = ({ type = 'info', message }) => {
  const baseStyle = 'p-4 rounded-md text-sm font-medium';
  const typeStyles = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type] || typeStyles.info}`} role="alert">
      {message}
    </div>
  );
};

export default Alert;
