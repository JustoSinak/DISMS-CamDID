import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Get the current account
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          
          // Set up event listener for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0]);
          });

          setWeb3(web3Instance);
          setLoading(false);
        } else {
          throw new Error('Please install MetaMask to use this application');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeWeb3();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    web3,
    contract,
    account,
    loading,
    error,
    connectWallet,
    setContract
  };

  return (
    <Web3Context.Provider value={value}>
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