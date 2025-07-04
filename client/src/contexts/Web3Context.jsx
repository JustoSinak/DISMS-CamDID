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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize web3
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (isInitialized) return;
      
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          setWeb3(provider);
          
          // Check if already connected
          const accounts = await provider.send('eth_accounts', []);
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

          setIsInitialized(true);
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

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [isInitialized]);

  const connectWallet = async () => {
    // Prevent concurrent connection attempts
    if (isConnecting) {
      toast.info('Wallet connection in progress...');
      return false;
    }

    try {
      setIsConnecting(true);
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
    } finally {
      setIsConnecting(false);
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
        disconnectWallet,
        isConnecting,
        isInitialized
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};


 //  / contexts/Web3Context.js
// import React, { createContext, useState, useEffect } from 'react';
// import Web3 from 'web3';

 // / Import contract ABIs (these would be generated after deploying contracts)
// import IdentityRegistryABI from '../contracts/IdentityRegistry.json';
// import CredentialVerifierABI from '../contracts/CredentialVerifier.json';

// const Web3Context = createContext();

// const Web3Provider = ({ children }) => {
//   const [web3, setWeb3] = useState(null);
//   const [account, setAccount] = useState(null);
//   const [contracts, setContracts] = useState({});
//   const [networkId, setNetworkId] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [error, setError] = useState(null);

//   // Contract addresses (replace with your deployed contract addresses)
//   const CONTRACT_ADDRESSES = {
//     identityRegistry: process.env.REACT_APP_IDENTITY_REGISTRY_ADDRESS || '0x...', 
//     credentialVerifier: process.env.REACT_APP_CREDENTIAL_VERIFIER_ADDRESS || '0x...'
//   };

//   // Initialize Web3 and contracts
//   const initializeWeb3 = async () => {
//     try {
//       if (window.ethereum) {
//         const web3Instance = new Web3(window.ethereum);
//         setWeb3(web3Instance);

//         // Get network ID
//         const networkId = await web3Instance.eth.net.getId();
//         setNetworkId(networkId);

//         // Initialize contracts
//         const identityRegistry = new web3Instance.eth.Contract(
//           IdentityRegistryABI.abi,
//           CONTRACT_ADDRESSES.identityRegistry
//         );

//         const credentialVerifier = new web3Instance.eth.Contract(
//           CredentialVerifierABI.abi,
//           CONTRACT_ADDRESSES.credentialVerifier
//         );

//         setContracts({
//           identityRegistry,
//           credentialVerifier
//         });

//         return web3Instance;
//       } else {
//         throw new Error('Web3 wallet not detected. Please install MetaMask.');
//       }
//     } catch (error) {
//       setError(error.message);
//       throw error;
//     }
//   };

//   // Connect wallet
//   const connectWallet = async () => {
//     try {
//       setIsConnecting(true);
//       setError(null);

//       if (!web3) {
//         await initializeWeb3();
//       }

//       // Request account access
//       const accounts = await window.ethereum.request({
//         method: 'eth_requestAccounts',
//       });

//       if (accounts.length > 0) {
//         setAccount(accounts[0]);
//         localStorage.setItem('walletConnected', 'true');
//         return accounts[0];
//       } else {
//         throw new Error('No accounts found');
//       }
//     } catch (error) {
//       setError(error.message);
//       throw error;
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   // Disconnect wallet
//   const disconnectWallet = () => {
//     setAccount(null);
//     localStorage.removeItem('walletConnected');
//   };

//   // Check if wallet is already connected
//   const checkWalletConnection = async () => {
//     try {
//       if (window.ethereum && localStorage.getItem('walletConnected')) {
//         const web3Instance = web3 || await initializeWeb3();
//         const accounts = await web3Instance.eth.getAccounts();
        
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking wallet connection:', error);
//     }
//   };

//   // Listen for account changes
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', (accounts) => {
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
//         } else {
//           disconnectWallet();
//         }
//       });

//       window.ethereum.on('chainChanged', () => {
//         window.location.reload();
//       });
//     }

//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeAllListeners('accountsChanged');
//         window.ethereum.removeAllListeners('chainChanged');
//       }
//     };
//   }, []);

//   // Initialize on mount
//   useEffect(() => {
//     initializeWeb3().catch(console.error);
//     checkWalletConnection();
//   }, []);

//   const value = {
//     web3,
//     account,
//     contracts,
//     networkId,
//     isConnecting,
//     error,
//     connectWallet,
//     disconnectWallet,
//     initializeWeb3
//   };

//   return (
//     <Web3Context.Provider value={value}>
//       {children}
//     </Web3Context.Provider>
//   );
// };

// export { Web3Context, Web3Provider };