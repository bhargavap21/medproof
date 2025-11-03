import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import web3Service, { Web3State } from '../services/web3';

interface Web3ContextValue extends Web3State {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  submitProof: (proofData: {
    proofHash: string;
    studyType: string;
    condition: string;
    sampleSize: number;
    effectiveness: number;
    zkProof: any;
  }) => Promise<{ transactionHash: string; blockNumber: number }>;
  verifyProof: (proofHash: string) => Promise<boolean>;
  authorizeHospital: (hospitalId: string) => Promise<void>;
  isHospitalAuthorized: (hospitalId: string) => boolean;
  getHospitalIdForAddress: (address: string) => string | null;
  error: string | null;
  loading: boolean;
}

const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    account: null,
    provider: null,
    signer: null,
    contract: null,
    networkId: null,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        setLoading(true);
        const initialState = await web3Service.initialize();
        setState(initialState);
      } catch (err: any) {
        console.warn('Web3 initialization failed:', err.message);
        // Don't set error for MetaMask not detected during initial load
        if (!err.message.includes('MetaMask not detected')) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeWeb3();

    const unsubscribe = web3Service.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newState = await web3Service.connectWallet();
      setState(newState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await web3Service.disconnectWallet();
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const submitProof = useCallback(async (proofData: {
    proofHash: string;
    studyType: string;
    condition: string;
    sampleSize: number;
    effectiveness: number;
    zkProof: any;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await web3Service.submitProofToBlockchain(
        proofData.proofHash,
        proofData.studyType,
        proofData.condition,
        proofData.sampleSize,
        proofData.effectiveness,
        proofData.zkProof
      );
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyProof = useCallback(async (proofHash: string) => {
    try {
      setError(null);
      return await web3Service.verifyProofOnBlockchain(proofHash);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  const authorizeHospital = useCallback(async (hospitalId: string) => {
    try {
      setLoading(true);
      setError(null);
      await web3Service.authorizeHospital(hospitalId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const isHospitalAuthorized = useCallback((hospitalId: string) => {
    return web3Service.isHospitalAuthorized(hospitalId);
  }, [state.account]);

  const getHospitalIdForAddress = useCallback((address: string) => {
    return web3Service.getHospitalIdForAddress(address);
  }, []);

  const contextValue: Web3ContextValue = {
    ...state,
    connectWallet,
    disconnectWallet,
    submitProof,
    verifyProof,
    authorizeHospital,
    isHospitalAuthorized,
    getHospitalIdForAddress,
    error,
    loading,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextValue => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};