import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useIdentity } from '../contexts/IdentityContext';
import { Plus, Edit2, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyIdentity = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = AuthContext;
  const { 
    identity, 
    credentials, 
    loading, 
    error, 
    deleteCredential,
    updateCredential,
    createCredential,
  } = useIdentity();
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [editingCredential, setEditingCredential] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteCredentialId, setDeleteCredentialId] = useState(null);
  const [didVersionCount, setDidVersionCount] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionDetails, setVersionDetails] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (identity && identity.did) {
      axios.get(`/api/identity/did/${identity.did}/versions`).then(res => {
        setDidVersionCount(Number(res.data.count));
      });
    }
  }, [identity]);

  useEffect(() => {
    if (identity && identity.did && selectedVersion !== null) {
      axios.get(`/api/identity/did/${identity.did}/version/${selectedVersion}`).then(res => {
        setVersionDetails(res.data.document);
      });
    }
  }, [identity, selectedVersion]);

  if (!isAuthenticated) {
    return null;
  }

  const handleCreateIdentity = () => {
    navigate('/create-identity');
  };

  const handleEditCredential = async (credential) => {
    // Implementation for editing credential can be added here if needed
  };

  const handleDeleteCredential = (credentialId) => {
    setDeleteCredentialId(credentialId);
    setConfirmDelete(true);
  };

  const confirmDeleteCredential = async () => {
    try {
      await deleteCredential(deleteCredentialId);
      toast.success('Credential deleted successfully');
      setConfirmDelete(false);
      setDeleteCredentialId(null);
    } catch (err) {
      toast.error('Failed to delete credential: ' + err.message);
    }
  };

  const handleCredentialModalClose = () => {
    setShowCredentialModal(false);
    setSelectedCredential(null);
    setEditingCredential(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Delete Confirmation Modal */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ display: confirmDelete ? 'flex' : 'none' }}
      >
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this credential?</p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              onClick={() => {
                setConfirmDelete(false);
                setDeleteCredentialId(null);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={confirmDeleteCredential}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Digital Identity</h1>
        <button
          className="px-4 py-2 bg-emerald-500 text-white rounded"
          onClick={handleCreateIdentity}
          disabled={!!identity}
        >
          {identity ? 'Update Identity' : 'Create Identity'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Card */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Identity Information</h2>
            <Shield className="h-6 w-6 text-emerald-500" />
          </div>

          {!identity ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No identity created yet</p>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded mt-4"
                onClick={handleCreateIdentity}
              >
                Create Identity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">DID:</span>
                <span className="ml-2 text-sm text-gray-900">{identity.did}</span>
                <span className={`ml-4 ${identity.status === 'verified' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                  {identity.status}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {new Date(identity.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Credentials Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Credentials</h2>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              onClick={() => {
                setSelectedCredential(null);
                setShowCredentialModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issuer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issuance Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {credentials.map((credential) => (
                  <tr key={credential.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {credential.type.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {credential.issuer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(credential.issuanceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 ${credential.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'} rounded`}>
                        {credential.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleEditCredential(credential)}
                          disabled={!credential.isValid}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteCredential(credential.id)}
                          disabled={!credential.isValid}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Credential Modal */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ display: showCredentialModal ? 'flex' : 'none' }}
      >
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{editingCredential ? 'Edit Credential' : 'Add New Credential'}</h2>
          <input
            type="text"
            value={editingCredential?.type || ''}
            onChange={(e) => {
              if (editingCredential) {
                setEditingCredential({
                  ...editingCredential,
                  type: e.target.value
                });
              }
            }}
            placeholder="Credential Type"
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <input
            type="text"
            value={editingCredential?.issuer || ''}
            onChange={(e) => {
              if (editingCredential) {
                setEditingCredential({
                  ...editingCredential,
                  issuer: e.target.value
                });
              }
            }}
            placeholder="Issuer"
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <textarea
            value={editingCredential?.description || ''}
            onChange={(e) => {
              if (editingCredential) {
                setEditingCredential({
                  ...editingCredential,
                  description: e.target.value
                });
              }
            }}
            placeholder="Description"
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
              onClick={handleCredentialModalClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-emerald-500 text-white rounded"
              onClick={async () => {
                try {
                  if (editingCredential) {
                    await updateCredential(editingCredential);
                    toast.success('Credential updated successfully');
                  } else {
                    await createCredential(selectedCredential);
                    toast.success('Credential created successfully');
                  }
                  handleCredentialModalClose();
                } catch (err) {
                  toast.error('Failed to save credential: ' + err.message);
                }
              }}
            >
              {editingCredential ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      {identity && identity.did && didVersionCount > 0 && (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">DID Version History</h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm">Select version:</span>
            <select
              className="border rounded px-2 py-1"
              value={selectedVersion ?? ''}
              onChange={e => setSelectedVersion(Number(e.target.value))}
            >
              <option value="" disabled>Select version</option>
              {Array.from({ length: didVersionCount }, (_, i) => (
                <option key={i} value={i}>Version {i + 1}</option>
              ))}
            </select>
          </div>
          {versionDetails && (
            <div className="bg-gray-50 p-3 rounded border">
              <div><b>Owner:</b> {versionDetails[0]}</div>
              <div><b>Public Key:</b> {versionDetails[1]}</div>
              <div><b>Authentication Key:</b> {versionDetails[2]}</div>
              <div><b>Service Endpoint:</b> {versionDetails[3]}</div>
              <div><b>Created:</b> {new Date(Number(versionDetails[4]) * 1000).toLocaleString()}</div>
              <div><b>Updated:</b> {new Date(Number(versionDetails[5]) * 1000).toLocaleString()}</div>
              <div><b>Active:</b> {versionDetails[6] ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyIdentity;
