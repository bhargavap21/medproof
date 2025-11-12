#!/usr/bin/env node

/**
 * Interact with Deployed MedProof Contract
 * Based on Midnight SDK best practices
 *
 * This script demonstrates how to:
 * 1. Connect to your deployed contract
 * 2. Submit a medical proof (call submitMedicalProof circuit)
 * 3. Query contract state
 * 4. Verify transactions on-chain
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Import Midnight SDK packages
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import * as Rx from 'rxjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const projectRoot = path.resolve(__dirname);
dotenv.config({ path: path.join(projectRoot, '.env') });

console.log('\n🌙 MedProof Contract Interaction');
console.log('═'.repeat(70));

// Configuration from deployment
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  networkId: NetworkId.TestNet
};

// Your deployed contract address
const CONTRACT_ADDRESS = process.env.MIDNIGHT_CONTRACT_ADDRESS || '02007ec2c2f2289ca262b57eac28f2e9233ccdbb26cea7f51c476008e4f84ab4b379';
const WALLET_SEED = process.env.MIDNIGHT_PRIVATE_KEY || process.env.WALLET_MNEMONIC || process.env.WALLET_SEED;

if (!WALLET_SEED) {
  console.error('❌ MIDNIGHT_PRIVATE_KEY not found in .env');
  process.exit(1);
}

const contractManagedPath = path.join(projectRoot, 'boilerplate', 'contract', 'src', 'managed', 'medproof');

console.log('📍 Contract Configuration:');
console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);
console.log(`   Network: TestNet-02`);
console.log(`   Indexer: ${TESTNET_CONFIG.indexer}`);
console.log('');

// Helper: Wait for wallet to sync
async function waitForSync(wallet) {
  console.log('⏳ Waiting for wallet to sync...');
  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5000),
      Rx.tap((state) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        console.log(`   Backend lag: ${sourceGap}, wallet lag: ${applyGap}`);
      }),
      Rx.filter((state) => state.syncProgress !== undefined && state.syncProgress.synced)
    )
  );
}

// Helper: Create wallet and midnight provider
async function createWalletAndMidnightProvider(wallet) {
  const state = await Rx.firstValueFrom(wallet.state());
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    async balanceTx(tx, newCoins) {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(tx.serialize(getLedgerNetworkId()), getZswapNetworkId()),
          newCoins
        )
        .then((tx) => wallet.proveTransaction(tx))
        .then((zswapTx) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()))
        .then(createBalancedTx);
    },
    async submitTx(tx) {
      return wallet.submitTransaction(tx);
    }
  };
}

async function interactWithContract() {
  try {
    console.log('🚀 Starting contract interaction...\n');

    // Step 1: Set network ID
    setNetworkId(TESTNET_CONFIG.networkId);
    console.log('✅ Network ID set to TestNet');

    // Step 2: Build wallet
    console.log('\n📦 Building wallet...');
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      WALLET_SEED,
      getZswapNetworkId(),
      'info'
    );

    wallet.start();
    console.log('✅ Wallet started');

    // Step 3: Wait for sync
    await waitForSync(wallet);
    const state = await Rx.firstValueFrom(wallet.state());
    console.log(`✅ Wallet synced: ${state.address}`);
    console.log(`   Balance: ${state.balances['0'] ?? 0n} tDUST`);

    // Step 4: Load contract module
    console.log('\n📄 Loading contract module...');
    const { contracts, witnesses } = await import('@midnight-ntwrk/contract');
    const contractModule = contracts[Object.keys(contracts)[0]];
    if (!contractModule) {
      throw new Error('No contract found in contracts object');
    }
    const contractInstance = new contractModule.Contract(witnesses);
    console.log(`✅ Contract loaded: ${Object.keys(contracts)[0]}`);

    // Step 5: Configure providers
    console.log('\n🔧 Configuring providers...');
    const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);

    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'medproof-interaction-state'
      }),
      publicDataProvider: indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS),
      zkConfigProvider: new NodeZkConfigProvider(contractManagedPath),
      proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
      walletProvider: walletAndMidnightProvider,
      midnightProvider: walletAndMidnightProvider
    };
    console.log('✅ Providers configured');

    // Step 6: Find deployed contract
    console.log('\n🔍 Finding deployed contract...');
    console.log(`   Contract Address: ${CONTRACT_ADDRESS}`);

    const deployedContract = await findDeployedContract(providers, {
      contract: contractInstance,
      contractAddress: CONTRACT_ADDRESS,
      privateStateId: 'medproofInteractionPrivateState'
    });

    console.log('✅ Connected to deployed contract!');
    console.log(`   Address: ${deployedContract.deployTxData.public.contractAddress}`);

    // Step 7: Call contract circuit (submitMedicalProof)
    console.log('\n🔐 Submitting Medical Proof to Contract...');
    console.log('─'.repeat(70));

    // Example medical proof data
    const medicalProof = {
      studyId: 1n,
      hospitalId: 1n,
      patientCount: 100n,
      treatmentSuccess: 75n,
      controlSuccess: 50n,
      controlCount: 50n,
      pValue: 25n, // 0.025 (scaled)
      privacyLevel: 2n
    };

    console.log('📊 Proof Data:');
    console.log(`   Study ID: ${medicalProof.studyId}`);
    console.log(`   Hospital ID: ${medicalProof.hospitalId}`);
    console.log(`   Patient Count: ${medicalProof.patientCount}`);
    console.log(`   Treatment Success: ${medicalProof.treatmentSuccess}`);
    console.log(`   Control Success: ${medicalProof.controlSuccess}`);
    console.log(`   P-Value: 0.0${medicalProof.pValue}`);

    // Call the submitMedicalProof circuit
    console.log('\n⚙️  Calling submitMedicalProof circuit...');
    console.log('   This will generate a zero-knowledge proof...');

    // Note: The exact API depends on your contract's circuit definition
    // This is a typical pattern for calling circuits in Midnight
    const result = await deployedContract.callTxPipe(
      'submitMedicalProof',
      {
        studyId: medicalProof.studyId,
        hospitalId: medicalProof.hospitalId,
        patientCount: medicalProof.patientCount,
        treatmentSuccess: medicalProof.treatmentSuccess,
        controlSuccess: medicalProof.controlSuccess,
        controlCount: medicalProof.controlCount,
        pValue: medicalProof.pValue,
        privacyLevel: medicalProof.privacyLevel
      }
    );

    console.log('\n✅ Medical Proof Submitted Successfully!');
    console.log('─'.repeat(70));
    console.log('📋 Transaction Details:');
    console.log(`   Transaction submitted to Midnight Network`);
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`\n🔗 View on Explorer:`);
    console.log(`   https://explorer.midnight.network/testnet/contract/${CONTRACT_ADDRESS}`);
    console.log('─'.repeat(70));

    // Step 8: Query contract state (if available)
    console.log('\n📊 Querying Contract State...');
    try {
      // Example: Get total studies (if your contract has a public state query)
      // const totalStudies = await deployedContract.queryState('totalStudies');
      // console.log(`   Total Studies: ${totalStudies}`);
      console.log('   (State queries depend on your contract design)');
    } catch (err) {
      console.log('   No public state queries available');
    }

    // Cleanup
    console.log('\n🔒 Closing wallet...');
    wallet.close();
    console.log('✅ Done!');

  } catch (error) {
    console.error('\n❌ Interaction failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run interaction
interactWithContract().catch(console.error);
