import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIdentity } from '../../contexts/IdentityContext';
import { Card, Button, Table, Modal, Input, Select, Textarea, Badge } from '../../components/ui';
import { Plus, Edit2, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyIdentity = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    identity, 
    credentials, 
    loading, 
    error, 
    createIdentity, 
    deleteCredential,
    getCredentialDetails,
    updateCredential 
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
    try {
      const { credential: credentialDetails, isValid } = await getCredentialDetails(credential.id);
      setEditingCredential({
        ...credentialDetails,
        isValid
      });
      setShowCredentialModal(true);
    } catch (err) {
      toast.error('Failed to load credential details: ' + err.message);
    }
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
      <Modal
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteCredentialId(null);
        }}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this credential?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDelete(false);
                setDeleteCredentialId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteCredential}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Digital Identity</h1>
        <Button
          variant="primary"
          onClick={handleCreateIdentity}
          disabled={!!identity}
        >
          {identity ? 'Update Identity' : 'Create Identity'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Card */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Identity Information</h2>
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>

            {!identity ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No identity created yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreateIdentity}
                >
                  Create Identity
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500">DID:</span>
                  <span className="ml-2 text-sm text-gray-900">{identity.did}</span>
                  <Badge
                    className="ml-4"
                    color={identity.status === 'verified' ? 'success' : 'warning'}
                  >
                    {identity.status}
                  </Badge>
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
        </Card>

        {/* Credentials Table */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Credentials</h2>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCredential(null);
                  setShowCredentialModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Credential
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Type</Table.HeadCell>
                  <Table.HeadCell>Issuer</Table.HeadCell>
                  <Table.HeadCell>Issuance Date</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {credentials.map((credential) => (
                    <Table.Row key={credential.id}>
                      <Table.Cell>
                        {credential.type.join(', ')}
                      </Table.Cell>
                      <Table.Cell>{credential.issuer}</Table.Cell>
                      <Table.Cell>
                        {new Date(credential.issuanceDate).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={credential.status === 'valid' ? 'success' : 'warning'}>
                          {credential.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCredential(credential)}
                            disabled={!credential.isValid}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCredential(credential.id)}
                            disabled={!credential.isValid}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </Card>
      </div>

      {/* Credential Modal */}
      <Modal
        isOpen={showCredentialModal}
        onClose={handleCredentialModalClose}
        title={editingCredential ? 'Edit Credential' : 'Add New Credential'}
      >
        <div className="space-y-4">
          <Input
            label="Credential Type"
            name="type"
            value={editingCredential?.type || ''}
            onChange={(e) => {
              if (editingCredential) {
                setEditingCredential({
                  ...editingCredential,
                  type: e.target.value
                });
              }
            }}
          />
          <Input
            label="Issuer"
            name="issuer"
            value={editingCredential?.issuer || ''}
            onChange={(e) => {
              if (editingCredential) {
                setEditingCredential({
                  ...editingCredential,
                  issuer: e.target.value
                });
              }
            }}
          />
          <Textarea
            label="Description"
            name="description"
            value={editingCredential?.description || ''}
            onChange={(e) => {
              if (editingCredential) {
                setEditingCredential({
                  ...editingCredential,
                  description: e.target.value
                });
              }
            }}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleCredentialModalClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
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
            </Button>
          </div>
        </div>
      </Modal>

      {identity && identity.did && didVersionCount > 0 && (
        <Card className="mt-6">
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
        </Card>
      )}
    </div>
  );
};

export default MyIdentity;
