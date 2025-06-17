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
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      setErrors(prev => ({ ...prev, selfieImage: 'Could not access camera' }));
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        handleFileChange({ target: { files: [file] } }, 'selfieImage');
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

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
                ) : showCamera ? (
                  <div className="relative w-full h-64">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                      <button
                        onClick={takePicture}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                      >
                        Take Picture
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={startCamera}
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        Take a selfie
                      </button>
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
