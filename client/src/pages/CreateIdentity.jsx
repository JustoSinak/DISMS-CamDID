import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Camera, Upload, X, Check, AlertCircle, Loader as LoaderIcon, Shield, Key, Lock } from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import BiometricCapture from '../components/identity/BiometricCapture';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import Tesseract from 'tesseract.js';

// Initialize IPFS client
const ipfs = create({ url: process.env.REACT_APP_IPFS_URL });

// Helper functions for OCR text extraction
const extractName = (text) => {
  // Look for patterns like "Name: John Doe" or "Full Name: John Doe"
  const nameMatch = text.match(/(?:Name|Full Name):\s*([A-Za-z\s]+)/i);
  return nameMatch ? nameMatch[1].trim() : null;
};

const extractIdNumber = (text) => {
  // Look for patterns like "ID: 123456789" or "ID Number: 123456789"
  const idMatch = text.match(/(?:ID|ID Number):\s*(\d{9})/i);
  return idMatch ? idMatch[1].trim() : null;
};

const extractDOB = (text) => {
  // Look for patterns like "DOB: 01/01/1990" or "Date of Birth: 01/01/1990"
  const dobMatch = text.match(/(?:DOB|Date of Birth):\s*(\d{2}\/\d{2}\/\d{4})/i);
  return dobMatch ? dobMatch[1].trim() : null;
};

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
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [recoveryPhraseConfirmed, setRecoveryPhraseConfirmed] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [idVerificationStatus, setIdVerificationStatus] = useState('pending'); // pending, verified, rejected
  const [biometricSetup, setBiometricSetup] = useState({
    fingerprint: null,
    facial: null,
    voice: null
  });
  const [contactVerification, setContactVerification] = useState({
    email: { verified: false, code: '' },
    phone: { verified: false, code: '' }
  });
  const [hdWallet, setHdWallet] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    nationalIdNumber: '',
    dateOfBirth: '',
    nationality: 'Cameroonian',
    gender: '',
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

    // Step 4: Security Setup
    pin: '',
    securityQuestion: '',
    securityAnswer: '',
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

  const handleRecoveryPhraseConfirm = (confirmed) => {
    setRecoveryPhraseConfirmed(confirmed);
    if (confirmed) {
      setFormErrors(prev => ({ ...prev, recoveryPhraseConfirmed: '' }));
    }
  };

  const processDocumentWithOCR = async (file) => {
    setOcrProcessing(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      setOcrResult(result.data.text);
      
      // Extract relevant information using regex patterns
      const extractedData = {
        name: extractName(result.data.text),
        idNumber: extractIdNumber(result.data.text),
        dob: extractDOB(result.data.text),
        // Add more extraction patterns as needed
      };
      
      // Update form data with extracted information
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }));
    } catch (error) {
      setError('Failed to process document with OCR');
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          [type]: 'Image size should be less than 5MB'
        }));
        return;
      }

      if (type === 'idCardImage') {
        await processDocumentWithOCR(file);
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
    console.log('handleNextStep called, currentStep:', currentStep);
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Perform ID verification before proceeding
        console.log('Calling verifyIdentity...');
        try {
          await verifyIdentity();
          console.log('Returned from verifyIdentity');
        } catch (err) {
          console.error('Error in verifyIdentity:', err);
          setError('Verification failed. Please try again.');
          return; // prevent further step increment on error
        }
        return; // prevent step increment here, as verifyIdentity handles it
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      console.log('Validation failed for step:', currentStep);
    }
  };

  const verifyIdentity = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('verifyIdentity started with formData:', formData);
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
      console.log('verifyIdentity result:', result);
      setVerificationStatus(result.status);

      // Simulate ID verification status
      const isVerified = Math.random() < 0.8; // 80% chance of verification
      setIdVerificationStatus(isVerified ? 'verified' : 'rejected');
      
      if (isVerified) {
        // Generate DID if verification successful
        await generateDID();
        setCurrentStep(prev => prev + 1);
      } else {
        setError('Identity verification failed. Please ensure your documents are valid and clear.');
      }
    } catch (err) {
      console.error('verifyIdentity error:', err);
      setError(err.message || 'Failed to verify identity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
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

  const setupBiometricAuthentication = async () => {
    try {
      // Fingerprint capture
      if (navigator.credentials && window.PublicKeyCredential) {
        const fingerprint = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "CamDID" },
            user: {
              id: new Uint8Array(16),
              name: formData.fullName,
              displayName: formData.fullName
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }]
          }
        });
        setBiometricSetup(prev => ({ ...prev, fingerprint }));
      }

      // Facial recognition setup
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        const frame = await imageCapture.grabFrame();
        setBiometricSetup(prev => ({ ...prev, facial: frame }));
      }

      // Voice pattern setup (optional)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        // Process audio data for voice pattern
        setBiometricSetup(prev => ({ ...prev, voice: 'voice_pattern_data' }));
      }
    } catch (error) {
      setError('Failed to setup biometric authentication');
    }
  };

  const verifyContact = async (type) => {
    try {
      const response = await fetch(`/api/verify/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          [type]: formData[type]
        })
      });

      if (!response.ok) throw new Error(`Failed to send ${type} verification code`);

      const { code } = await response.json();
      setContactVerification(prev => ({
        ...prev,
        [type]: { ...prev[type], code }
      }));
    } catch (error) {
      setError(`Failed to verify ${type}`);
    }
  };

  const generateHDWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      const hdNode = ethers.utils.HDNode.fromSeed(wallet.privateKey);
      
      // Derive keys according to the specified path
      const identityKey = hdNode.derivePath("m/44'/60'/0'/0/0");
      const documentKey = hdNode.derivePath("m/44'/60'/0'/1/0");
      const sharingKey = hdNode.derivePath("m/44'/60'/0'/2/0");

      setHdWallet({
        masterSeed: wallet.mnemonic.phrase,
        identityKey: identityKey.privateKey,
        documentKey: documentKey.privateKey,
        sharingKey: sharingKey.privateKey
      });

      return wallet;
    } catch (error) {
      setError('Failed to generate HD wallet');
      throw error;
    }
  };

  const createDID = async () => {
    try {
      const wallet = await generateHDWallet();
      
      // Create DID document
      const didDocument = {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: `did:camdid:ethereum:${wallet.address}`,
        controller: wallet.address,
        verificationMethod: [{
          id: `${wallet.address}#keys-1`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: wallet.address,
          publicKeyHex: wallet.publicKey
        }],
        authentication: [`${wallet.address}#keys-1`],
        assertionMethod: [`${wallet.address}#keys-1`],
        keyAgreement: [{
          id: `${wallet.address}#keys-2`,
          type: 'X25519KeyAgreementKey2019',
          controller: wallet.address,
          publicKeyHex: hdWallet.documentKey
        }]
      };

      // Store DID document on IPFS
      const { cid } = await ipfs.add(JSON.stringify(didDocument));
      setIpfsHash(cid.toString());

      // Store DID on blockchain
      const response = await fetch('/api/identity/register-did', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          did: didDocument.id,
          ipfsHash: cid.toString(),
          walletAddress: wallet.address
        })
      });

      if (!response.ok) throw new Error('Failed to register DID on blockchain');

      setDidDocument(didDocument);
      return didDocument;
    } catch (error) {
      setError('Failed to create DID');
      throw error;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Shield className="w-8 h-8 text-emerald-500" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Welcome to CamDID</h2>
                <p className="text-gray-600">Create your secure digital identity</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll need:</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-emerald-500 mr-2" />
                  <span>Valid government ID (National ID or Passport)</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-emerald-500 mr-2" />
                  <span>Device with camera for biometric setup</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-emerald-500 mr-2" />
                  <span>Active email and phone number</span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted || false}
                  onChange={e => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-emerald-600"
                />
                <span className="ml-2 text-gray-700">I accept the terms and conditions</span>
              </label>
              {formErrors.termsAccepted && (
                <p className="mt-1 text-sm text-red-600">{formErrors.termsAccepted}</p>
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
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${formData.idCardImage ? 'border-emerald-300' : 'border-gray-300'} border-dashed rounded-md relative cursor-pointer transition-colors duration-200 ease-in-out hover:border-emerald-400`}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  handleImageChange({ target: { files: [file] } }, 'idCardImage');
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-emerald-400');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-emerald-400');
                }}
              >
                <div className="space-y-1 text-center">
                  {previewIdCard ? (
                    <div className="relative">
                      <img
                        src={previewIdCard}
                        alt="ID Card Preview"
                        className="mx-auto h-32 w-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewIdCard(null);
                            setFormData(prev => ({ ...prev, idCardImage: null }));
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {formData.idCardImage && (
                        <div className="mt-2 flex items-center justify-center space-x-2">
                          <Check className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-emerald-600">Document uploaded successfully</span>
                        </div>
                      )}
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
              {idVerificationStatus === 'pending' && (
                <div className="mt-4 text-gray-600">Verifying identity...</div>
              )}
              {idVerificationStatus === 'verified' && (
                <div className="mt-4 text-emerald-600">Identity verified successfully!</div>
              )}
              {idVerificationStatus === 'rejected' && (
                <div className="mt-4 text-red-600">Identity verification failed. Please ensure your documents are valid and clear.</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Take a Selfie
              </label>
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${formData.selfieImage ? 'border-emerald-300' : 'border-gray-300'} border-dashed rounded-md relative cursor-pointer transition-colors duration-200 ease-in-out hover:border-emerald-400`}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  handleImageChange({ target: { files: [file] } }, 'selfieImage');
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-emerald-400');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-emerald-400');
                }}
              >
                <div className="space-y-1 text-center">
                  {previewSelfie ? (
                    <div className="relative">
                      <img
                        src={previewSelfie}
                        alt="Selfie Preview"
                        className="mx-auto h-32 w-auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSelfie(null);
                            setFormData(prev => ({ ...prev, selfieImage: null }));
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {formData.selfieImage && (
                        <div className="mt-2 flex items-center justify-center space-x-2">
                          <Check className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm text-emerald-600">Selfie uploaded successfully</span>
                        </div>
                      )}
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
                            capture="user"
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
            <div className="flex items-center space-x-4 mb-6">
              <Key className="w-8 h-8 text-emerald-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Biometric Setup</h3>
                <p className="text-gray-600">Setup your biometric authentication</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                Click the button below to simulate biometric capture.
              </p>
              <Button
                type="button"
                className="mt-2"
                onClick={() => {
                  // Generate random biometric data for simulation purposes
                  const randomData = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                  setFormData(prev => ({ ...prev, biometricData: randomData }));
                }}
              >
                Simulate Biometric Capture
              </Button>
              {formData.biometricData && (
                <p className="mt-2 text-sm text-gray-600">Biometric Data: {formData.biometricData}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Key className="w-8 h-8 text-emerald-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Security Setup</h3>
                <p className="text-gray-600">Generate your recovery phrase and security keys</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                Please write down your 12-word recovery phrase and keep it in a safe place. This phrase is the only way to recover your identity if you lose access to your device.
              </p>
              <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-gray-800">
                {hdWallet?.masterSeed || '************'}
              </div>
              <Button
                type="button"
                className="mt-2"
                onClick={generateHDWallet}
              >
                Generate Recovery Phrase
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Identity Key</h4>
                <p className="text-sm text-gray-600 break-all font-mono">
                  {hdWallet?.identityKey ? `${hdWallet.identityKey.slice(0, 10)}...` : 'Not generated'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Document Key</h4>
                <p className="text-sm text-gray-600 break-all font-mono">
                  {hdWallet?.documentKey ? `${hdWallet.documentKey.slice(0, 10)}...` : 'Not generated'}
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Lock className="w-8 h-8 text-emerald-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">DID Creation</h3>
                <p className="text-gray-600">Your decentralized identifier is being created</p>
              </div>
            </div>

            {didDocument && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Decentralized Identifier (DID)</h4>
                <p className="text-sm text-gray-600 break-all font-mono">{didDocument.id}</p>
                <p className="mt-2 text-sm text-gray-500">IPFS Hash: {ipfsHash}</p>
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-900 mb-2">Final Confirmation</h4>
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
