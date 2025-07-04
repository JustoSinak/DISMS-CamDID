import React, { useState } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { Fingerprint, User } from 'lucide-react';
import { useIdentity } from '../../contexts/IdentityContext';

const BiometricCapture = ({ formData, onChange, onNext, onBack, currentStep, totalSteps }) => {
  const [biometricData, setBiometricData] = useState(null);
  const [biometricConsent, setBiometricConsent] = useState(formData.biometricConsent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { web3 } = useIdentity(); // Keep web3 for potential future use or if useIdentity has side effects

  const handleFingerprintCapture = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if WebAuthn is supported
      if (!('credentials' in navigator)) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Create a credential for fingerprint
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: 'DISMS CamDID',
            id: window.location.hostname
          },
          user: {
            id: new Uint8Array(16),
            name: formData.fullName,
            displayName: formData.fullName
          },
          pubKeyCredParams: [
            {
              type: 'public-key',
              alg: -7 // ES256
            }
          ],
          timeout: 60000,
          attestation: 'direct'
        }
      });

      // Convert credential to JSON
      const credentialData = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
        }
      };

      setBiometricData(credentialData);
      onChange('biometricData', credentialData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceCapture = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MediaDevices is supported
      if (!('mediaDevices' in navigator)) {
        throw new Error('Camera access is not supported in this browser');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // TODO: Implement face capture logic
      // This is a placeholder - you would need to integrate with a face recognition service
      
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextClick = () => {
    if (biometricConsent) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Biometric Capture</h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Biometric Data Collection</h3>
          <p className="mt-2 text-sm text-gray-500">
            We use biometric data to enhance security and provide a seamless verification experience.
            Your biometric data will be encrypted and stored securely.
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input
                id="biometric-consent"
                name="biometric-consent"
                type="checkbox"
                checked={biometricConsent}
                onChange={(e) => {
                  setBiometricConsent(e.target.checked);
                  onChange('biometricConsent', e.target.checked);
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="biometric-consent" className="ml-3 text-sm text-gray-600">
                I consent to collect and store my biometric data
              </label>
            </div>

            {biometricConsent && (
              <div className="space-y-4">
                <div>
                  <Fingerprint className="w-6 h-6 text-gray-400" />
                  <Button
                    onClick={handleFingerprintCapture}
                    loading={loading}
                    disabled={loading}
                  >
                    Capture Fingerprint
                  </Button>
                </div>

                <div>
                  {/* Replaced FaceId icon with User icon */}
                  <User className="w-6 h-6 text-gray-400" />
                  <Button
                    onClick={handleFaceCapture}
                    loading={loading}
                    disabled={loading}
                  >
                    Capture Face
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert type="error" message={error} />
          )}
        </div>
      </div>

      <div className="flex justify-between space-x-4">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={!biometricConsent}
        >
          Next
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

export default BiometricCapture;
