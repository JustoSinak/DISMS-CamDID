import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

const BasicInfo = ({ formData, onChange, onNext, onBack, currentStep, totalSteps }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});;

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleNextClick = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
      
      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          onBlur={() => handleBlur('fullName')}
          error={touched.fullName && errors.fullName}
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          onBlur={() => handleBlur('dateOfBirth')}
          error={touched.dateOfBirth && errors.dateOfBirth}
          required
        />

        <Input
          label="Place of Birth"
          type="text"
          value={formData.placeOfBirth}
          onChange={(e) => onChange('placeOfBirth', e.target.value)}
        />

        <Select
          label="Nationality"
          value={formData.nationality}
          onChange={(e) => onChange('nationality', e.target.value)}
          onBlur={() => handleBlur('nationality')}
          error={touched.nationality && errors.nationality}
          required
          options={[
            { value: 'Cameroonian', label: 'Cameroonian' },
            { value: 'Other', label: 'Other' }
          ]}
        />

        <Select
          label="Gender"
          value={formData.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          onBlur={() => handleBlur('gender')}
          error={touched.gender && errors.gender}
          required
          options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' }
          ]}
        />
      </div>

      <div className="flex justify-between space-x-4">
        <Button
          variant="secondary"
          onClick={onBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={!validate()}
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

export default BasicInfo;
