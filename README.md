# MedProof: Privacy-Preserving Medical Research Platform

## Overview

MedProof is a zero-knowledge proof platform built on Midnight Network that enables hospitals to collaborate on medical research without exposing patient data. Hospitals generate cryptographic proofs about their research findings that can be verified and aggregated by researchers without revealing underlying patient information.

## Architecture

- **Midnight Network**: Privacy-preserving blockchain (TestNet-02)
- **Compact Smart Contracts**: Zero-knowledge circuits written in Compact language for medical statistics verification
- **ZK Proof Generation**: Real ZK-SNARKs via Midnight Network's proof server
- **Frontend**: React dashboard for hospitals and researchers with Midnight Network integration
- **Backend**: Node.js API integrating with Midnight proof service
- **Proof Service**: Standalone service handling Midnight SDK interactions

## Prerequisites

- Node.js 18+ and npm
- Midnight Network Lace Wallet (for interacting with deployed contracts)
- Midnight Network TestNet-02 access

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install Midnight contract dependencies
cd midnight-integration/medproof-contract && npm install && cd ../..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
# Midnight Network Configuration
MIDNIGHT_RPC_ENDPOINT=https://rpc.testnet-02.midnight.network
MIDNIGHT_INDEXER=https://indexer.testnet-02.midnight.network/api/v1/graphql
MIDNIGHT_CONTRACT_ADDRESS=your_deployed_contract_address
MIDNIGHT_PRIVATE_KEY=your_wallet_seed
MIDNIGHT_NETWORK_ID=testnet-02

# Supabase Configuration (for user authentication)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy Midnight Compact Contract

```bash
cd midnight-integration/medproof-contract

# Compile the Compact contract
npm run compile

# Deploy to Midnight TestNet-02
npm run deploy

# Copy the deployed contract address to your .env file
```

### 4. Run the Application

```bash
# Terminal 1: Start the proof service (port 3002)
cd midnight-integration/medproof-contract
node proof-service.mjs

# Terminal 2: Start the backend (port 3001)
cd backend
PORT=3001 node src/index.js

# Terminal 3: Start the frontend (port 3000)
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
medproof/
├── frontend/                          # React dashboard
│   ├── src/
│   │   ├── components/               # React components
│   │   └── services/                 # API services
│   └── package.json
│
├── backend/                          # Node.js API server
│   ├── src/
│   │   ├── proof/                   # ZK proof generation
│   │   │   └── RealZKProofGenerator.js
│   │   ├── fhir/                    # FHIR data handling
│   │   └── index.js                 # Express server
│   └── package.json
│
├── midnight-integration/             # Midnight Network integration
│   └── medproof-contract/           # Compact smart contract
│       ├── boilerplate/
│       │   └── contract/
│       │       └── src/
│       │           └── medproof-mvp.compact  # Main contract
│       ├── proof-service.mjs        # Midnight SDK service
│       ├── deploy-sdk-minimal.mjs   # Deployment script
│       └── package.json
│
├── database/                         # Supabase migrations
└── README.md
```

## Midnight Network Integration

### Compact Contract

The core contract (`medproof-mvp.compact`) implements:

- **submitMedicalProof**: Circuit for submitting privacy-preserving research proofs
- **Private State**: Hospital secret keys and study data
- **Public State**: Study IDs, hospital IDs, and privacy levels
- **Witnesses**: Zero-knowledge witnesses for circuit constraints

### Proof Service

The `proof-service.mjs` handles:
- Midnight SDK initialization
- Wallet management
- Contract interaction
- ZK proof generation via Midnight proof server
- Demo fallback for proof server capacity limits

### Backend Integration

The backend (`RealZKProofGenerator.js`) communicates with the proof service via HTTP:
- Formats medical data for Compact contract
- Calls proof service endpoints
- Handles proof verification
- Returns blockchain transaction details

## Key Features

- **Privacy-Preserving**: Zero-knowledge proofs protect patient data using Midnight Network
- **Real On-Chain Transactions**: Deployed on Midnight TestNet-02
- **FHIR Compatible**: Works with existing healthcare data standards
- **Multi-Hospital**: Aggregate research across institutions securely
- **Verifiable**: Cryptographic proof of research integrity
- **FDA Compliance Checks**: Built-in validation for statistical significance and data quality

## Development Workflow

### Compile Compact Contract

```bash
cd midnight-integration/medproof-contract
npm run compile
```

This compiles the Compact contract to JavaScript using the Midnight compiler.

### Test Contract Locally

```bash
cd midnight-integration/medproof-contract
node deploy-sdk-minimal.mjs
```

### Deploy to TestNet

```bash
cd midnight-integration/medproof-contract
npm run deploy
```

## Troubleshooting

### Proof Generation Fails with 400 Error

This is expected - the Midnight proof server has capacity limits for complex circuits. The application includes a demo fallback that shows circuit validation results without generating the full proof.

### Contract Connection Issues

Ensure your `.env` file has the correct contract address and RPC endpoint for TestNet-02.

### Wallet Sync Issues

The proof service needs time to sync the wallet with the blockchain. Wait for the "Wallet synced" message before submitting proofs.

## Documentation

- [Midnight Network Docs](https://docs.midnight.network/)
- [Compact Language Reference](https://docs.midnight.network/develop/compact)
- [Midnight SDK](https://docs.midnight.network/develop/sdk)

## License

MIT
