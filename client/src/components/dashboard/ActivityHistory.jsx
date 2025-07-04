import React, { useState, useEffect } from 'react';
import ActivityTimeline from './ActivityTimeline';

const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // TODO: Replace with actual API call
        // For now, using mock data
        const mockActivities = [
          {
            id: 1,
            type: 'credential_issued',
            title: 'New Credential Issued',
            details: 'University Degree Credential issued by Example University',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: 2,
            type: 'credential_shared',
            title: 'Credential Shared',
            details: 'Shared identity verification with Example Corp',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: 3,
            type: 'wallet_connected',
            title: 'Wallet Connected',
            details: 'Successfully connected to MetaMask wallet',
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() // 2 days ago
          }
        ];

        setActivities(mockActivities);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch activity history');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

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

  return <ActivityTimeline activities={activities} />;
};

export default ActivityHistory;
