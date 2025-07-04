import React, { forwardRef } from 'react';
import { MoreVertical } from 'lucide-react';

const Card = forwardRef(({
  children,
  variant = 'default', // default, elevated, outlined, filled
  padding = 'md', // none, sm, md, lg, xl
  className = '',
  hover = false,
  clickable = false,
  onClick,
  ...props
}, ref) => {
  const baseClasses = `
    rounded-xl transition-all duration-200
    ${clickable || onClick ? 'cursor-pointer' : ''}
    ${hover ? 'transform hover:-translate-y-1 hover:shadow-lg' : ''}
  `;

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const variantClasses = {
    default: 'bg-white shadow-md border border-gray-200',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };

  return (
    <div
      ref={ref}
      className={`
        ${baseClasses}
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = ({ children, className = '', action, ...props }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
    <div className="flex-1">{children}</div>
    {action && <div className="flex-shrink-0 ml-4">{action}</div>}
  </div>
);

const CardTitle = ({ children, className = '', level = 2, ...props }) => {
  const Tag = `h${level}`;
  return (
    <Tag className={`text-xl font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </Tag>
  );
};

const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

// Identity-specific card variants for the blockchain identity system
const IdentityCard = forwardRef(({
  identity,
  status = 'active', // active, pending, expired, revoked
  showQR = false,
  onShare,
  onManage,
  className = '',
  ...props
}, ref) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    expired: 'bg-gray-100 text-gray-800 border-gray-300',
    revoked: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <Card 
      ref={ref}
      variant="elevated" 
      hover
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Status indicator */}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>

      <CardHeader>
        <div>
          <CardTitle level={3}>Digital Identity</CardTitle>
          <CardDescription>Self-Sovereign Identity on Blockchain</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {identity && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">DID</span>
              <span className="text-sm font-mono text-gray-900 truncate max-w-32">
                {identity.did}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Created</span>
              <span className="text-sm text-gray-900">
                {new Date(identity.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Credentials</span>
              <span className="text-sm font-semibold text-blue-600">
                {identity.credentialCount || 0} active
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex space-x-3">
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Identity
            </button>
          )}
          {onManage && (
            <button
              onClick={onManage}
              className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Manage
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
});

const CredentialCard = forwardRef(({
  credential,
  issuer,
  onVerify,
  onRevoke,
  className = '',
  ...props
}, ref) => {
  return (
    <Card 
      ref={ref}
      variant="outlined"
      hover
      className={className}
      {...props}
    >
      <CardHeader action={
        <button className="p-1 rounded-full hover:bg-gray-100">
          <MoreVertical size={16} className="text-gray-400" />
        </button>
      }>
        <div>
          <CardTitle level={4}>{credential?.type || 'Verifiable Credential'}</CardTitle>
          <CardDescription>
            Issued by {issuer?.name || 'Unknown Issuer'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {credential?.claims && Object.entries(credential.claims).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex space-x-2 text-xs text-gray-500">
          <span>Expires: {credential?.expiresAt ? new Date(credential.expiresAt).toLocaleDateString() : 'Never'}</span>
          <span>•</span>
          <span>Verified on blockchain</span>
        </div>
      </CardFooter>
    </Card>
  );
});

Card.displayName = 'Card';
IdentityCard.displayName = 'IdentityCard';
CredentialCard.displayName = 'CredentialCard';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  IdentityCard,
  CredentialCard
};
export default Card;