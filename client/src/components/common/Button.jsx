import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  className = '', 
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantClasses = {
    primary: 'border-transparent text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400',
    secondary: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-emerald-500 disabled:bg-gray-100',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    outline: 'border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50 focus:ring-emerald-500 disabled:border-emerald-300 disabled:text-emerald-300'
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button 
      className={combinedClasses}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
