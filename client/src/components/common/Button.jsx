// import React from 'react';
// import { Loader2 } from 'lucide-react';

// const Button = ({ 
//   children, 
//   className = '', 
//   variant = 'primary',
//   loading = false,
//   disabled = false,
//   type = 'button',
//   ...props 
// }) => {
//   const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
//   const variantClasses = {
//     primary: 'border-transparent text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400',
//     secondary: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-emerald-500 disabled:bg-gray-100',
//     danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
//     outline: 'border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50 focus:ring-emerald-500 disabled:border-emerald-300 disabled:text-emerald-300'
//   };

//   const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

//   return (
//     <button 
//       className={combinedClasses}
//       disabled={disabled || loading}
//       type={type}
//       {...props}
//     >
//       {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//       {children}
//     </button>
//   );
// };

// export default Button;

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, outline, ghost, danger, success
  size = 'md', // sm, md, lg, xl
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-3 text-base gap-2',
    lg: 'px-6 py-4 text-lg gap-3',
    xl: 'px-8 py-5 text-xl gap-3'
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 text-white
      hover:from-blue-700 hover:to-blue-800
      active:from-blue-800 active:to-blue-900
      focus:ring-blue-500 shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5 active:translate-y-0
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900
      hover:from-gray-200 hover:to-gray-300
      active:from-gray-300 active:to-gray-400
      focus:ring-gray-500 border border-gray-300
      transform hover:-translate-y-0.5 active:translate-y-0
    `,
    outline: `
      bg-transparent border-2 border-blue-600 text-blue-600
      hover:bg-blue-600 hover:text-white
      active:bg-blue-700 active:border-blue-700
      focus:ring-blue-500
      transform hover:-translate-y-0.5 active:translate-y-0
    `,
    ghost: `
      bg-transparent text-gray-700 hover:bg-gray-100
      active:bg-gray-200 focus:ring-gray-500
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
      active:from-red-800 active:to-red-900
      focus:ring-red-500 shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5 active:translate-y-0
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700 text-white
      hover:from-green-700 hover:to-green-800
      active:from-green-800 active:to-green-900
      focus:ring-green-500 shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5 active:translate-y-0
    `
  };

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        ${isDisabled ? 'transform-none' : ''}
      `}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' || size === 'xl' ? 24 : 20} />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="flex-shrink-0">
              {leftIcon}
            </span>
          )}
          <span className={leftIcon || rightIcon ? 'flex-1' : ''}>{children}</span>
          {rightIcon && (
            <span className="flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;