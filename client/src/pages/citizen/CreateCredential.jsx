import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  FileText,
  Stethoscope,
  Banknote,
  Upload,
  X
} from 'lucide-react';
import axios from 'axios';

const CreateCredential = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    title: '',
    description: '',
    issuer: {
      name: '',
      did: ''
    },
    expirationDate: '',
    attributes: [],
    document: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    {
      id: 'government',
      label: 'Government',
      icon: Shield,
      types: ['government_id', 'passport', 'birth_certificate']
    },
    {
      id: 'educational',
      label: 'Educational',
      icon: GraduationCap,
      types: ['diploma', 'certificate']
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: FileText,
      types: ['driving_license', 'professional_certification']
    },
    {
      id: 'health',
      label: 'Health',
      icon: Stethoscope,
      types: ['vaccination', 'medical_record']
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: Banknote,
      types: ['bank_statement', 'credit_report']
    }
  ];

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      category: category.id,
      type: category.types[0]
    });
    setStep(2);
  };

  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        document: file
      });
    }
  };

  const handleAttributeAdd = () => {
    setFormData({
      ...formData,
      attributes: [
        ...formData.attributes,
        { name: '', value: '', isPrivate: true }
      ]
    });
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = {
      ...newAttributes[index],
      [field]: value
    };
    setFormData({
      ...formData,
      attributes: newAttributes
    });
  };

  const handleAttributeRemove = (index) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      attributes: newAttributes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'document') {
          if (formData[key]) {
            formDataToSend.append('document', formData[key]);
          }
        } else if (key === 'attributes') {
          formDataToSend.append('attributes', JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        }
      });

      await axios.post('/api/credential/credentials', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      navigate('/citizen/credentials');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Credential</h1>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className="flex items-center p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <category.icon className="w-8 h-8 text-blue-500" />
                <div className="ml-4 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.types.join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Credential Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    {categories
                      .find(c => c.id === formData.category)
                      ?.types.map(type => (
                        <option key={type} value={type}>
                          {type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Issuer Name
                  </label>
                  <input
                    type="text"
                    value={formData.issuer.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      issuer: { ...formData.issuer, name: e.target.value }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attributes
                </h2>
                <button
                  type="button"
                  onClick={handleAttributeAdd}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Attribute
                </button>
              </div>

              <div className="space-y-4">
                {formData.attributes.map((attribute, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={attribute.name}
                      onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                      placeholder="Attribute name"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={attribute.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={attribute.isPrivate}
                        onChange={(e) => handleAttributeChange(index, 'isPrivate', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Private</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAttributeRemove(index)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Document Upload
              </h2>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleDocumentUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              </div>

              {formData.document && (
                <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.document.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, document: null })}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/citizen/credentials')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Credential'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateCredential; 