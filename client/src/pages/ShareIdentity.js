import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIdentity } from '../contexts/IdentityContext';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import CredentialShareRequest from '../components/credentials/CredentialShareRequest';
import { Button } from '../components/common/Button';
import { Lock } from 'lucide-react';

const ShareIdentity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { verifyCredential, error } = useIdentity();
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Extract share parameters from URL
    const searchParams = new URLSearchParams(location.search);
    const credentialId = searchParams.get('credentialId');
    const token = searchParams.get('token');

    if (!credentialId || !token) {
      navigate('/dashboard');
      return;
    }

    // Verify share token
    const verifyShare = async () => {
      try {
        setLoading(true);
        const isValid = await verifyCredential(credentialId, token);
        if (isValid) {
          setShareLink({ credentialId, token });
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error verifying share:', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    verifyShare();
  }, [isAuthenticated, location.search, navigate, verifyCredential]);

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  <Lock className="w-6 h-6 inline-block mr-2" />
                  View Shared Credential
                </h1>
                
                {error && (
                  <div className="text-red-600 text-sm mb-4">{error}</div>
                )}

                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying credential share...</p>
                  </div>
                )}

                {shareLink && !loading && (
                  <CredentialShareRequest
                    shareLink={shareLink}
                    onClose={handleClose}
                  />
                )}

                {!shareLink && !loading && (
                  <div className="text-center">
                    <p className="text-gray-500">
                      Invalid or expired share link. Please request a new share link.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={handleClose}
                      className="mt-4"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareIdentity;