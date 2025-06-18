import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  FileText,
  Shield,
  GraduationCap,
  Stethoscope,
  Banknote,
  Plus,
  Share2,
  QrCode,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';

const Credentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await axios.get('/api/credential/credentials', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCredentials(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch credentials');
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'government':
        return <Shield className="w-6 h-6" />;
      case 'educational':
        return <GraduationCap className="w-6 h-6" />;
      case 'professional':
        return <FileText className="w-6 h-6" />;
      case 'health':
        return <Stethoscope className="w-6 h-6" />;
      case 'financial':
        return <Banknote className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  const filteredCredentials = selectedCategory === 'all'
    ? credentials
    : credentials.filter(cred => cred.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Credentials' },
    { id: 'government', label: 'Government' },
    { id: 'educational', label: 'Educational' },
    { id: 'professional', label: 'Professional' },
    { id: 'health', label: 'Health' },
    { id: 'financial', label: 'Financial' }
  ];

  const handleShare = async (credentialId) => {
    try {
      const response = await axios.post(
        `/api/credential/credentials/${credentialId}/qr`,
        {
          attributes: ['all'],
          expiresIn: 3600 // 1 hour
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // Handle QR code display
      console.log('QR Code generated:', response.data);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Credentials</h1>
        <button
          onClick={() => navigate('/citizen/credentials/create')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Credential
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${selectedCategory === category.id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredentials.map(credential => (
          <div
            key={credential._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getCategoryIcon(credential.category)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {credential.metadata.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {credential.metadata.description}
                    </p>
                  </div>
                </div>
                {getStatusBadge(credential.status)}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issued by</span>
                  <span className="text-gray-900 font-medium">
                    {credential.issuer.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issue Date</span>
                  <span className="text-gray-900">
                    {new Date(credential.metadata.issueDate).toLocaleDateString()}
                  </span>
                </div>
                {credential.metadata.expirationDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Expires</span>
                    <span className="text-gray-900">
                      {new Date(credential.metadata.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleShare(credential._id)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => navigate(`/citizen/credentials/${credential._id}`)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCredentials.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first credential.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/citizen/credentials/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Credential
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credentials; 