import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Plus, Search, Filter } from 'lucide-react';
import CredentialCard from './CredentialCard';
import ShareCredentialDialog from './ShareCredentialDialog';
import UploadCredentialDialog from './UploadCredentialDialog';
import { useIdentity } from '../../contexts/IdentityContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const CredentialManager = () => {
  const { credentials, getCredentials, loading, error } = useIdentity();
  const { user } = useAuth();
  const { account } = useWeb3();
  const [filteredCredentials, setFilteredCredentials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);

  useEffect(() => {
    // Fetch credentials when component mounts
    getCredentials();
  }, [getCredentials]);

  useEffect(() => {
    // Filter credentials based on search term
    if (!credentials) return;
    
    const filtered = credentials.filter(credential => {
      const matchesSearch = credential.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credential.issuer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    
    setFilteredCredentials(filtered);
  }, [credentials, searchTerm]);

  const handleRevokeCredential = async (credentialId) => {
    try {
      await getCredentials();
    } catch (error) {
      console.error('Error revoking credential:', error);
    }
  };

  const handleShareCredential = (credential) => {
    setSelectedCredential(credential);
    setShareDialogOpen(true);
  };

  const handleViewCredential = async (credential) => {
    try {
      // TODO: Implement view logic with encryption key prompt
    } catch (error) {
      console.error('Error viewing credential:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Credentials</h2>
        <Button
          variant="primary"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Issue New Credential
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          {/* Add filter options here */}
        </Card>
      )}

      {/* Credentials List */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {filteredCredentials.map((credential) => (
          <CredentialCard
            key={credential.id}
            credential={credential}
            onShare={() => handleShareCredential(credential)}
            onRevoke={() => handleRevokeCredential(credential.id)}
            onView={() => handleViewCredential(credential)}
          />
        ))}

        {filteredCredentials.length === 0 && !loading && (
          <div className="text-gray-500 text-center py-4">
            No credentials found
          </div>
        )}
      </div>

      {/* Share Credential Dialog */}
      {selectedCredential && (
        <ShareCredentialDialog
          credential={selectedCredential}
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
        />
      )}

      {/* Upload Credential Dialog */}
      <UploadCredentialDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </div>
  );
};

export default CredentialManager;
