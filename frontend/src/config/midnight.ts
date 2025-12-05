/**
 * Midnight Network Configuration
 * 
 * This configuration connects the frontend to Midnight Network (testnet)
 * and the deployed Compact contract for privacy-preserving medical research.
 */

export const MIDNIGHT_CONFIG = {
  // Network Configuration
  NETWORK: 'testnet' as const,
  NETWORK_ID: 'midnight-testnet-1',
  
  // RPC Endpoints
  RPC_URL: 'https://rpc.testnet.midnight.network',
  INDEXER_URL: 'https://indexer.testnet.midnight.network',
  
  // Proof Server
  PROOF_SERVER_URL: 'https://proof-server.testnet.midnight.network',
  // Alternative: Local proof server
  // PROOF_SERVER_URL: 'http://localhost:6300',
  
  // Contract Configuration
  // This will be updated after deploying the Compact contract
  CONTRACT_ADDRESS: 'midnight1_placeholder_will_update_after_deployment',
  CONTRACT_NAME: 'medproof',
  
  // Wallet Configuration
  WALLET_ADDRESS_PREFIX: 'mn_shield-addr_test1',
  
  // Explorer URLs
  EXPLORER_BASE_URL: 'https://explorer.midnight.network/testnet',
  
  // Connection Settings
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  TRANSACTION_TIMEOUT: 120000, // 2 minutes (ZK proofs take time)
  
  // Polling Intervals
  BALANCE_REFRESH_INTERVAL: 30000, // 30 seconds
  TRANSACTION_CHECK_INTERVAL: 5000, // 5 seconds
  
  // Gas/Fee Configuration
  DEFAULT_GAS_LIMIT: 1000000,
  MAX_FEE_MULTIPLIER: 1.5,
};

/**
 * Lace Wallet Configuration
 */
export const LACE_WALLET_CONFIG = {
  // Lace extension detection
  EXTENSION_ID: 'lace-wallet',
  DETECTION_TIMEOUT: 3000, // 3 seconds
  
  // Connection
  AUTO_CONNECT: true, // Auto-connect if previously connected
  PERSIST_CONNECTION: true,
  
  // Supported networks
  SUPPORTED_NETWORKS: ['testnet', 'mainnet'] as const,
};

/**
 * Hospital ID to Midnight Address Mapping
 * 
 * In production, these would be dynamically fetched from the backend
 * or stored in the smart contract itself.
 */
export const HOSPITAL_MIDNIGHT_ADDRESS_MAP: { [key: string]: string } = {
  'hosp_001': 'mn_shield-addr_test1_hospital_001_placeholder',
  'hosp_002': 'mn_shield-addr_test1_hospital_002_placeholder',
  'hosp_003': 'mn_shield-addr_test1_hospital_003_placeholder',
};

/**
 * Explorer URL builders
 */
export const getTransactionUrl = (txHash: string): string => {
  return `${MIDNIGHT_CONFIG.EXPLORER_BASE_URL}/tx/${txHash}`;
};

export const getContractUrl = (contractAddress: string): string => {
  return `${MIDNIGHT_CONFIG.EXPLORER_BASE_URL}/contract/${contractAddress}`;
};

export const getAddressUrl = (address: string): string => {
  return `${MIDNIGHT_CONFIG.EXPLORER_BASE_URL}/address/${address}`;
};

/**
 * Network display names
 */
export const NETWORK_NAMES = {
  testnet: 'Midnight Testnet',
  mainnet: 'Midnight Mainnet',
  local: 'Local Development',
} as const;

/**
 * Token configuration
 */
export const TOKEN_CONFIG = {
  NATIVE_TOKEN: {
    symbol: 'DUST',
    decimals: 18,
    name: 'Midnight DUST',
  },
  TESTNET_TOKEN: {
    symbol: 'tDUST',
    decimals: 18,
    name: 'Testnet DUST',
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  LACE_NOT_INSTALLED: 'Lace Wallet is not installed. Please install it from the Chrome Web Store.',
  LACE_NOT_DETECTED: 'Unable to detect Lace Wallet. Please refresh the page or check your extensions.',
  WRONG_NETWORK: 'Please switch to Midnight Testnet in your Lace Wallet.',
  CONNECTION_REJECTED: 'Wallet connection was rejected. Please try again.',
  TRANSACTION_REJECTED: 'Transaction was rejected by user.',
  INSUFFICIENT_BALANCE: 'Insufficient tDUST balance to complete this transaction.',
  CONTRACT_NOT_DEPLOYED: 'Contract not yet deployed. Please contact the administrator.',
  PROOF_GENERATION_FAILED: 'Failed to generate zero-knowledge proof. Please try again.',
  TRANSACTION_FAILED: 'Transaction failed. Please check the explorer for details.',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Lace Wallet connected successfully!',
  TRANSACTION_SUBMITTED: 'Transaction submitted to Midnight Network!',
  PROOF_GENERATED: 'Zero-knowledge proof generated successfully!',
  PROOF_VERIFIED: 'Proof verified on blockchain!',
};

export default MIDNIGHT_CONFIG;

