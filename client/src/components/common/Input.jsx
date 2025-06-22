// import React from 'react';

// const Input = ({ label, error, className, ...props }) => {
//   return (
//     <div className={className}>
//       {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
//       <input
//         className={`mt-1 block w-full rounded-md shadow-sm border ${
//           error ? 'border-red-500' : 'border-gray-300'
//         } focus:ring-emerald-500 focus:border-emerald-500`}
//         {...props}
//       />
//       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//     </div>
//   );
// };

// export default Input;


import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  className = '',
  icon,
  helperText,
  variant = 'default', // default, outlined, filled
  size = 'md', // sm, md, lg
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: `border-2 ${
      error 
        ? 'border-red-500 bg-red-50' 
        : success 
          ? 'border-green-500 bg-green-50'
          : isFocused 
            ? 'border-blue-500 bg-white' 
            : 'border-gray-300 bg-white hover:border-gray-400'
    }`,
    outlined: `border-2 bg-transparent ${
      error 
        ? 'border-red-500' 
        : success 
          ? 'border-green-500'
          : isFocused 
            ? 'border-blue-500' 
            : 'border-gray-300 hover:border-gray-400'
    }`,
    filled: `border-0 ${
      error 
        ? 'bg-red-100' 
        : success 
          ? 'bg-green-100'
          : 'bg-gray-100 hover:bg-gray-200 focus:bg-white'
    }`
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          error ? 'text-red-700' : success ? 'text-green-700' : 'text-gray-700'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur && onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-lg transition-all duration-200 outline-none
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            placeholder:text-gray-400
          `}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={disabled}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {(error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle size={20} className="text-red-500" />
            ) : (
              <CheckCircle size={20} className="text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <div className={`mt-2 text-sm ${
          error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-600'
        }`}>
          {error || success || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;