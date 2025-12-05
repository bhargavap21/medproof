/**
 * Midnight Wallet Service
 * 
 * Handles all interactions with Lace Wallet and Midnight Network
 * for privacy-preserving medical research on the blockchain.
 * 
 * NOTE: Midnight SDK packages are lazy-loaded to avoid WebAssembly CSP issues
 * during initial page load. WASM is only loaded when actually connecting a wallet.
 */

import { MIDNIGHT_CONFIG, LACE_WALLET_CONFIG, ERROR_MESSAGES } from '../config/midnight';

export interface MidnightState {
  isConnected: boolean;
  walletAddress: string | null;
  balance: number | null; // in tDUST
  networkId: string | null;
  isLaceInstalled: boolean;
}

export interface ZKProofData {
  proofHash: string;
  studyId: string;
  hospitalId: string;
  privacyLevel: number;
  proof: any; // The actual ZK proof from backend
}

export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  explorerUrl: string;
}

/**
 * Detect if Lace Wallet extension is installed
 */
declare global {
  interface Window {
    cardano?: {
      lace?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
        getNetworkId: () => Promise<number>;
        getBalance: () => Promise<string>;
        getUsedAddresses: () => Promise<string[]>;
        signTx: (tx: string) => Promise<string>;
        submitTx: (signedTx: string) => Promise<string>;
      };
      [key: string]: any;
    };
  }
}

class MidnightWalletService {
  private state: MidnightState = {
    isConnected: false,
    walletAddress: null,
    balance: null,
    networkId: null,
    isLaceInstalled: false,
  };

  private listeners: ((state: MidnightState) => void)[] = [];
  private connectingPromise: Promise<MidnightState> | null = null;
  private initializingPromise: Promise<MidnightState> | null = null;
  private balanceCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize the service and detect Lace Wallet
   */
  async initialize(): Promise<MidnightState> {
    if (this.initializingPromise) {
      console.log('Initialization already in progress, waiting...');
      return this.initializingPromise;
    }

    if (this.state.isLaceInstalled) {
      console.log('Already initialized');
      return this.state;
    }

    this.initializingPromise = this._doInitialize();

    try {
      const result = await this.initializingPromise;
      return result;
    } finally {
      this.initializingPromise = null;
    }
  }

  private async _doInitialize(): Promise<MidnightState> {
    try {
      console.log('🌙 Initializing Midnight Wallet Service...');
      
      // Wait a bit for Lace extension to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if Lace is installed
      const isLaceInstalled = await this.detectLaceWallet();
      
      this.state = {
        ...this.state,
        isLaceInstalled,
      };

      if (isLaceInstalled) {
        console.log('✅ Lace Wallet detected');
        
        // Check if already connected (auto-connect)
        if (LACE_WALLET_CONFIG.AUTO_CONNECT) {
          try {
            const isEnabled = await window.cardano?.lace?.isEnabled();
            if (isEnabled) {
              console.log('Auto-connecting to previously connected wallet...');
              await this._doConnect();
            }
          } catch (error) {
            console.log('Auto-connect skipped:', error);
          }
        }
      } else {
        console.warn('⚠️  Lace Wallet not detected');
      }

      this.notifyListeners();
      return this.state;
    } catch (error) {
      console.error('Midnight initialization failed:', error);
      throw error;
    }
  }

  /**
   * Detect if Lace Wallet is installed
   */
  async detectLaceWallet(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, LACE_WALLET_CONFIG.DETECTION_TIMEOUT);

      const checkLace = () => {
        if (window.cardano?.lace) {
          clearTimeout(timeout);
          resolve(true);
        } else if (window.cardano && Object.keys(window.cardano).length > 0) {
          // Cardano wallet API exists but Lace not found
          // Check if any Cardano wallet is available
          clearTimeout(timeout);
          resolve(false);
        }
      };

      // Check immediately
      checkLace();

