// client/src/pages/VerificationRequest.jsx - Handle verification requests
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  UserIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import SelectiveDisclosure from '../components/credentials/SelectiveDisclosure';
import Sidebar from '../components/shared/Sidebar';

const VerificationRequest = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (requestId) {
      loadVerificationRequest();
    }
  }, [requestId]);

  const loadVerificationRequest = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/verify/request/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
        
        // Load the associated credential
        if (data.request.credentialId) {
          await loadCredential(data.request.credentialId);
        }
      } else {
        toast.error('Failed to load verification request');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading verification request:', error);
      toast.error('Error loading verification request');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadCredential = async (credentialId) => {
    try {
      const response = await fetch(`/api/credentials/${credentialId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCredential(data.credential);
      }
    } catch (error) {
      console.error('Error loading credential:', error);
    }
  };

  const handleApproveRequest = async (disclosureData) => {
    setResponding(true);
    
    try {
      const response = await fetch(`/api/verify/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'approve',
          credentialId: credential._id,
          revealedAttributes: disclosureData.revealedAttributes,
          proof: disclosureData.proof,
          restrictions: {
            privacyLevel: disclosureData.privacyLevel,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          }
        })
      });

      if (response.ok) {
        toast.success('Verification request approved successfully');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Error approving verification request');
    } finally {
      setResponding(false);
    }
  };

  const handleRejectRequest = async (reason) => {
    setResponding(true);
    
    try {
      const response = await fetch(`/api/verify/request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'reject',
          message: reason || 'Request declined by user'
        })
      });

      if (response.ok) {
        toast.success('Verification request rejected');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error rejecting verification request');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="text-center p-8">
            <p className="text-gray-500">Verification request not found</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-emerald-600">Verification Request</h1>
                <p className="text-gray-600 mt-1">Review and respond to credential verification request</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Request Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Requester</p>
                      <p className="text-sm text-gray-600">{request.requesterName || 'Unknown'}</p>
                      {request.organization && (
                        <p className="text-xs text-gray-500">{request.organization}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Purpose</p>
                      <p className="text-sm text-gray-600">{request.purpose}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ClockIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Requested</p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.requestedAt).toLocaleString()}
                      </p>
                      {request.expiresAt && (
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(request.expiresAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Requested Attributes</p>
                      <div className="mt-1">
                        {request.requestedAttributes?.map((attr, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                          >
                            {attr.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Credential Info */}
              {credential && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Credential</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {credential.metadata?.title || credential.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        Issued by: {credential.issuer || 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        credential.status === 'verified' 
                          ? 'bg-green-100 text-green-800'
                          : credential.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {credential.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selective Disclosure */}
            <div className="lg:col-span-2">
              {credential ? (
                <SelectiveDisclosure
                  credential={credential}
                  verifierRequest={{
                    requestedAttributes: request.requestedAttributes,
                    requesterName: request.requesterName,
                    purpose: request.purpose,
                    verifierDid: request.verifierDid
                  }}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No credential available for this request</p>
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={() => handleRejectRequest('No credential available')}
                      disabled={responding}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <XCircleIcon className="w-5 h-5 mr-2" />
                      Reject Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerificationRequest;
