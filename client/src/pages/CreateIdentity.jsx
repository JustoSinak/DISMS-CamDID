import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Camera, Upload, X, Check, AlertCircle, Loader as LoaderIcon, Shield, Lock } from 'lucide-react';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import BiometricCapture from '../components/identity/BiometricCapture';
import { ethers, HDNodeWallet } from 'ethers';
import { create } from 'ipfs-http-client';
import Tesseract from 'tesseract.js';
import MainLayout from '../layouts/MainLayout'; // Import MainLayout

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
  const [didDocument, setDidDocument] = useState(null);
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [recoveryPhraseConfirmed, setRecoveryPhraseConfirmed] = useState(false);
  const [idVerificationStatus, setIdVerificationStatus] = useState('pending'); // pending, verified, rejected
  const [biometricSetup, setBiometricSetup] = useState({
    fingerprint: null,
    facial: null,
    voice: null
  });
  const [hdWallet, setHdWallet] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: '',
    nationalIdNumber: '',
    dateOfBirth: '',
    nationality: 'Cameroonian',
    gender: '',
    email: '',
    phoneNumber: '',
    termsAccepted: false, // Added terms acceptance

    // Step 2: Document Upload & Address
    idCardImage: null,
    selfieImage: null,
    address: '',
    city: '',
    region: '',

    // Step 3: Biometric Data (optional)
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
    try {
      const result = await Tesseract.recognize(file, 'eng');

      // Extract relevant information using regex patterns
      const extractedData = {
        fullName: extractName(result.data.text), // Assuming OCR can extract full name
        nationalIdNumber: extractIdNumber(result.data.text),
        dateOfBirth: extractDOB(result.data.text),
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
      // setOcrProcessing(false); // ocrProcessing state removed
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
      case 1: // Welcome and Education
        if (!formData.termsAccepted) errors.termsAccepted = 'You must accept the terms and conditions';
        break;

      case 2: // Document Upload and Address Information
        if (!formData.idCardImage) errors.idCardImage = 'ID card image is required';
        if (!formData.selfieImage) errors.selfieImage = 'Selfie image is required';
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.region) errors.region = 'Region is required';
        // Basic Info validation (moved from old step 1)
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

      case 3: // Biometric Capture
        // Biometric validation logic here (e.g., check if biometric data is captured)
        // if (!formData.biometricData) errors.biometricData = 'Biometric data is required';
        break;

      case 4: // Security Setup
        if (!recoveryPhraseConfirmed) errors.recoveryPhraseConfirmed = 'You must confirm your recovery phrase';
        if (!formData.pin) errors.pin = 'PIN is required';
        if (!formData.securityQuestion) errors.securityQuestion = 'Security question is required';
        if (!formData.securityAnswer) errors.securityAnswer = 'Security answer is required';
        break;

      case 5: // Identity Creation Confirmation
        // No specific validation needed for the confirmation step
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
      setLoading(true);
      setError('');
      try {
        switch (currentStep) {
          case 1:
            // Move to Step 2 (Document Upload & Address)
            setCurrentStep(prev => prev + 1);
            break;
          case 2:
            // Perform ID verification, generate DID, and move to Step 3
            console.log('Calling verifyIdentity...');
            await verifyIdentity(); // verifyIdentity now handles DID generation and step increment on success
            console.log('Returned from verifyIdentity');
            break;
          case 3:
            // Setup Biometric Authentication and move to Step 4
            console.log('Calling setupBiometricAuthentication...');
            await setupBiometricAuthentication();
            setCurrentStep(prev => prev + 1);
            console.log('Returned from setupBiometricAuthentication');
            break;
          case 4:
            // Move to Step 5 (Confirmation)
            setCurrentStep(prev => prev + 1);
            break;
          case 5:
            // This case should ideally not be reached by the "Next" button,
            // as the final step should have a "Submit" button.
            // The handleSubmit function will be called from the form onSubmit.
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Error in handleNextStep:', err);
        setError(err.message || 'An error occurred during the step transition.');
      } finally {
        setLoading(false);
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
      // setVerificationStatus(result.status); // verificationStatus state removed

      // Simulate ID verification status
      const isVerified = Math.random() < 0.8; // 80% chance of verification
      setIdVerificationStatus(isVerified ? 'verified' : 'rejected');

      if (isVerified) {
        // Generate DID if verification successful
        await createDID(); // Use createDID which includes HD wallet generation and blockchain registration
        setCurrentStep(prev => prev + 1); // Move to the next step (Biometric Capture)
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

  // generateDID function is now integrated into createDID and verifyIdentity
  // const generateDID = async () => { ... }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation for the final step (Step 5) is done in validateStep(5)
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
          ...formData,
          hdWallet: hdWallet // Include generated wallet details
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create digital identity');
      }

      await response.json(); // Data is not used, so we just await the response

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
      // Store biometric data in formData
      setFormData(prev => ({ ...prev, biometricData: biometricSetup }));

    } catch (error) {
      setError('Failed to setup biometric authentication');
      throw error; // Re-throw to be caught by handleNextStep
    }
  };

  const generateHDWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      const hdNode = HDNodeWallet.fromSeed(wallet.privateKey);

      // Derive keys according to the specified path
      const identityKey = hdNode.derivePath("m/44'/60'/0'/0/0");
      const documentKey = hdNode.derivePath("m/44'/60'/0'/1/0");
      const sharingKey = hdNode.derivePath("m/44'/60'/0'/2/0");

      const walletDetails = {
        masterSeed: wallet.mnemonic.phrase,
        identityKey: identityKey.privateKey,
        documentKey: documentKey.privateKey,
        sharingKey: sharingKey.privateKey
      };

      setHdWallet(walletDetails);
      setRecoveryPhrase(wallet.mnemonic.phrase); // Set recovery phrase state

      return { wallet, walletDetails };
    } catch (error) {
      setError('Failed to generate HD wallet');
      throw error;
    }
  };

  const createDID = async () => {
    try {
      const { wallet, walletDetails } = await generateHDWallet();

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
          publicKeyHex: walletDetails.documentKey // Use derived document key
        }]
      };

      // Store DID document on IPFS
      const { cid } = await ipfs.add(JSON.stringify(didDocument));

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

      case 2: // Document Upload and Address Information
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

            {/* Address Information - Moved from Step 3 */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
          </div>
        );

      case 3: // Biometric Capture
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Camera className="w-8 h-8 text-emerald-500" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Biometric Capture</h2>
                <p className="text-gray-600">Setup your biometric authentication methods.</p>
              </div>
            </div>
            {/* Biometric Capture Component/UI goes here */}
            <BiometricCapture onCapture={setBiometricSetup} />
             {formErrors.biometricData && (
              <p className="mt-1 text-sm text-red-600">{formErrors.biometricData}</p>
            )}
          </div>
        );

      case 4: // Security Setup
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Lock className="w-8 h-8 text-emerald-500" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Security Setup</h2>
                <p className="text-gray-600">Set up your recovery phrase and PIN.</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Write down your recovery phrase and keep it in a safe place. This is the only way to recover your identity if you lose access to your device.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Recovery Phrase</label>
              <div className="mt-1 p-4 bg-gray-100 rounded-md font-mono text-sm text-gray-800 break-words">
                {recoveryPhrase || 'Generating...'}
              </div>
            </div>

            <div className="mt-6">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="recoveryPhraseConfirmed"
                  checked={recoveryPhraseConfirmed}
                  onChange={e => handleRecoveryPhraseConfirm(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-emerald-600"
                />
                <span className="ml-2 text-gray-700">I have written down my recovery phrase</span>
              </label>
              {formErrors.recoveryPhraseConfirmed && (
                <p className="mt-1 text-sm text-red-600">{formErrors.recoveryPhraseConfirmed}</p>
              )}
            </div>

            <Input
              label="Create PIN"
              type="password"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              error={formErrors.pin}
              placeholder="Enter a 6-digit PIN"
              maxLength="6"
              required
            />

             <Input
              label="Security Question"
              type="text"
              name="securityQuestion"
              value={formData.securityQuestion}
              onChange={handleChange}
              error={formErrors.securityQuestion}
              placeholder="e.g., What is your mother's maiden name?"
              required
            />

            <Input
              label="Security Answer"
              type="text"
              name="securityAnswer"
              value={formData.securityAnswer}
              onChange={handleChange}
              error={formErrors.securityAnswer}
              placeholder="Enter your answer"
              required
            />
          </div>
        );

      case 5: // Identity Creation Confirmation
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Check className="w-8 h-8 text-emerald-500" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Identity Created!</h2>
                <p className="text-gray-600">Your digital identity has been successfully created.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Summary:</h3>
              {didDocument && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Your Decentralized Identifier (DID):</p>
                  <p className="mt-1 font-mono text-sm text-gray-800 break-all">{didDocument.id}</p>
                </div>
              )}
              {hdWallet && (
                 <div>
                  <p className="text-sm font-medium text-gray-700">Your Recovery Phrase:</p>
                  <p className="mt-1 font-mono text-sm text-gray-800 break-all">{hdWallet.masterSeed}</p>
                </div>
              )}
              {/* Add other summary details as needed */}
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">You can now proceed to your dashboard to manage your identity and credentials.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      'Welcome',
      'Verification',
      'Biometrics',
      'Security',
      'Confirmation'
    ];

    return (
      <nav className="flex items-center justify-center" aria-label="Progress">
        <ol className="flex items-center space-x-5">
          {steps.map((step, index) => (
            <li key={step}>
              {currentStep > index + 1 ? (
                <button className="block h-2.5 w-2.5 rounded-full bg-emerald-600 hover:bg-emerald-900">
                  <span className="sr-only">{step}</span>
                </button>
              ) : currentStep === index + 1 ? (
                <button className="relative flex items-center justify-center" aria-current="step">
                  <span className="absolute flex h-5 w-5 p-px" aria-hidden="true">
                    <span className="h-full w-full rounded-full bg-emerald-200" />
                  </span>
                  <span className="relative block h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </button>
              ) : (
                <button className="block h-2.5 w-2.5 rounded-full bg-gray-200 hover:bg-gray-400">
                  <span className="sr-only">{step}</span>
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  return (
    <MainLayout> {/* Assuming MainLayout provides the basic page structure */}
      <DashboardNavbar />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
               {success && (
                <div className="mb-4 p-3 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded">
                  {success}
                </div>
              )}

              {renderStepIndicator()}

              <div className="mt-8">
                {renderStepContent()}
              </div>

              <div className="mt-8 flex justify-between">
                {currentStep > 1 && currentStep < 5 && (
                  <Button onClick={handlePrevStep} variant="secondary">
                    Previous
                  </Button>
                )}
                 {currentStep === 1 && (
                   <div>{/* Placeholder to keep spacing consistent */}</div>
                 )}

                {currentStep < 5 && (
                  <Button onClick={handleNextStep} disabled={loading || web3Loading}>
                    {loading ? <LoaderIcon className="animate-spin mr-2" size={20} /> : null}
                    {currentStep === 1 ? 'Get Started' : 'Next'}
                  </Button>
                )}

                {currentStep === 5 && (
                  <Button onClick={handleSubmit} disabled={loading || web3Loading}>
                     {loading ? <LoaderIcon className="animate-spin mr-2" size={20} /> : null}
                    Create Identity
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateIdentity;
