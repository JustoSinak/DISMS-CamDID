import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Upload, X, Check, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';

const CreateIdentity = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nationalIdNumber: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Cameroonian',
    gender: '',
    idCardImage: null,
    selfieImage: null,
    address: '',
    city: '',
    region: '',
    phoneNumber: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [previewIdCard, setPreviewIdCard] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
        } else {
          setPreviewSelfie(reader.result);
          setFormData(prev => ({ ...prev, selfieImage: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // National ID validation
    if (!formData.nationalIdNumber) {
      errors.nationalIdNumber = 'National ID number is required';
    } else if (!/^\d{9}$/.test(formData.nationalIdNumber)) {
      errors.nationalIdNumber = 'Invalid National ID number format';
    }

    // Date of Birth validation
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

    // Required fields validation
    if (!formData.placeOfBirth) errors.placeOfBirth = 'Place of birth is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.region) errors.region = 'Region is required';
    
    // Phone number validation (Cameroon format)
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+237|237)?[6-9][0-9]{8}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Invalid Cameroon phone number';
    }

    // Image validation
    if (!formData.idCardImage) errors.idCardImage = 'ID card image is required';
    if (!formData.selfieImage) errors.selfieImage = 'Selfie image is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData object to send files
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // TODO: Replace with actual API call
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess('Digital identity created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create digital identity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Digital Identity</h1>
            <p className="mt-2 text-gray-600">Please provide your ID card information to create your digital identity</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* National ID Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">National ID Number</label>
                <input
                  type="text"
                  name="nationalIdNumber"
                  value={formData.nationalIdNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.nationalIdNumber ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Enter your ID number"
                />
                {formErrors.nationalIdNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.nationalIdNumber}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                />
                {formErrors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                )}
              </div>

              {/* Place of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.placeOfBirth ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Enter your place of birth"
                />
                {formErrors.placeOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.placeOfBirth}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.gender ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {formErrors.gender && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.address ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Enter your address"
                />
                {formErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.city ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Enter your city"
                />
                {formErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                )}
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.region ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
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

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    formErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="e.g., 237612345678"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* ID Card Image Upload */}
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

              {/* Selfie Image Upload */}
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

            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Creating Identity...
                  </>
                ) : (
                  <>
                    <Check className="-ml-1 mr-3 h-5 w-5" />
                    Create Digital Identity
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIdentity; 