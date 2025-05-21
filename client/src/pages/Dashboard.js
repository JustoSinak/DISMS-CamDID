import React, { useState, useEffect } from 'react';
import IdentityCard from './IdentityCard';
import ActivityTimeline from './ActivityTimeline';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../contexts/Web3Context';
import { getVerifiableCredentials } from '../services/wallet';
import { FaIdCard, FaClipboardList, FaUserShield } from 'react-icons/fa';
import styles from '../styles/Dashboard.module.scss';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, networkStatus } = useWeb3();
  const [credentials, setCredentials] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [credentialStats, setCredentialStats] = useState({
    active: 0,
    shared: 0,
    revoked: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.did && isConnected) {
        try {
          // Fetch verifiable credentials
          const userCredentials = await getVerifiableCredentials(user.did);
          setCredentials(userCredentials);
          
          // Calculate credential statistics
          const stats = {
            active: userCredentials.filter(cred => cred.status === 'active').length,
            shared: userCredentials.filter(cred => cred.shared).length,
            revoked: userCredentials.filter(cred => cred.status === 'revoked').length
          };
          setCredentialStats(stats);
          
          // Fetch recent activity (in a real app, this would be from a separate API endpoint)
          // For now, we'll create sample data
          const activity = [
            { 
              id: 1, 
              type: 'credential_issued', 
              title: 'Driver License Verified',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Your driver license has been verified and added to your wallet'
            },
            { 
              id: 2, 
              type: 'credential_shared', 
              title: 'Identity Shared with CarRental Inc.',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'You shared your age verification credential'
            },
            { 
              id: 3, 
              type: 'wallet_connected', 
              title: 'New Device Connected',
              timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              details: 'Your wallet was connected from a new device in New York'
            }
          ];
          setRecentActivity(activity);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isConnected]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your secure identity dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.welcomeSection}>
        <h2>Welcome back, {user?.name || 'User'}</h2>
        <p>Manage your digital identity and credentials securely with blockchain technology.</p>
      </section>

      <section className={styles.identityOverview}>
        <div className={styles.cardContainer}>
          <IdentityCard user={user} />
          
          <div className={styles.blockchainInfo}>
            <h3>Blockchain Status</h3>
            <div className={styles.statusItem}>
              <span className={styles.label}>Network:</span>
              <span className={`${styles.value} ${styles.network}`}>
                {networkStatus.connected ? networkStatus.name : 'Not Connected'}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.label}>Last Block:</span>
              <span className={styles.value}>{networkStatus.lastBlock || 'N/A'}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.label}>DID Document:</span>
              <a 
                href={`https://explorer.example.com/did/${user?.did}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.didLink}
              >
                View on Explorer
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsOverview}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaIdCard />
          </div>
          <div className={styles.statContent}>
            <h3>Active Credentials</h3>
            <p className={styles.statValue}>{credentialStats.active}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaClipboardList />
          </div>
          <div className={styles.statContent}>
            <h3>Shared With</h3>
            <p className={styles.statValue}>{credentialStats.shared}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUserShield />
          </div>
          <div className={styles.statContent}>
            <h3>Security Score</h3>
            <p className={styles.statValue}>92<span className={styles.statUnit}>/100</span></p>
          </div>
        </div>
      </section>

      <section className={styles.activitySection}>
        <h3>Recent Activity</h3>
        <ActivityTimeline activities={recentActivity} />
      </section>
    </div>
  );
};

export default Dashboard;