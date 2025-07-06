// client/src/components/common/QRGenerator.jsx - QR code generator component
import React, { useState, useEffect } from 'react';
import { 
  QrCodeIcon, 
  ShareIcon, 
  ClockIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const QRGenerator = ({ 
  credentialId, 
  onClose, 
  isOpen = false,
  className = ''
}) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 24 hours from now
    revealedAttributes: [],
    accessLevel: 'view',
    maxUses: 1
  });
  const [availableAttributes, setAvailableAttributes] = useState([]);

  useEffect(() => {
    if (isOpen && credentialId) {
      loadCredentialAttributes();
    }
  }, [isOpen, credentialId]);

  const loadCredentialAttributes = async () => {
    try {
      const response = await fetch(`/api/credentials/${credentialId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const attributes = Object.keys(data.credential.data || {});
        setAvailableAttributes(attributes);
        setShareSettings(prev => ({
          ...prev,
          revealedAttributes: attributes.slice(0, 3) // Default to first 3 attributes
        }));
      }
    } catch (error) {
      console.error('Error loading credential attributes:', error);
      toast.error('Failed to load credential details');
    }
  };

  const generateQRCode = async () => {
    if (shareSettings.revealedAttributes.length === 0) {
      toast.error('Please select at least one attribute to share');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sharing/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          credentialId,
          ...shareSettings
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQrData(data.data);
        toast.success('QR code generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Error generating QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = () => {
    if (qrData?.shareUrl) {
      navigator.clipboard.writeText(qrData.shareUrl);
      toast.success('Share URL copied to clipboard!');
    }
  };

  const downloadQRCode = () => {
    if (qrData?.qrCode) {
      const link = document.createElement('a');
      link.href = qrData.qrCode;
      link.download = `credential-qr-${credentialId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded!');
    }
  };

  const handleAttributeToggle = (attribute) => {
    setShareSettings(prev => ({
      ...prev,
      revealedAttributes: prev.revealedAttributes.includes(attribute)
        ? prev.revealedAttributes.filter(attr => attr !== attribute)
        : [...prev.revealedAttributes, attribute]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${className}`}>
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Share Credential via QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!qrData ? (
            /* Configuration Form */
            <div className="space-y-6">
              {/* Attribute Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select attributes to share:
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableAttributes.map((attribute) => (
                    <label key={attribute} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shareSettings.revealedAttributes.includes(attribute)}
                        onChange={() => handleAttributeToggle(attribute)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {attribute.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expiration Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Time:
                </label>
                <input
                  type="datetime-local"
                  value={shareSettings.expirationTime}
                  onChange={(e) => setShareSettings(prev => ({
                    ...prev,
                    expirationTime: e.target.value
                  }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level:
                </label>
                <select
                  value={shareSettings.accessLevel}
                  onChange={(e) => setShareSettings(prev => ({
                    ...prev,
                    accessLevel: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="view">View Only</option>
                  <option value="verify">Verify</option>
                  <option value="full">Full Access</option>
                </select>
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Uses:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={shareSettings.maxUses}
                  onChange={(e) => setShareSettings(prev => ({
                    ...prev,
                    maxUses: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQRCode}
                disabled={loading || shareSettings.revealedAttributes.length === 0}
                className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <QrCodeIcon className="w-5 h-5 mr-2" />
                    Generate QR Code
                  </>
                )}
              </button>
            </div>
          ) : (
            /* QR Code Display */
            <div className="space-y-6">
              {/* QR Code Image */}
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={qrData.qrCode}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              {/* QR Code Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>Expires: {new Date(qrData.expiresAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  <span>Max uses: {qrData.maxUses}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShareIcon className="w-4 h-4 mr-2" />
                  <span>Attributes: {qrData.revealedAttributes.join(', ')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyShareUrl}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                  Copy Share URL
                </button>
                <button
                  onClick={downloadQRCode}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <QrCodeIcon className="w-5 h-5 mr-2" />
                  Download QR
                </button>
              </div>

              {/* Generate New Button */}
              <button
                onClick={() => setQrData(null)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Generate New QR Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
