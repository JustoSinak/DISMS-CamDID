import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DocumentCheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CredentialList = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        // TODO: Replace with actual API call
        // For now, using mock data
        const mockCredentials = [
          {
            id: 1,
            type: 'University Degree',
            issuer: 'Example University',
            issuedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'valid'
          },
          {
            id: 2,
            type: 'Employment Certificate',
            issuer: 'Tech Corp Ltd',
            issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'valid'
          },
          {
            id: 3,
            type: 'Professional License',
            issuer: 'Professional Board',
            issuedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'valid'
          }
        ];

        setCredentials(mockCredentials);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch credentials');
        setLoading(false);
      }
    };

    fetchCredentials();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        No credentials found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.map((credential) => (
        <Link
          key={credential.id}
          to={`/credentials/${credential.id}`}
          className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentCheckIcon className="h-6 w-6 text-emerald-500" />
              <div>
                <h4 className="text-sm font-medium text-slate-900">{credential.type}</h4>
                <p className="text-xs text-slate-500">
                  Issued by {credential.issuer} on {formatDate(credential.issuedDate)}
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-slate-400" />
          </div>
        </Link>
      ))}
      <div className="text-center pt-2">
        <Link
          to="/credentials"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View all credentials
        </Link>
      </div>
    </div>
  );
};

export default CredentialList;
