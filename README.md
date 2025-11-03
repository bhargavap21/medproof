# MedProof: Privacy-Preserving Medical Research Platform

## Overview

MedProof is a zero-knowledge proof platform that enables hospitals to collaborate on medical research without exposing patient data. Hospitals generate cryptographic proofs about their research findings that can be verified and aggregated by researchers without revealing underlying patient information.

## Architecture

- **Smart Contracts**: Solidity contracts for proof registration and verification
- **ZK Circuits**: Zero-knowledge circuits for medical statistics verification
- **Frontend**: React dashboard for hospitals and researchers
- **Backend**: Node.js API for FHIR integration and proof generation
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