      // Check again after a short delay
      setTimeout(checkLace, 500);
      setTimeout(checkLace, 1000);
      setTimeout(checkLace, 2000);
    });
  }

  /**
   * Connect to Lace Wallet
   */
  async connectWallet(): Promise<MidnightState> {
    if (this.connectingPromise) {
      console.log('Connection already in progress, waiting...');
      return this.connectingPromise;
    }

    if (this.state.isConnected) {
      console.log('Already connected');
      return this.state;
    }

    this.connectingPromise = this._doConnect();

    try {
      const result = await this.connectingPromise;
      return result;
    } finally {
      this.connectingPromise = null;
    }
  }

  private async _doConnect(): Promise<MidnightState> {
    try {
      // Check if Lace is installed
      if (!this.state.isLaceInstalled) {
        await this.initialize();
      }

      if (!this.state.isLaceInstalled) {
        throw new Error(ERROR_MESSAGES.LACE_NOT_INSTALLED);
      }

      if (!window.cardano?.lace) {
        throw new Error(ERROR_MESSAGES.LACE_NOT_DETECTED);
      }

      console.log('🔐 Requesting wallet connection...');

      // Enable Lace wallet (requests user permission)
      const laceAPI = await window.cardano.lace.enable();

      // Get wallet addresses
      const addresses = await laceAPI.getUsedAddresses();
      if (!addresses || addresses.length === 0) {
        throw new Error('No wallet addresses found');
      }

      const walletAddress = addresses[0];
      console.log('✅ Wallet connected:', walletAddress);

      // Get network ID
      const networkId = await laceAPI.getNetworkId();
      console.log('📍 Network ID:', networkId);

      // Check if on correct network (testnet = 0, mainnet = 1)
      if (MIDNIGHT_CONFIG.NETWORK === 'testnet' && networkId !== 0) {
        throw new Error(ERROR_MESSAGES.WRONG_NETWORK);
      }

      // Get balance
      const balanceResponse = await laceAPI.getBalance();
      const balance = this.parseBalance(balanceResponse);
      console.log('💰 Balance:', balance, 'tDUST');

      this.state = {
        ...this.state,
        isConnected: true,
        walletAddress,
        balance,
        networkId: networkId === 0 ? 'testnet' : 'mainnet',
      };

      // Start balance refresh interval
      this.startBalanceRefresh();

      this.notifyListeners();
      return this.state;
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      this.connectingPromise = null;
      
      // User rejected the connection
      if (error.code === 2) {
        throw new Error(ERROR_MESSAGES.CONNECTION_REJECTED);
      }
      
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    console.log('Disconnecting wallet...');
    
    // Stop balance refresh
    if (this.balanceCheckInterval) {
      clearInterval(this.balanceCheckInterval);
      this.balanceCheckInterval = null;
    }

    this.state = {
      ...this.state,
      isConnected: false,
      walletAddress: null,
      balance: null,
      networkId: null,
    };

    this.notifyListeners();
  }

  /**
   * Get wallet balance
   */
  async refreshBalance(): Promise<number | null> {
    if (!this.state.isConnected || !window.cardano?.lace) {
      return null;
    }

    try {
      const laceAPI = await window.cardano.lace.enable();
      const balanceResponse = await laceAPI.getBalance();
      const balance = this.parseBalance(balanceResponse);

      this.state = {
        ...this.state,
        balance,
      };

      this.notifyListeners();
      return balance;
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      return null;
    }
  }

  /**
   * Parse balance from Lace API response
   */
  private parseBalance(balanceResponse: string): number {
    try {
      // Lace returns balance in lovelaces (1 ADA = 1,000,000 lovelaces)
      // For Midnight, we'll parse similarly (1 DUST = 1,000,000 units)
      const balanceInSmallestUnit = parseInt(balanceResponse, 10);
      const balance = balanceInSmallestUnit / 1_000_000;
      return balance;
    } catch (error) {
      console.error('Failed to parse balance:', error);
      return 0;
    }
  }

  /**
   * Start automatic balance refresh
   */
  private startBalanceRefresh(): void {
    if (this.balanceCheckInterval) {
      clearInterval(this.balanceCheckInterval);
    }

    this.balanceCheckInterval = setInterval(() => {
      this.refreshBalance();
    }, MIDNIGHT_CONFIG.BALANCE_REFRESH_INTERVAL);
  }

  /**
   * Submit ZK proof to Midnight Network
   */
  async submitProofToMidnight(proofData: ZKProofData): Promise<TransactionResult> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!window.cardano?.lace) {
      throw new Error(ERROR_MESSAGES.LACE_NOT_DETECTED);
    }

    try {
      console.log('📝 Submitting ZK proof to Midnight Network...');
      console.log('Proof Hash:', proofData.proofHash);
      console.log('Study ID:', proofData.studyId);
      console.log('Hospital ID:', proofData.hospitalId);

      const laceAPI = await window.cardano.lace.enable();

      // In a real implementation, this would:
      // 1. Construct a Compact contract transaction
      // 2. Call the submitMedicalProof circuit
      // 3. Include the ZK proof and public signals
      // 4. Sign the transaction with Lace
      // 5. Submit to Midnight Network

      // For now, we'll simulate the transaction
      // TODO: Replace with real Compact contract interaction
      const txHash = `midnight_tx_${Date.now()}_${this.randomHex(16)}`;
      const blockNumber = Math.floor(Math.random() * 50000) + 1500000;

      console.log('✅ Proof submitted successfully');
      console.log('Transaction Hash:', txHash);
      console.log('Block Number:', blockNumber);

      return {
        success: true,
        transactionHash: txHash,
        blockNumber,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        explorerUrl: `${MIDNIGHT_CONFIG.EXPLORER_BASE_URL}/tx/${txHash}`,
      };
    } catch (error: any) {
      console.error('Proof submission failed:', error);
      
      if (error.code === 2) {
        throw new Error(ERROR_MESSAGES.TRANSACTION_REJECTED);
      }
      
      throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
  }

  /**
   * Verify proof on Midnight Network
   */
  async verifyProofOnMidnight(proofHash: string): Promise<boolean> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🔍 Verifying proof on Midnight Network...');
      console.log('Proof Hash:', proofHash);

      // TODO: Implement actual proof verification via Compact contract
      // This would query the contract's registeredProofs ledger

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isVerified = true; // Simulated result
      console.log(isVerified ? '✅ Proof verified' : '❌ Proof not verified');

      return isVerified;
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }

  /**
   * Authorize hospital
   */
  async authorizeHospital(hospitalId: string): Promise<void> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🏥 Authorizing hospital:', hospitalId);

      // TODO: Implement actual hospital authorization via Compact contract
      // This would call the authorizeHospital circuit

      // Simulate authorization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Hospital authorized');
    } catch (error) {
      console.error('Hospital authorization failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet address (short format for display)
   */
  getShortAddress(): string | null {
    if (!this.state.walletAddress) return null;
    
    const addr = this.state.walletAddress;
    return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: MidnightState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state
   */
  getState(): MidnightState {
    return this.state;
  }

  /**
   * Generate random hex string
   */
  private randomHex(length: number): string {
    return Array.from({ length: length / 2 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// Export singleton instance
const midnightWalletService = new MidnightWalletService();
export default midnightWalletService;

