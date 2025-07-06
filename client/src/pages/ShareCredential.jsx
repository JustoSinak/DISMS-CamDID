// client/src/pages/ShareCredential.jsx - Credential sharing page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  QrCodeIcon, 
  ShareIcon, 
  LinkIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import QRGenerator from '../components/common/QRGenerator';
import Sidebar from '../components/shared/Sidebar';

const ShareCredential = () => {
  const navigate = useNavigate();
  const { credentialId } = useParams();
  
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(credentialId || '');
  const [loading, setLoading] = useState(true);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [shareHistory, setShareHistory] = useState([]);

  useEffect(() => {
    loadCredentials();
    loadShareHistory();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/credentials', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
        
        // If credentialId is provided in URL, select it
        if (credentialId) {
          setSelectedCredential(credentialId);
        }
      } else {
        toast.error('Failed to load credentials');
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast.error('Error loading credentials');
    } finally {
      setLoading(false);
    }
  };

  const loadShareHistory = async () => {
    try {
      const response = await fetch('/api/sharing/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShareHistory(data.data.shares || []);
      }
    } catch (error) {
      console.error('Error loading share history:', error);
    }
  };

  const handleGenerateQR = () => {
    if (!selectedCredential) {
      toast.error('Please select a credential to share');
      return;
    }
    setShowQRGenerator(true);
  };

  const handleGenerateLink = async () => {
    if (!selectedCredential) {
      toast.error('Please select a credential to share');
      return;
    }

    try {
      const response = await fetch('/api/sharing/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          credentialId: selectedCredential,
          expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          revealedAttributes: ['name', 'dateOfBirth'], // Default attributes
          passwordProtected: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.data.shareUrl);
        toast.success('Share link copied to clipboard!');
        loadShareHistory(); // Refresh history
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Error generating share link');
    }
  };

  const revokeShare = async (shareId) => {
    try {
      const response = await fetch(`/api/sharing/revoke/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Share revoked successfully');
        loadShareHistory(); // Refresh history
      } else {
        toast.error('Failed to revoke share');
      }
    } catch (error) {
      console.error('Error revoking share:', error);
      toast.error('Error revoking share');
    }
  };

  const getCredentialName = (credId) => {
    const credential = credentials.find(c => c._id === credId);
    return credential ? credential.metadata?.title || credential.type : 'Unknown Credential';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-emerald-600">Share Credential</h1>
                <p className="text-gray-600 mt-1">Share your credentials securely with QR codes or links</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Credential Selection and Sharing Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Credential Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Credential to Share</h3>
                
                {credentials.length > 0 ? (
                  <div className="space-y-3">
                    {credentials.map((credential) => (
                      <label key={credential._id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-emerald-300 cursor-pointer">
                        <input
                          type="radio"
                          name="credential"
                          value={credential._id}
                          checked={selectedCredential === credential._id}
                          onChange={(e) => setSelectedCredential(e.target.value)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {credential.metadata?.title || credential.type}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              credential.status === 'verified' 
                                ? 'bg-green-100 text-green-800'
                                : credential.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {credential.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Issued by: {credential.issuer || 'Unknown'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No credentials available to share</p>
                    <button
                      onClick={() => navigate('/create-credential')}
                      className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Create Credential
                    </button>
                  </div>
                )}
              </div>

              {/* Sharing Options */}
              {selectedCredential && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* QR Code Sharing */}
                    <button
                      onClick={handleGenerateQR}
                      className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                    >
                      <QrCodeIcon className="w-12 h-12 text-emerald-600 mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">QR Code</h4>
                      <p className="text-sm text-gray-500 text-center">
                        Generate a QR code for quick sharing with customizable settings
                      </p>
                    </button>

                    {/* Link Sharing */}
                    <button
                      onClick={handleGenerateLink}
                      className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <LinkIcon className="w-12 h-12 text-blue-600 mb-3" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Share Link</h4>
                      <p className="text-sm text-gray-500 text-center">
                        Generate a secure link that can be shared via email or messaging
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shares</h3>
              
              {shareHistory.length > 0 ? (
                <div className="space-y-4">
                  {shareHistory.slice(0, 5).map((share) => (
                    <div key={share.shareId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {getCredentialName(share.credentialId)}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Type: {share.type === 'qr' ? 'QR Code' : 'Link'}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            <span>
                              {share.isExpired ? 'Expired' : `Expires ${new Date(share.expirationTime).toLocaleDateString()}`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Uses: {share.currentUses}/{share.maxUses || '∞'}
                          </p>
                        </div>
                        {!share.isExpired && (
                          <button
                            onClick={() => revokeShare(share.shareId)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No shares yet</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* QR Generator Modal */}
      <QRGenerator
        credentialId={selectedCredential}
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
      />
    </div>
  );
};

export default ShareCredential;
