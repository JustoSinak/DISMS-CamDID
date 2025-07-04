import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Check, X, Clock, Shield } from 'lucide-react';
import { useIdentity } from '../../contexts/IdentityContext';

const CredentialStatus = ({ status }) => {
  const statusMap = {
    active: { icon: Check, color: 'text-green-600' },
    revoked: { icon: X, color: 'text-red-600' },
    pending: { icon: Clock, color: 'text-yellow-600' },
    verified: { icon: Shield, color: 'text-blue-600' }
  };

  const { icon: Icon, color } = statusMap[status] || statusMap.active;
  return (
    <div className={`flex items-center ${color} space-x-1 text-sm`}>
      <Icon className="w-4 h-4" />
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
};

const CredentialCard = ({ credential, onShare, onRevoke, onView }) => {
  const { decryptCredential } = useIdentity();
  const [decryptedData, setDecryptedData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleView = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const decrypted = await decryptCredential(credential.encryptedData, credential.encryptionKey);
      setDecryptedData(decrypted);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format expiration date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{credential.type}</h3>
            <p className="text-sm text-gray-500">Issued by {credential.issuer}</p>
            <p className="text-sm text-gray-500">Expires on: {formatDate(credential.metadata?.expirationDate)}</p>
          </div>
          <CredentialStatus status={credential.status} />
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={onView}
            disabled={isLoading || credential.status === 'revoked'}
          >
            View Details
          </Button>
          <Button
            variant="secondary"
            onClick={onShare}
            disabled={credential.status !== 'active'}
          >
            Share
          </Button>
          <Button
            variant="danger"
            onClick={onRevoke}
            disabled={credential.status !== 'active'}
          >
            Revoke
          </Button>
        </div>

        {/* Decrypted Data (shown when viewed) */}
        {decryptedData && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-gray-700">Credential Details</h4>
            <div className="space-y-1">
              {Object.entries(decryptedData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-600">{key}</span>
                  <span className="text-sm text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
      </div>
    </Card>
  );
};

export default CredentialCard;
