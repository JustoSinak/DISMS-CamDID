import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Shield,
  GraduationCap,
  FileText,
  Stethoscope,
  Banknote,
  Upload,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const CreateCredential = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: type || '',
    title: '',
    description: '',
    issuer: {
      name: '',
      did: '',
      authority: ''
    },
    expirationDate: '',
    attributes: [],
    document: null,
    verificationStatus: 'pending'
  });

  const [schemas, setSchemas] = useState([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState('');
  const [selectedSchema, setSelectedSchema] = useState(null);

  const credentialTypes = useMemo(() => ({
    'national-id': {
      name: 'National ID Card',
      icon: Shield,
      color: 'bg-blue-500',
      category: 'Government',
      description: 'Create a verifiable credential for your National Identity Card',
      requiredFields: ['fullName', 'nationalIdNumber', 'dateOfBirth', 'nationality'],
      issuer: 'Government of Cameroon'
    },
    'drivers-license': {
      name: 'Driver\'s License',
      icon: FileText,
      color: 'bg-green-500',
      category: 'Government',
      description: 'Create a verifiable credential for your Driver\'s License',
      requiredFields: ['fullName', 'licenseNumber', 'issueDate', 'expiryDate'],
      issuer: 'Ministry of Transport'
    },
    'passport': {
      name: 'Passport',
      icon: Shield,
      color: 'bg-purple-500',
      category: 'Government',
      description: 'Create a verifiable credential for your Passport',
      requiredFields: ['fullName', 'passportNumber', 'issueDate', 'expiryDate'],
      issuer: 'Ministry of Foreign Affairs'
    },
    'birth-certificate': {
      name: 'Birth Certificate',
      icon: FileText,
      color: 'bg-indigo-500',
      category: 'Government',
      description: 'Create a verifiable credential for your Birth Certificate',
      requiredFields: ['fullName', 'dateOfBirth', 'placeOfBirth', 'parents'],
      issuer: 'Civil Registry'
    },
    'academic-diploma': {
      name: 'Academic Diploma',
      icon: GraduationCap,
      color: 'bg-emerald-500',
      category: 'Educational',
      description: 'Create a verifiable credential for your Academic Diploma',
      requiredFields: ['fullName', 'institution', 'degree', 'graduationDate'],
      issuer: 'Educational Institution'
    },
    'professional-certificate': {
      name: 'Professional Certificate',
      icon: FileText,
      color: 'bg-orange-500',
      category: 'Professional',
      description: 'Create a verifiable credential for your Professional Certificate',
      requiredFields: ['fullName', 'certificationBody', 'certificateNumber', 'issueDate'],
      issuer: 'Professional Certification Body'
    },
    'medical-record': {
      name: 'Medical Record',
      icon: Stethoscope,
      color: 'bg-red-500',
      category: 'Health',
      description: 'Create a verifiable credential for your Medical Record',
      requiredFields: ['fullName', 'healthcareProvider', 'recordType', 'issueDate'],
      issuer: 'Healthcare Provider'
    },
    'bank-statement': {
      name: 'Bank Statement',
      icon: Banknote,
      color: 'bg-yellow-500',
      category: 'Financial',
      description: 'Create a verifiable credential for your Bank Statement',
      requiredFields: ['fullName', 'bankName', 'accountNumber', 'statementPeriod'],
      issuer: 'Financial Institution'
    },
    'employment-certificate': {
      name: 'Employment Certificate',
      icon: FileText,
      color: 'bg-teal-500',
      category: 'Professional',
      description: 'Create a verifiable credential for your Employment Certificate',
      requiredFields: ['fullName', 'employer', 'position', 'employmentDate'],
      issuer: 'Employer'
    },
    'vaccination-record': {
      name: 'Vaccination Record',
      icon: Stethoscope,
      color: 'bg-pink-500',
      category: 'Health',
      description: 'Create a verifiable credential for your Vaccination Record',
      requiredFields: ['fullName', 'vaccineName', 'doseNumber', 'vaccinationDate'],
      issuer: 'Healthcare Provider'
    },
    'credit-report': {
      name: 'Credit Report',
      icon: Banknote,
      color: 'bg-cyan-500',
      category: 'Financial',
      description: 'Create a verifiable credential for your Credit Report',
      requiredFields: ['fullName', 'creditBureau', 'reportDate', 'creditScore'],
      issuer: 'Credit Bureau'
    },
    'training-certificate': {
      name: 'Training Certificate',
      icon: FileText,
      color: 'bg-lime-500',
      category: 'Educational',
      description: 'Create a verifiable credential for your Training Certificate',
      requiredFields: ['fullName', 'trainingProvider', 'courseName', 'completionDate'],
      issuer: 'Training Provider'
    }
  }), []);

  const currentType = credentialTypes[type] || credentialTypes['national-id'];

  useEffect(() => {
    if (type && credentialTypes[type]) {
      setFormData(prev => ({
        ...prev,
        type: type,
        issuer: {
          ...prev.issuer,
          name: credentialTypes[type].issuer
        }
      }));
    }
  }, [type, credentialTypes]);

  useEffect(() => {
    axios.get('/api/credential/schemas').then(res => {
      setSchemas(res.data.schemas || []);
    });
  }, []);

  useEffect(() => {
    if (selectedSchemaId) {
      const schema = schemas.find(s => s.schemaId === selectedSchemaId);
      setSelectedSchema(schema || null);
    } else {
      setSelectedSchema(null);
    }
  }, [selectedSchemaId, schemas]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIssuerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      issuer: {
        ...prev.issuer,
        [field]: value
      }
    }));
  };

  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file
      }));
      setError(null);
    }
  };

  const handleAttributeAdd = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        { name: '', value: '', isPrivate: true }
      ]
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = {
      ...newAttributes[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      attributes: newAttributes
    }));
  };

  const handleAttributeRemove = (index) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attributes: newAttributes
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title) errors.push('Title is required');
    if (!formData.description) errors.push('Description is required');
    if (!formData.issuer.name) errors.push('Issuer name is required');
    if (!formData.expirationDate) errors.push('Expiration date is required');
    if (!formData.document) errors.push('Document upload is required');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedSchemaId) {
      setError('Please select a credential schema.');
      setLoading(false);
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setLoading(false);
      return;
    }

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
      formDataToSend.append('schemaId', selectedSchemaId);

      await axios.post('/api/credentials', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/citizen/credentials');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create credential');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Credential Created Successfully!</h1>
            <p className="text-gray-600 mb-8">Your {currentType.name} credential has been created and is being verified.</p>
            <Button onClick={() => navigate('/citizen/credentials')}>
              View My Credentials
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/create-credential')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Credential Types
            </button>
            
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${currentType.color} text-white`}>
                <currentType.icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create {currentType.name}</h1>
                <p className="text-gray-600">{currentType.description}</p>
              </div>
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Credential Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={`${currentType.name} Credential`}
                    required
                  />
                  
                  <Input
                    label="Expiration Date"
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Describe this credential..."
                    required
                  />
                </div>
              </div>

              {/* Issuer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Issuer Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Issuer Name"
                    name="issuerName"
                    value={formData.issuer.name}
                    onChange={(e) => handleIssuerChange('name', e.target.value)}
                    placeholder="Name of the issuing authority"
                    required
                  />
                  
                  <Input
                    label="Issuer Authority"
                    name="issuerAuthority"
                    value={formData.issuer.authority}
                    onChange={(e) => handleIssuerChange('authority', e.target.value)}
                    placeholder="Authority or department"
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500">
                        <span>Upload {currentType.name} document</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf"
                          onChange={handleDocumentUpload}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                  
                  {formData.document && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="ml-2 text-sm text-green-700">
                          {formData.document.name} uploaded successfully
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Attributes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Custom Attributes</h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAttributeAdd}
                  >
                    Add Attribute
                  </Button>
                </div>
                
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Input
                      placeholder="Attribute name"
                      value={attr.name}
                      onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Attribute value"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={attr.isPrivate}
                        onChange={(e) => handleAttributeChange(index, 'isPrivate', e.target.checked)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Private</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAttributeRemove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Credential Schema Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Credential Schema</h3>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={selectedSchemaId}
                  onChange={e => setSelectedSchemaId(e.target.value)}
                  required
                >
                  <option value="">Select a schema</option>
                  {schemas.map(schema => (
                    <option key={schema.schemaId} value={schema.schemaId}>
                      {schema.schemaType} v{schema.version} ({schema.schemaURI})
                    </option>
                  ))}
                </select>
                {selectedSchema && (
                  <div className="bg-gray-50 p-3 rounded border mt-2">
                    <div><b>Type:</b> {selectedSchema.schemaType}</div>
                    <div><b>Version:</b> {selectedSchema.version}</div>
                    <div><b>URI:</b> {selectedSchema.schemaURI}</div>
                    <div><b>Registered By:</b> {selectedSchema.registeredBy}</div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/create-credential')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Create Credential
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCredential; 