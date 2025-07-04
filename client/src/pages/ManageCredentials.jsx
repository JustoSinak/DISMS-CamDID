import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import { Shield, FileText, GraduationCap, Stethoscope, Banknote, Trash2, Edit2, Eye, Download } from 'lucide-react';

const ManageCredentials = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const credentialIcons = {
    'national-id': Shield,
    'passport': FileText,
    'degree': GraduationCap,
    'medical-license': Stethoscope,
    'bank-account': Banknote,
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/credentials');
      setCredentials(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (credentialId) => {
    if (!window.confirm('Are you sure you want to revoke this credential? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/credentials/${credentialId}/revoke`);
      fetchCredentials(); // Refresh list after revocation
    } catch (err) {
      setError(err.message || 'Failed to revoke credential');
    }
  };

  const handleDownload = (credential) => {
    // Implement credential download functionality
    // This could be downloading a PDF or JSON file
    window.open(`/api/credentials/${credential.id}/download`, '_blank');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Credentials</h1>
          <p className="text-gray-600">View and manage your verifiable credentials</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credential Type
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issuer
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {credentials.map((credential) => (
                    <tr key={credential.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <credentialIcons[credential.type] className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {credential.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {credential.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{credential.issuer.name}</div>
                        <div className="text-sm text-gray-500">{credential.issuer.did}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(credential.issueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          credential.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : credential.status === 'revoked' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {credential.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/view-credential/${credential.id}`)}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(credential)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          {credential.status === 'active' && (
                            <button
                              onClick={() => handleRevoke(credential.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageCredentials;
