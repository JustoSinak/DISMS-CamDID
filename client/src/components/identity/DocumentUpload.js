import React, { useState, useRef } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Camera, Upload, X, Check } from 'lucide-react';

const DocumentUpload = ({ formData, onChange, onNext, onBack, currentStep, totalSteps }) => {
  const [errors, setErrors] = useState({});
  const [previewIdCard, setPreviewIdCard] = useState(formData.idCardImage ? URL.createObjectURL(formData.idCardImage) : null);
  const [previewSelfie, setPreviewSelfie] = useState(formData.selfieImage ? URL.createObjectURL(formData.selfieImage) : null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.idCardImage) newErrors.idCardImage = 'ID card is required';
    if (!formData.selfieImage) newErrors.selfieImage = 'Selfie is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type]: 'File size should be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'idCardImage') {
        setPreviewIdCard(reader.result);
        onChange('idCardImage', file);
      } else if (type === 'selfieImage') {
        setPreviewSelfie(reader.result);
        onChange('selfieImage', file);
      }
      setErrors(prev => ({ ...prev, [type]: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleNextClick = () => {
    if (validate()) {
      onNext();
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'idCardImage') {
      setPreviewIdCard(null);
      onChange('idCardImage', null);
    } else if (type === 'selfieImage') {
      setPreviewSelfie(null);
      onChange('selfieImage', null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Document Upload</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ID Card Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID Card Photo
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                {previewIdCard ? (
                  <div className="relative w-full h-64">
                    <img
                      src={previewIdCard}
                      alt="ID Card"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => handleRemoveImage('idCardImage')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="id-card-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="id-card-upload"
                          name="id-card-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'idCardImage')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
              {errors.idCardImage && (
                <Alert type="error" message={errors.idCardImage} />
              )}
            </div>

            {/* Selfie Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Selfie Photo
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                {previewSelfie ? (
                  <div className="relative w-full h-64">
                    <img
                      src={previewSelfie}
                      alt="Selfie"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => handleRemoveImage('selfieImage')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="selfie-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="selfie-upload"
                          name="selfie-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, 'selfieImage')}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>
              {errors.selfieImage && (
                <Alert type="error" message={errors.selfieImage} />
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <Input
              label="Address"
              type="text"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              required
            />
            <Input
              label="City"
              type="text"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              required
            />
            <Input
              label="Region"
              type="text"
              value={formData.region}
              onChange={(e) => onChange('region', e.target.value)}
              required
            />
          </div>
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

export default DocumentUpload;
