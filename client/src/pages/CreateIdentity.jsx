import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Camera, Upload, X, Check, AlertCircle, Loader as LoaderIcon } from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

const CreateIdentity = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { web3, account, loading: web3Loading, error: web3Error } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [didDocument, setDidDocument] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    nationalIdNumber: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Cameroonian',
    gender: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    
    // Step 2: Document Upload
    idCardImage: null,
    selfieImage: null,
    
    // Step 3: Address Information
    address: '',
    city: '',
    region: '',
    
    // Step 4: Biometric Data (optional)
    biometricConsent: false,
    biometricData: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [previewIdCard, setPreviewIdCard] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (web3Error) {
      setError(web3Error);
    }
  }, [web3Error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          [type]: 'Image size should be less than 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'idCardImage') {
          setPreviewIdCard(reader.result);
          setFormData(prev => ({ ...prev, idCardImage: file }));
        } else if (type === 'selfieImage') {
          setPreviewSelfie(reader.result);
          setFormData(prev => ({ ...prev, selfieImage: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.fullName) errors.fullName = 'Full name is required';
        if (!formData.nationalIdNumber) {
          errors.nationalIdNumber = 'National ID number is required';
        } else if (!/^\d{9}$/.test(formData.nationalIdNumber)) {
          errors.nationalIdNumber = 'Invalid National ID number format';
        }
        if (!formData.dateOfBirth) {
          errors.dateOfBirth = 'Date of birth is required';
        } else {
          const dob = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          if (age < 18) {
            errors.dateOfBirth = 'You must be at least 18 years old';
          }
        }
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.phoneNumber) {
          errors.phoneNumber = 'Phone number is required';
        } else if (!/^(\+237|237)?[6-9][0-9]{8}$/.test(formData.phoneNumber)) {
          errors.phoneNumber = 'Invalid Cameroon phone number';
        }
        break;

      case 2:
        if (!formData.idCardImage) errors.idCardImage = 'ID card image is required';
        if (!formData.selfieImage) errors.selfieImage = 'Selfie image is required';
        break;

      case 3:
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.region) errors.region = 'Region is required';
        break;

      default:
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Perform ID verification before proceeding
        await verifyIdentity();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const verifyIdentity = async () => {
    setLoading(true);
    setError('');
    try {
      // Call to backend verification service
      const verificationData = new FormData();
      verificationData.append('nationalIdNumber', formData.nationalIdNumber);
      verificationData.append('fullName', formData.fullName);
      verificationData.append('dateOfBirth', formData.dateOfBirth);
      verificationData.append('idCardImage', formData.idCardImage);
      verificationData.append('selfieImage', formData.selfieImage);

      const response = await fetch('/api/identity/verify', {
        method: 'POST',
        body: verificationData,
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Identity verification failed');
      }

      const result = await response.json();
      setVerificationStatus(result.status);
      
      if (result.status === 'verified') {
        // Generate DID if verification successful
        await generateDID();
        setCurrentStep(prev => prev + 1);
      } else {
        setError('Identity verification failed. Please ensure your documents are valid and clear.');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify identity');
    } finally {
      setLoading(false);
    }
  };

  const generateDID = async () => {
    try {
      const response = await fetch('/api/identity/generate-did', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          walletAddress: account,
          nationalIdNumber: formData.nationalIdNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate DID');
      }

      const result = await response.json();
      setDidDocument(result.didDocument);
    } catch (err) {
      setError(err.message || 'Failed to generate DID');
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    if (!web3 || !account) {
      setError('Web3 connection not available. Please ensure MetaMask is connected.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create and sign the Verifiable Credential
      const response = await fetch('/api/identity/create-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          did: didDocument.id,
          walletAddress: account,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create digital identity');
      }

      const data = await response.json();

      setSuccess('Digital identity created successfully! Your credential has been issued to your wallet. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create digital identity');
    } finally {
      setLoading(false);
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
              onChange={handleChange}
              error={formErrors.fullName}
              placeholder="Enter your full name"
              required
            />
            <Input
              label="National ID Number"
              type="text"
              name="nationalIdNumber"
              value={formData.nationalIdNumber}
              onChange={handleChange}
              error={formErrors.nationalIdNumber}
              placeholder="Enter your ID number"
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={formErrors.dateOfBirth}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              placeholder="Enter your email"
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={formErrors.phoneNumber}
              placeholder="e.g., 237612345678"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.gender ? 'border-red-300' : 'border-gray-300'
                } focus:ring-emerald-500 focus:border-emerald-500`}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formErrors.gender && (
                <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'idCardImage')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {formErrors.idCardImage && (
                <p className="mt-1 text-sm text-red-600">{formErrors.idCardImage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Take a Selfie
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
                          <span>Take a selfie</span>
                          <input
                            type="file"
                            name="selfieImage"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'selfieImage')}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {formErrors.selfieImage && (
                <p className="mt-1 text-sm text-red-600">{formErrors.selfieImage}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={formErrors.address}
              placeholder="Enter your address"
              required
            />
            <Input
              label="City"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={formErrors.city}
              placeholder="Enter your city"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.region ? 'border-red-300' : 'border-gray-300'
                } focus:ring-emerald-500 focus:border-emerald-500`}
                required
              >
                <option value="">Select region</option>
                <option value="Adamawa">Adamawa</option>
                <option value="Centre">Centre</option>
                <option value="East">East</option>
                <option value="Far North">Far North</option>
                <option value="Littoral">Littoral</option>
                <option value="North">North</option>
                <option value="Northwest">Northwest</option>
                <option value="South">South</option>
                <option value="Southwest">Southwest</option>
                <option value="West">West</option>
              </select>
              {formErrors.region && (
                <p className="mt-1 text-sm text-red-600">{formErrors.region}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Identity Verification Status</h3>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-blue-700">Your identity has been successfully verified</span>
              </div>
            </div>

            {didDocument && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Decentralized Identifier (DID)</h3>
                <p className="text-sm text-gray-600 break-all font-mono">{didDocument.id}</p>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-emerald-900 mb-2">Final Confirmation</h3>
              <p className="text-sm text-emerald-700">
                Your digital identity is ready to be created. Click the button below to generate your
                Verifiable Credential and store it in your wallet.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Create Your Digital Identity</h1>
              <p className="mt-2 text-gray-600">
                Follow the steps below to create your secure digital identity
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mt-8">
              <div className="flex justify-between items-center">
                {['Personal Info', 'Document Upload', 'Address', 'Confirmation'].map((step, index) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center ${
                      index < currentStep
                        ? 'text-emerald-600'
                        : index === currentStep - 1
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        index < currentStep
                          ? 'bg-emerald-100 text-emerald-600'
                          : index === currentStep - 1
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="mt-2 text-sm font-medium">{step}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-2">
                <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200">
                  <div
                    className="absolute h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {(error || web3Error) && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error || web3Error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
              <Check className="w-5 h-5 mr-2" />
              {success}
            </div>
          )}

          {web3Loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader />
              <span className="ml-2 text-gray-600">Connecting to Web3...</span>
            </div>
          ) : (
            <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                )}
                <div className="ml-auto">
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Verifying...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Creating Identity...
                        </>
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
          )}
        </Card>
      </div>
    </>
  );
};

export default CreateIdentity;
