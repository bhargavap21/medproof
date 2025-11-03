export const BLOCKCHAIN_CONFIG = {
  // Sepolia testnet (easier for development - no local blockchain needed)
  NETWORK_ID: 11155111, // Sepolia testnet
  RPC_URL: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  
  // Alternative: Local development network (uncomment if using local blockchain)
  // NETWORK_ID: 1337,
  // RPC_URL: 'http://127.0.0.1:8545',
  
  // Contract addresses (placeholder for testnet - would need actual deployed contract)
  MEDICAL_RESEARCH_REGISTRY: '0x0000000000000000000000000000000000000000', // Placeholder
  
  // Test accounts (WARNING: These are publicly known keys - never use in production!)
  TEST_ACCOUNTS: {
    DEPLOYER: {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
    },
    HOSPITAL_1: {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 
      privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
    },
    HOSPITAL_2: {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
    },
    HOSPITAL_3: {
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
    }
  }
};

// Hospital ID to blockchain address mapping
export const HOSPITAL_ADDRESS_MAP: { [key: string]: string } = {
  'hosp_001': BLOCKCHAIN_CONFIG.TEST_ACCOUNTS.HOSPITAL_1.address,
  'hosp_002': BLOCKCHAIN_CONFIG.TEST_ACCOUNTS.HOSPITAL_2.address, 
  'hosp_003': BLOCKCHAIN_CONFIG.TEST_ACCOUNTS.HOSPITAL_3.address,
};