import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IdentityWizard from '../components/identity/IdentityWizard';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from '../components/common/Button';
import { Wallet, ChevronRight } from 'lucide-react';

const CreateIdentity = () => {
  const { isAuthenticated } = useAuth();
  const { account, connectWallet, error } = useWeb3();
  const navigate = useNavigate();
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleConnectWallet = async () => {
    setShowWalletModal(true);
    try {
      const connected = await connectWallet();
      if (connected) {
        setShowWalletModal(false);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setShowWalletModal(false);
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    <Wallet className="w-6 h-6 inline-block mr-2" />
                    Connect Your Wallet
                  </h1>
                  <p className="text-gray-600">
                    Please connect your MetaMask wallet to create a digital identity.
                  </p>
                  {error && (
                    <div className="text-red-600 text-sm mb-4">{error}</div>
                  )}
                  <Button
                    variant="primary"
                    onClick={handleConnectWallet}
                    className="mt-4"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Create Your Digital Identity
                </h1>
                <IdentityWizard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateIdentity;
