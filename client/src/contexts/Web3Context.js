import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { toast } from 'react-toastify';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize web3
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          setWeb3(provider);
          
          // Request accounts
          const accounts = await provider.send('eth_requestAccounts', []);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            } else {
              setAccount(null);
            }
          });

          // Listen for network changes
          window.ethereum.on('chainChanged', (chainId) => {
            setNetwork(chainId);
          });
        } else {
          setError('MetaMask is not installed');
          toast.error('Please install MetaMask to use this application');
        }
      } catch (err) {
        setError(err.message);
        toast.error('Error initializing web3: ' + err.message);
      }
    };

    initializeWeb3();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setLoading(false);
        toast.success('Wallet connected successfully');
        return true;
      } else {
        throw new Error('No accounts returned from MetaMask');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Error connecting wallet: ' + err.message);
      setLoading(false);
      return false;
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setNetwork(null);
    setError(null);
  };

  return (
    <Web3Context.Provider
      value={{
        web3,
        account,
        network,
        loading,
        error,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
