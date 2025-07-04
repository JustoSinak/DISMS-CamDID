import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, UploadCloud } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useIdentity } from '../../contexts/IdentityContext';
import { apiService } from '../../services/apiService';

const UploadCredentialDialog = ({ open, onClose }) => {
  const { issueCredential } = useIdentity();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    type: '',
    category: '',
    title: '',
    description: '',
    issueDate: '',
    expirationDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    setMetadata({
      ...metadata,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a document to upload.');
      return;
    }
    if (!metadata.type || !metadata.category) {
      setError('Please fill in required metadata fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Encrypt fileBuffer with user's document key (simulate here)
      // In real implementation, get user's document key securely
      const encryptedContent = await apiService.encryptDocument(fileBuffer);

      // Upload encrypted content to IPFS
      const ipfsHash = await apiService.uploadToIPFS(encryptedContent);

      // Create verifiable credential data
      const credentialData = {
        type: metadata.type,
        category: metadata.category,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          issueDate: metadata.issueDate,
          expirationDate: metadata.expirationDate,
          ipfsHash
        },
        encryptedData: encryptedContent
      };

      // Issue credential via IdentityContext
      await issueCredential(credentialData);

      onClose();
    } catch (err) {
      setError(err.message || 'Error uploading credential.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                  <UploadCloud className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Upload Credential Document
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Select a document to upload and provide metadata to create a verifiable credential.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <Input
                  label="Type"
                  name="type"
                  value={metadata.type}
                  onChange={handleInputChange}
                  placeholder="e.g. Passport, Diploma"
                  required
                />
                <Input
                  label="Category"
                  name="category"
                  value={metadata.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Government Documents, Educational Credentials"
                  required
                />
                <Input
                  label="Title"
                  name="title"
                  value={metadata.title}
                  onChange={handleInputChange}
                  placeholder="Document title"
                />
                <Input
                  label="Description"
                  name="description"
                  value={metadata.description}
                  onChange={handleInputChange}
                  placeholder="Brief description"
                />
                <Input
                  label="Issue Date"
                  name="issueDate"
                  type="date"
                  value={metadata.issueDate}
                  onChange={handleInputChange}
                />
                <Input
                  label="Expiration Date"
                  name="expirationDate"
                  type="date"
                  value={metadata.expirationDate}
                  onChange={handleInputChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Document</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="mt-1 block w-full"
                  />
                </div>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </div>

              <div className="mt-5 sm:mt-6">
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                  ) : (
                    'Upload and Issue Credential'
                  )}
                </Button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default UploadCredentialDialog;
