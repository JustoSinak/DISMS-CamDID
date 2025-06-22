import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Lock, Eye, EyeOff, X } from 'lucide-react';
import { useIdentity } from '../../contexts/IdentityContext';
import { useWeb3 } from '../../contexts/Web3Context';

const CredentialShareRequest = ({ shareLink, onClose }) => {
  const { decryptCredential, error } = useIdentity();
  const { account } = useWeb3();
  const [encryptionKey, setEncryptionKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState(null);
  const [errorState, setError] = useState(null);

  const handleDecrypt = async () => {
    try {
      setLoading(true);
      const { credentialId, token } = shareLink;
      const decrypted = await decryptCredential(credentialId, encryptionKey, token);
      setCredential(decrypted);
    } catch (err) {
      console.error('Error decrypting credential:', err);
      if (err.message.includes('invalid token')) {
        setError('Invalid or expired share link. Please request a new share.');
      } else if (err.message.includes('invalid key')) {
        setError('Invalid encryption key. Please try again.');
      } else {
        setError('Failed to decrypt credential. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Credential Share Request</h3>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Encryption Key Input */}
        <div>
          <div className="relative">
            <Input
              label="Encryption Key"
              type={showKey ? 'text' : 'password'}
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              placeholder="Enter your encryption key"
              required
              disabled={loading || credential}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errorState && (
            <div className="mt-1 text-sm text-red-600">{errorState}</div>
          )}
        </div>

        {/* Decrypt Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleDecrypt}
            disabled={loading || !encryptionKey || credential}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            ) : (
              'View Credential'
            )}
          </Button>
        </div>

        {/* Decrypted Credential */}
        {credential && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Credential Details</h4>
            <div className="space-y-2">
              {Object.entries(credential).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm text-gray-600">{key}</span>
                  <span className="text-sm text-gray-900">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CredentialShareRequest;
