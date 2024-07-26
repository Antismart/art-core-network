import React, { createContext, useState, useEffect, useCallback } from 'react';
import { initWeb3, getCurrentAddress, getBalance } from '../services/web3Service';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3State, setWeb3State] = useState({
    web3: null,
    accounts: [],
    address: '',
    balance: '',
    networkId: null,
    isConnected: false,
  });

  const connect = useCallback(async () => {
    try {
      console.log('Attempting to connect');
      const { web3, accounts, networkId, isConnected } = await initWeb3();
      
      const address = accounts[0];
      const balance = await getBalance(address);
      
      setWeb3State({
        web3,
        accounts,
        address,
        balance,
        networkId,
        isConnected,
      });

      console.log('Connected:', { address, networkId, balance });
    } catch (error) {
      console.error('Failed to connect:', error);
      setWeb3State(prevState => ({ ...prevState, isConnected: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWeb3State({
      web3: null,
      accounts: [],
      address: '',
      balance: '',
      networkId: null,
      isConnected: false,
    });
    console.log('Disconnected');
  }, []);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      const newAddress = accounts[0];
      const balance = await getBalance(newAddress);
      setWeb3State(prevState => ({ 
        ...prevState, 
        accounts,
        address: newAddress,
        balance,
        isConnected: true 
      }));
    }
  }, [disconnect]);

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged]);

  useEffect(() => {
    console.log('Web3Context state:', web3State);
  }, [web3State]);

  return (
    <Web3Context.Provider value={{ ...web3State, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
};