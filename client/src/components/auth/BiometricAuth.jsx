// client/src/components/auth/BiometricAuth.jsx - Biometric authentication component
import React, { useState, useEffect } from 'react';
import { FingerPrintIcon, FaceSmileIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

// Global type declaration for WebAuthn API
/* global PublicKeyCredential */
import { toast } from 'react-toastify';

const BiometricAuth = ({
  onSuccess,
  onError,
  type = 'fingerprint', // 'fingerprint', 'face', 'voice'
  mode = 'verify', // 'register', 'verify'
  className = ''
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle'); // 'idle', 'authenticating', 'success', 'error'

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check for WebAuthn support
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
      } else {
        setIsSupported(false);
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsSupported(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!isSupported) {
      toast.error('Biometric authentication is not supported on this device');
      return;
    }

    setIsAuthenticating(true);
    setAuthStatus('authenticating');

    try {
      if (mode === 'register') {
        await registerBiometric();
      } else {
        await verifyBiometric();
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      setAuthStatus('error');
      setIsAuthenticating(false);

      if (onError) {
        onError(error);
      } else {
        toast.error('Biometric authentication failed');
      }
    }
  };

  const registerBiometric = async () => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "DISMS",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode("user123"), // Should be user ID from context
          name: "user@example.com", // Should be user email from context
          displayName: "User Name", // Should be user name from context
        },
        pubKeyCredParams: [
          {
            alg: -7, // ES256
            type: "public-key"
          }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential) {
        // Store credential info securely
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          type: credential.type,
          response: {
            attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
            clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
          }
        };

        // Send to backend for storage
        await storeBiometricCredential(credentialData);

        setAuthStatus('success');
        setIsAuthenticating(false);

        if (onSuccess) {
          onSuccess(credentialData);
        }

        toast.success('Biometric authentication registered successfully');
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyBiometric = async () => {
    try {
      // Get stored credential IDs from backend
      const storedCredentials = await getStoredCredentials();

      if (!storedCredentials || storedCredentials.length === 0) {
        throw new Error('No biometric credentials found. Please register first.');
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: storedCredentials.map(cred => ({
          id: new Uint8Array(cred.rawId),
          type: 'public-key'
        })),
        timeout: 60000,
        userVerification: "required"
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        // Verify assertion with backend
        const verificationData = {
          id: assertion.id,
          rawId: Array.from(new Uint8Array(assertion.rawId)),
          type: assertion.type,
          response: {
            authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
            clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
            signature: Array.from(new Uint8Array(assertion.response.signature)),
            userHandle: assertion.response.userHandle ? Array.from(new Uint8Array(assertion.response.userHandle)) : null
          }
        };

        const isValid = await verifyBiometricAssertion(verificationData);

        if (isValid) {
          setAuthStatus('success');
          setIsAuthenticating(false);

          if (onSuccess) {
            onSuccess(verificationData);
          }

          toast.success('Biometric authentication successful');
        } else {
          throw new Error('Biometric verification failed');
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const storeBiometricCredential = async (credentialData) => {
    try {
      const response = await fetch('/api/auth/biometric/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          credentialData,
          biometricType: type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to store biometric credential');
      }

      return await response.json();
    } catch (error) {
      console.error('Error storing biometric credential:', error);
      throw error;
    }
  };

  const getStoredCredentials = async () => {
    try {
      const response = await fetch('/api/auth/biometric/credentials', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get stored credentials');
      }

      const data = await response.json();
      return data.credentials || [];
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return [];
    }
  };

  const verifyBiometricAssertion = async (verificationData) => {
    try {
      const response = await fetch('/api/auth/biometric/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          verificationData,
          biometricType: type
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify biometric assertion');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error verifying biometric assertion:', error);
      throw error;
    }
  };

  const getBiometricIcon = () => {
    switch (type) {
      case 'face':
        return <FaceSmileIcon className="w-8 h-8" />;
      case 'voice':
        return <MicrophoneIcon className="w-8 h-8" />;
      default:
        return <FingerPrintIcon className="w-8 h-8" />;
    }
  };

  const getBiometricLabel = () => {
    const action = mode === 'register' ? 'Register' : 'Verify';
    switch (type) {
      case 'face':
        return `${action} Face ID`;
      case 'voice':
        return `${action} Voice`;
      default:
        return `${action} Fingerprint`;
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-center p-4 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-500 mb-2">
          {getBiometricIcon()}
        </div>
        <p className="text-sm text-gray-600">
          Biometric authentication is not supported on this device
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <button
        onClick={handleBiometricAuth}
        disabled={isAuthenticating}
        className={`
          flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed
          transition-all duration-300 min-h-[120px] w-full
          ${authStatus === 'success'
            ? 'border-green-300 bg-green-50 text-green-700'
            : authStatus === 'error'
            ? 'border-red-300 bg-red-50 text-red-700'
            : isAuthenticating
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50'
          }
          ${isAuthenticating ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`mb-3 ${isAuthenticating ? 'animate-pulse' : ''}`}>
          {getBiometricIcon()}
        </div>

        <span className="text-sm font-medium">
          {isAuthenticating
            ? `${type === 'face' ? 'Scanning face...' : type === 'voice' ? 'Listening...' : 'Scanning fingerprint...'}`
            : authStatus === 'success'
            ? 'Authentication successful!'
            : authStatus === 'error'
            ? 'Authentication failed'
            : getBiometricLabel()
          }
        </span>

        {authStatus === 'idle' && (
          <span className="text-xs text-gray-500 mt-1">
            Touch to {mode === 'register' ? 'register' : 'authenticate'}
          </span>
        )}
      </button>

      {authStatus === 'error' && (
        <button
          onClick={() => {
            setAuthStatus('idle');
            setIsAuthenticating(false);
          }}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default BiometricAuth;