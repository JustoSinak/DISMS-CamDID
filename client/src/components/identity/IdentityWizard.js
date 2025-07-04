import React, { useState, useEffect } from 'react';
import { useIdentity } from '../../contexts/IdentityContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';
import BasicInfo from './BasicInfo';
import DocumentUpload from './DocumentUpload';
import BiometricCapture from './BiometricCapture';
import IdentityPreview from './IdentityPreview';

const IdentityWizard = () => {
  const { createIdentity, loading, error } = useIdentity();
  const { user } = useAuth();
  const { account } = useWeb3();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    gender: '',
    email: '',
    phoneNumber: '',
    
    // Document Upload
    idCardImage: null,
    selfieImage: null,
    
    // Address
    address: '',
    city: '',
    region: '',
    
    // Biometric
    biometricConsent: false,
    biometricData: null,
  });

  const steps = [
    { title: 'Basic Information', component: BasicInfo },
    { title: 'Document Upload', component: DocumentUpload },
    { title: 'Biometric Capture', component: BiometricCapture },
    { title: 'Preview & Submit', component: IdentityPreview },
  ];

  const StepComponent = steps[currentStep - 1].component;

  const handleNext = async () => {
    if (currentStep === steps.length) {
      try {
        await createIdentity(formData);
        // After successful identity creation, navigate to dashboard
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Identity creation failed:', err);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${
              index < currentStep - 1 ? 'text-green-500' : 
              index === currentStep - 1 ? 'text-blue-500' : 
              'text-gray-400'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-current">
              {index < currentStep - 1 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-3">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <StepComponent
        formData={formData}
        onChange={handleChange}
        onNext={handleNext}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={steps.length}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Creating identity...
        </div>
      )}
    </div>
  );
};

export default IdentityWizard;
