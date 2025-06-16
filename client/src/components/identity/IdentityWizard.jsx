import React, { useState } from 'react';
import { useIdentity } from '../../contexts/IdentityContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { LoaderIcon } from '../../components/common/LoaderIcon';
import { 
  User, 
  Shield, 
  CreditCard, 
  FileText, 
  Eye, 
  Edit2, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Upload,
  Camera,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const IdentityWizard = () => {
  const { account } = useWeb3();
  const { createIdentity, loading, error } = useIdentity();
  const [formData, setFormData] = useState({
    fullName: '',
    nationalIdNumber: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    region: '',
    idCardImage: null,
    selfieImage: null
  });
  const [previewIdCard, setPreviewIdCard] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState('');
  const [walletError, setWalletError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'idCardImage') {
          setPreviewIdCard(reader.result);
          setFormData(prev => ({ ...prev, idCardImage: file }));
        } else {
          setPreviewSelfie(reader.result);
          setFormData(prev => ({ ...prev, selfieImage: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!account) {
      setWalletError('Please connect your wallet first');
      return;
    }

    try {
      const credentialData = {
        id: `did:sol:${account}`,
        type: ['VerifiableCredential', 'NationalIDCredential'],
        issuer: account,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: `did:sol:${account}`,
          fullName: formData.fullName,
          nationalIdNumber: formData.nationalIdNumber,
          dateOfBirth: formData.dateOfBirth,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          idCardImage: formData.idCardImage,
          selfieImage: formData.selfieImage
        }
      };

      await createIdentity(credentialData);
      setSuccess('Identity created successfully!');
    } catch (err) {
      console.error('Identity creation error:', err);
      setSuccess('Failed to create identity');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
            <Input
              label="National ID Number"
              type="text"
              name="nationalIdNumber"
              value={formData.nationalIdNumber}
              onChange={handleInputChange}
              placeholder="Enter your ID number"
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="e.g., 237612345678"
              required
            />
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              required
            />
            <Input
              label="City"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              required
            />
            <Input
              label="Region"
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="Enter your region"
              required
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload ID Card Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewIdCard ? (
                    <div className="relative">
                      <img
                        src={previewIdCard}
                        alt="ID Card Preview"
                        className="mx-auto h-32 w-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewIdCard(null);
                          setFormData(prev => ({ ...prev, idCardImage: null }));
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                          <span>Upload ID card</span>
                          <input
                            type="file"
                            name="idCardImage"
                            onChange={(e) => handleImageChange(e, 'idCardImage')}
                            className="sr-only"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Selfie
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewSelfie ? (
                    <div className="relative">
                      <img
                        src={previewSelfie}
                        alt="Selfie Preview"
                        className="mx-auto h-32 w-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSelfie(null);
                          setFormData(prev => ({ ...prev, selfieImage: null }));
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                          <span>Upload selfie</span>
                          <input
                            type="file"
                            name="selfieImage"
                            onChange={(e) => handleImageChange(e, 'selfieImage')}
                            className="sr-only"
                            accept="image/*"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {walletError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {walletError}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Digital Identity</h2>
        <p className="mt-2 text-sm text-gray-500">
          Please fill in your personal information to create your digital identity
        </p>
      </div>

      <Card>
        {renderStepContent()}

        <div className="mt-6 flex justify-between">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!formData.fullName || !formData.nationalIdNumber}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.idCardImage || !formData.selfieImage}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Creating Identity...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Create Identity
                </>
              )}
            </Button>
          )}
                ) : (
                  <>
                    <Check className="-ml-1 mr-3 h-5 w-5" />
                    Create Digital Identity
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default IdentityWizard;
