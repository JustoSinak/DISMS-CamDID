import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWeb3 } from './Web3Context';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';
import { VCService } from '../services/vcService';
import { cryptoService } from '../services/cryptoService';
import { toast } from 'react-toastify';

const vcService = new VCService();

const IdentityContext = createContext(null);

export const IdentityProvider = ({ children }) => {
  const { account, connectWallet } = useWeb3();
  const { isAuthenticated } = useAuth();
  const [identity, setIdentity] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCredentials = useCallback(async () => {
    try {
      const creds = await apiService.getCredentials(account);
      setCredentials(creds);
    } catch (err) {
      console.error('Error loading credentials:', err);
      setError(err.message);
    }
  }, [account]);

  const loadIdentity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user's identity from blockchain
      const identityData = await apiService.getIdentity(account);
      setIdentity(identityData);

      // Load credentials
      await getCredentials();
    } catch (err) {
      console.error('Error loading identity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [account, getCredentials]);

  useEffect(() => {
    if (isAuthenticated && account) {
      loadIdentity();
    }
  }, [isAuthenticated, account, loadIdentity]);



  const createIdentity = async (credentialData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if wallet is connected
      if (!account) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Wallet connection required');
        }
      }

      // Generate DID using Solana address
      const did = `did:sol:${account}`;

      // Create Verifiable Credential
      const credential = {
        id: did,
        type: ['VerifiableCredential', 'NationalIDCredential'],
        issuer: account,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: did,
          ...credentialData.credentialSubject
        },
        proof: await cryptoService.signCredential(did, credentialData)
      };

      // Store credential on blockchain
      const tx = await apiService.storeCredentialOnBlockchain(did, credential);

      // Update local state
      setIdentity({
        did,
        status: 'created',
        createdAt: new Date()
      });

      // Add credential to user's credentials
      setCredentials(prev => [...prev, credential]);

      toast.success('Identity and credential created successfully');
      return { tx, credential };
    } catch (err) {
      setError(err.message);
      toast.error('Error creating identity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const issueCredential = async (credentialData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if wallet is connected
      if (!account) {
        const connected = await connectWallet();
        if (!connected) {
          throw new Error('Wallet connection required');
        }
      }

      const credential = await vcService.issueCredential(identity, credentialData);
      setCredentials(prev => [...prev, credential]);
      return credential;
    } catch (err) {
      setError(err.message);
      toast.error('Error issuing credential: ' + err.message);
    } finally {
      setLoading(false);
    }
  };







  const revokeCredential = async (credentialId) => {
    try {
      setLoading(true);
      setError(null);
      await vcService.revokeCredential(credentialId);
      setCredentials(prev => 
        prev.map(cred => 
          cred.id === credentialId ? { ...cred, revoked: true } : cred
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCredential = async (credentialId) => {
    try {
      setLoading(true);
      setError(null);
      const verification = await vcService.verifyCredential(credentialId);
      return verification;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const shareCredential = async (credentialId, recipient) => {
    try {
      setLoading(true);
      setError(null);
      const shareLink = await vcService.createShareLink(credentialId, recipient);
      return { shareLink };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <IdentityContext.Provider
      value={{
        identity,
        credentials,
        loading,
        error,
        createIdentity,
        issueCredential,
        revokeCredential,
        verifyCredential,
        shareCredential,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentity = () => {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
};