import React from 'react';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Loader } from '../common/Loader';
import { Check, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useIdentity } from '../../contexts/IdentityContext';

const IdentityPreview = ({ formData, onNext, onBack, currentStep, totalSteps }) => {
  const { loading, error, createIdentity } = useIdentity();
  const [qrCode, setQrCode] = useState(null);

  const generateQRCode = () => {
    const identityData = {
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      placeOfBirth: formData.placeOfBirth,
      nationality: formData.nationality,
      gender: formData.gender,
      address: formData.address,
      city: formData.city,
      region: formData.region,
      idCardImage: formData.idCardImage,
      selfieImage: formData.selfieImage,
      biometricConsent: formData.biometricConsent,
      biometricData: formData.biometricData
    };

    // Generate a unique identifier for the identity
    const identityId = btoa(JSON.stringify(identityData));
    setQrCode(identityId);
  };

  const handleSubmit = async () => {
    try {
      await createIdentity(formData);
    } catch (err) {
      console.error('Identity creation failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Preview & Submit</h2>

      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identity Information</h3>
          
          <div className="space-y-4">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Full Name</h4>
                <p className="text-gray-600">{formData.fullName}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Date of Birth</h4>
                <p className="text-gray-600">{formData.dateOfBirth}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Nationality</h4>
                <p className="text-gray-600">{formData.nationality}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Gender</h4>
                <p className="text-gray-600">{formData.gender}</p>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="font-medium text-gray-700">Address</h4>
              <p className="text-gray-600">{formData.address}</p>
              <p className="text-gray-600">{formData.city}, {formData.region}</p>
            </div>

            {/* Document Uploads */}
            <div>
              <h4 className="font-medium text-gray-700">Documents</h4>
              <div className="mt-2 space-y-2">
                {formData.idCardImage && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span>ID Card uploaded</span>
                  </div>
                )}
                {formData.selfieImage && (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span>Selfie uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Biometric Data */}
            <div>
              <h4 className="font-medium text-gray-700">Biometric Data</h4>
              <div className="mt-2 space-y-2">
                {formData.biometricConsent ? (
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-2" />
                    <span>Biometric data consented</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <X className="w-4 h-4 mr-2" />
                    <span>Biometric data not consented</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Identity QR Code</h3>
          {qrCode ? (
            <div className="flex justify-center">
              <QRCodeSVG
                value={qrCode}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          ) : (
            <Button
              onClick={generateQRCode}
              className="w-full"
            >
              Generate QR Code
            </Button>
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
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          Submit Identity
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} />
      )}

      <div className="mt-4 text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

export default IdentityPreview;
