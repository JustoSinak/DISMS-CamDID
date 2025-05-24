import React, { createContext, useContext, useState } from 'react';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);

  // Add web3-related state and functions here later

  return (
    <Web3Context.Provider value={{ web3, setWeb3 }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
