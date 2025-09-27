import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { BLOCKCHAIN_CONFIG, HOSPITAL_ADDRESS_MAP } from '../config/blockchain';

export interface Web3State {
  isConnected: boolean;
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  networkId: number | null;
}

const CONTRACT_ABI = [
  "function submitProof(bytes32 proofHash, string studyType, string condition, uint256 sampleSizeMin, uint256 sampleSizeMax, uint256 effectivenessMin, uint256 effectivenessMax, bytes zkProof) external",
  "function verifyProof(bytes32 proofHash) external view returns (bool)",
  "function getProof(bytes32 proofHash) external view returns (tuple(address hospital, string studyType, string condition, uint256 timestamp, bool verified))",
  "function authorizeHospital(address hospital) external",
  "function isAuthorizedHospital(address hospital) external view returns (bool)",
  "event ProofSubmitted(bytes32 indexed proofHash, address indexed hospital, string studyType, string condition)"
];

class Web3Service {
  private state: Web3State = {
    isConnected: false,
    account: null,
    provider: null,
    signer: null,
    contract: null,
    networkId: null,
  };

  private listeners: ((state: Web3State) => void)[] = [];

  async initialize(): Promise<Web3State> {
    try {
      // Wait a bit for MetaMask to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const ethereum = await detectEthereumProvider({ timeout: 3000 });
      
      if (!ethereum && !window.ethereum) {
        console.warn('MetaMask not detected. Web3 features will be limited.');
        return this.state;
      }

      const ethereumProvider = ethereum || window.ethereum;
      const provider = new ethers.BrowserProvider(ethereumProvider as any);
      const network = await provider.getNetwork();
      
      this.state = {
        ...this.state,
        provider,
        networkId: Number(network.chainId),
      };

      if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.NETWORK_ID) {
        await this.switchNetwork();
      }

      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        await this.connectWallet();
      }

      this.setupEventListeners();
      return this.state;
    } catch (error) {
      console.error('Web3 initialization failed:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<Web3State> {
    try {
      // Try to detect MetaMask if not already initialized
      if (!this.state.provider) {
        await this.initialize();
      }

      if (!this.state.provider && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        this.state.provider = provider;
      }

      if (!this.state.provider) {
        throw new Error('MetaMask not found. Please install MetaMask browser extension and refresh the page.');
      }

      // Check if we're on the correct network
      const network = await this.state.provider.getNetwork();
      if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.NETWORK_ID) {
        console.log(`Switching to correct network (${BLOCKCHAIN_CONFIG.NETWORK_ID})...`);
        await this.switchNetwork();
      }

      await this.state.provider.send('eth_requestAccounts', []);
      const signer = await this.state.provider.getSigner();
      const account = await signer.getAddress();

      const contract = new ethers.Contract(
        BLOCKCHAIN_CONFIG.MEDICAL_RESEARCH_REGISTRY,
        CONTRACT_ABI,
        signer
      );

      this.state = {
        ...this.state,
        isConnected: true,
        account,
        signer,
        contract,
      };

      this.notifyListeners();
      return this.state;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.state = {
      ...this.state,
      isConnected: false,
      account: null,
      signer: null,
      contract: null,
    };
    this.notifyListeners();
  }

  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not available');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BLOCKCHAIN_CONFIG.NETWORK_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BLOCKCHAIN_CONFIG.NETWORK_ID.toString(16)}`,
            chainName: 'Sepolia Test Network',
            rpcUrls: [BLOCKCHAIN_CONFIG.RPC_URL],
            nativeCurrency: {
              name: 'Sepolia Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
          }],
        });
      } else {
        throw error;
      }
    }
  }

  async submitProofToBlockchain(
    proofHash: string,
    studyType: string,
    condition: string,
    sampleSize: number,
    effectiveness: number,
    zkProof: any
  ): Promise<{ transactionHash: string; blockNumber: number }> {
    if (!this.state.contract || !this.state.isConnected) {
      throw new Error('Wallet not connected or contract not initialized');
    }

    try {
      const proofHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(proofHash));
      const zkProofBytes = ethers.toUtf8Bytes(JSON.stringify(zkProof));

      const effectivenessRange = Math.floor(effectiveness / 10) * 10;

      const transaction = await this.state.contract.submitProof(
        proofHashBytes32,
        studyType,
        condition,
        sampleSize - 50,
        sampleSize + 50,
        effectivenessRange,
        effectivenessRange + 10,
        zkProofBytes
      );

      const receipt = await transaction.wait();
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Proof submission failed:', error);
      throw error;
    }
  }

  async verifyProofOnBlockchain(proofHash: string): Promise<boolean> {
    if (!this.state.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const proofHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(proofHash));
      return await this.state.contract.verifyProof(proofHashBytes32);
    } catch (error) {
      console.error('Proof verification failed:', error);
      return false;
    }
  }

  async authorizeHospital(hospitalId: string): Promise<void> {
    if (!this.state.contract || !this.state.isConnected) {
      throw new Error('Wallet not connected or contract not initialized');
    }

    const hospitalAddress = HOSPITAL_ADDRESS_MAP[hospitalId];
    if (!hospitalAddress) {
      throw new Error('Hospital address not found');
    }

    try {
      const transaction = await this.state.contract.authorizeHospital(hospitalAddress);
      await transaction.wait();
    } catch (error) {
      console.error('Hospital authorization failed:', error);
      throw error;
    }
  }

  isHospitalAuthorized(hospitalId: string): boolean {
    const hospitalAddress = HOSPITAL_ADDRESS_MAP[hospitalId];
    return hospitalAddress === this.state.account;
  }

  getHospitalIdForAddress(address: string): string | null {
    for (const [hospitalId, hospitalAddress] of Object.entries(HOSPITAL_ADDRESS_MAP)) {
      if (hospitalAddress.toLowerCase() === address.toLowerCase()) {
        return hospitalId;
      }
    }
    return null;
  }

  private setupEventListeners(): void {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else if (accounts[0] !== this.state.account) {
        this.connectWallet();
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }

  subscribe(callback: (state: Web3State) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): Web3State {
    return this.state;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const web3Service = new Web3Service();
export default web3Service;