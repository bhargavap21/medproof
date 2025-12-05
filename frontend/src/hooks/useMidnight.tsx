/**
 * Midnight React Hook
 * 
 * Provides React context and hooks for Midnight Network wallet integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import midnightWalletService, { MidnightState, ZKProofData, TransactionResult } from '../services/midnight';

interface MidnightContextValue extends MidnightState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  submitProof: (proofData: ZKProofData) => Promise<TransactionResult>;
  verifyProof: (proofHash: string) => Promise<boolean>;
  authorizeHospital: (hospitalId: string) => Promise<void>;
  getShortAddress: () => string | null;
  error: string | null;
  loading: boolean;
}

const MidnightContext = createContext<MidnightContextValue | undefined>(undefined);

interface MidnightProviderProps {
  children: ReactNode;
}

export const MidnightProvider: React.FC<MidnightProviderProps> = ({ children }) => {
  const [state, setState] = useState<MidnightState>({
    isConnected: false,
    walletAddress: null,
    balance: null,
    networkId: null,
    isLaceInstalled: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Midnight service on mount
  useEffect(() => {
    const initializeMidnight = async () => {
      try {
        setLoading(true);
        const initialState = await midnightWalletService.initialize();
        setState(initialState);
      } catch (err: any) {
        console.warn('Midnight initialization failed:', err.message);
        // Don't set error for Lace not detected during initial load
        if (!err.message.includes('not installed') && !err.message.includes('not detected')) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeMidnight();

    // Subscribe to state changes from the service
    const unsubscribe = midnightWalletService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  /**
   * Connect to Lace Wallet
   */
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newState = await midnightWalletService.connectWallet();
      setState(newState);
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(async () => {
    try {
      setError(null);
      await midnightWalletService.disconnectWallet();
    } catch (err: any) {
      console.error('Wallet disconnection error:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Refresh wallet balance
   */
  const refreshBalance = useCallback(async () => {
    try {
      setError(null);
      await midnightWalletService.refreshBalance();
    } catch (err: any) {
      console.error('Balance refresh error:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Submit ZK proof to Midnight Network
   */
  const submitProof = useCallback(async (proofData: ZKProofData): Promise<TransactionResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await midnightWalletService.submitProofToMidnight(proofData);
      return result;
    } catch (err: any) {
      console.error('Proof submission error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verify proof on Midnight Network
   */
  const verifyProof = useCallback(async (proofHash: string): Promise<boolean> => {
    try {
      setError(null);
      return await midnightWalletService.verifyProofOnMidnight(proofHash);
    } catch (err: any) {
      console.error('Proof verification error:', err);
      setError(err.message);
      return false;
    }
  }, []);

  /**
   * Authorize hospital
   */
  const authorizeHospital = useCallback(async (hospitalId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await midnightWalletService.authorizeHospital(hospitalId);
    } catch (err: any) {
      console.error('Hospital authorization error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get shortened wallet address for display
   */
  const getShortAddress = useCallback((): string | null => {
    return midnightWalletService.getShortAddress();
  }, [state.walletAddress]);

  const contextValue: MidnightContextValue = {
    ...state,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    submitProof,
    verifyProof,
    authorizeHospital,
    getShortAddress,
    error,
    loading,
  };

  return (
    <MidnightContext.Provider value={contextValue}>
      {children}
    </MidnightContext.Provider>
  );
};

/**
 * Hook to use Midnight context
 */
export const useMidnight = (): MidnightContextValue => {
  const context = useContext(MidnightContext);
  if (!context) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
};

/**
 * Hook to check if Lace is installed (can be used outside MidnightProvider)
 */
export const useIsLaceInstalled = (): boolean => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkLace = async () => {
      const installed = await midnightWalletService.detectLaceWallet();
      setIsInstalled(installed);
    };

    checkLace();
  }, []);

  return isInstalled;
};

export default useMidnight;

