// client/src/components/credentials/SelectiveDisclosure.jsx - Selective disclosure component
import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const SelectiveDisclosure = ({ 
  credential, 
  verifierRequest, 
  onApprove, 
  onReject,
  className = ''
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState(new Set());
  const [proofGeneration, setProofGeneration] = useState(false);
  const [attributeDetails, setAttributeDetails] = useState({});
  const [privacyLevel, setPrivacyLevel] = useState('standard');

  useEffect(() => {
    if (verifierRequest?.requestedAttributes) {
      // Pre-select requested attributes
      setSelectedAttributes(new Set(verifierRequest.requestedAttributes));
    }
    
    // Load attribute details
    loadAttributeDetails();
  }, [verifierRequest, credential]);

  const loadAttributeDetails = () => {
    if (!credential?.data) return;

    const details = {};
    Object.keys(credential.data).forEach(attr => {
      details[attr] = {
        sensitive: getSensitivityLevel(attr),
        description: getAttributeDescription(attr),
        required: verifierRequest?.requestedAttributes?.includes(attr) || false
      };
    });
    
    setAttributeDetails(details);
  };

  const getSensitivityLevel = (attribute) => {
    const highSensitive = ['ssn', 'nationalId', 'passport', 'driverLicense', 'bankAccount'];
    const mediumSensitive = ['dateOfBirth', 'address', 'phone', 'email'];
    
    if (highSensitive.some(sensitive => attribute.toLowerCase().includes(sensitive.toLowerCase()))) {
      return 'high';
    }
    if (mediumSensitive.some(sensitive => attribute.toLowerCase().includes(sensitive.toLowerCase()))) {
      return 'medium';
    }
    return 'low';
  };

  const getAttributeDescription = (attribute) => {
    const descriptions = {
      firstName: 'Your first name',
      lastName: 'Your last name',
      dateOfBirth: 'Your date of birth',
      address: 'Your residential address',
      email: 'Your email address',
      phone: 'Your phone number',
      nationalId: 'Your national ID number',
      passport: 'Your passport number',
      driverLicense: 'Your driver\'s license number',
      // Add more descriptions as needed
    };
    
    return descriptions[attribute] || `Your ${attribute.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  };

  const getSensitivityColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const handleAttributeToggle = (attribute) => {
    const newSelected = new Set(selectedAttributes);
    
    if (newSelected.has(attribute)) {
      // Don't allow deselecting required attributes
      if (attributeDetails[attribute]?.required) {
        toast.warning('This attribute is required by the verifier');
        return;
      }
      newSelected.delete(attribute);
    } else {
      newSelected.add(attribute);
    }
    
    setSelectedAttributes(newSelected);
  };

  const generateSelectiveDisclosureProof = async () => {
    if (selectedAttributes.size === 0) {
      toast.error('Please select at least one attribute to disclose');
      return;
    }

    setProofGeneration(true);
    
    try {
      const response = await fetch('/api/sharing/selective-disclosure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          credentialId: credential._id,
          disclosureRequest: {
            attributes: Array.from(selectedAttributes),
            predicates: [], // Can be extended for range proofs, etc.
            privacyLevel
          },
          verifierDid: verifierRequest?.verifierDid
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (onApprove) {
          onApprove({
            proof: data.proof,
            revealedAttributes: Array.from(selectedAttributes),
            privacyLevel
          });
        }
        
        toast.success('Selective disclosure proof generated successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to generate proof');
      }
    } catch (error) {
      console.error('Proof generation error:', error);
      toast.error('Error generating selective disclosure proof');
    } finally {
      setProofGeneration(false);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject('User declined to share attributes');
    }
  };

  if (!credential) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-500">No credential selected</p>
      </div>
    );
  }

  const availableAttributes = Object.keys(credential.data || {});

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <ShieldCheckIcon className="w-8 h-8 text-emerald-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Selective Disclosure</h3>
            <p className="text-sm text-gray-600">Choose which attributes to share while keeping others private</p>
          </div>
        </div>
      </div>

      {/* Verifier Request Info */}
      {verifierRequest && (
        <div className="p-6 bg-blue-50 border-b border-gray-200">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Verification Request</h4>
              <p className="text-sm text-blue-700 mt-1">
                <strong>{verifierRequest.requesterName || 'Unknown Verifier'}</strong> is requesting access to your credential
              </p>
              {verifierRequest.purpose && (
                <p className="text-sm text-blue-600 mt-1">
                  Purpose: {verifierRequest.purpose}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Level Selection */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Privacy Level</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'minimal', label: 'Minimal', description: 'Share only essential attributes' },
            { value: 'standard', label: 'Standard', description: 'Balanced privacy and functionality' },
            { value: 'full', label: 'Full', description: 'Share all requested attributes' }
          ].map((level) => (
            <label key={level.value} className="relative">
              <input
                type="radio"
                name="privacyLevel"
                value={level.value}
                checked={privacyLevel === level.value}
                onChange={(e) => setPrivacyLevel(e.target.value)}
                className="sr-only"
              />
              <div className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                privacyLevel === level.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-sm font-medium text-gray-900">{level.label}</div>
                <div className="text-xs text-gray-500 mt-1">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Attribute Selection */}
      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Select Attributes to Share</h4>
        
        {availableAttributes.length > 0 ? (
          <div className="space-y-3">
            {availableAttributes.map((attribute) => {
              const details = attributeDetails[attribute] || {};
              const isSelected = selectedAttributes.has(attribute);
              const isRequired = details.required;
              const sensitivity = details.sensitive || 'low';
              
              return (
                <div
                  key={attribute}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    isSelected 
                      ? 'border-emerald-300 bg-emerald-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAttributeToggle(attribute)}
                        disabled={isRequired}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {attribute.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          {isRequired && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Required
                            </span>
                          )}
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getSensitivityColor(sensitivity)}`}>
                            {sensitivity} sensitivity
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{details.description}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Value: {String(credential.data[attribute]).substring(0, 50)}
                          {String(credential.data[attribute]).length > 50 ? '...' : ''}
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="ml-4">
                    {isSelected ? (
                      <EyeIcon className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No attributes available in this credential</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={generateSelectiveDisclosureProof}
            disabled={proofGeneration || selectedAttributes.size === 0}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {proofGeneration ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Proof...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Generate Proof & Share
              </>
            )}
          </button>
          
          <button
            onClick={handleReject}
            disabled={proofGeneration}
            className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Decline Request
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Selected {selectedAttributes.size} of {availableAttributes.length} attributes
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectiveDisclosure;
