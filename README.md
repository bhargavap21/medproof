# MedProof: Privacy-Preserving Medical Research Platform

## Overview

MedProof is a zero-knowledge proof platform that enables hospitals to collaborate on medical research without exposing patient data. Hospitals generate cryptographic proofs about their research findings that can be verified and aggregated by researchers without revealing underlying patient information.

## Architecture

- **Midnight Network**: Privacy-preserving blockchain using Compact smart contracts
- **Compact Contracts**: Zero-knowledge circuits for medical statistics verification and proof registration
- **ZK Proof Generation**: Real ZK-SNARKs via Midnight Network's submitMedicalProof circuit
- **Frontend**: React dashboard for hospitals and researchers with real-time Midnight Network status
- **Backend**: Node.js API integrating with Midnight Network for FHIR and proof generation
- **Synthetic Data**: Realistic medical data generation for demonstrations

## Quick Start

```bash
# Install dependencies
npm install

# Start development environment
npm run dev

# Compile smart contracts
npm run compile:contracts

# Deploy contracts (requires local blockchain)
npm run deploy:contracts
```

## Project Structure

```
medproof/
├── contracts/          # Smart contracts
├── circuits/           # ZK circuits
├── frontend/           # React dashboard
├── backend/            # Node.js API
└── docs/              # Documentation
```

## Key Features

- **Privacy-Preserving**: Zero-knowledge proofs protect patient data
- **FHIR Compatible**: Works with existing healthcare systems
- **Multi-Hospital**: Aggregate research across institutions
- **Verifiable**: Cryptographic proof of research integrity
- **Compliant**: HIPAA-compliant data handling

## Demo Scenarios

1. Diabetes treatment efficacy study across 3 hospitals
2. Population health research with demographic diversity
3. Drug safety analysis with statistical significance proofs