#!/usr/bin/env node

/**
 * MedProof Minimal SDK Deployment Script
 * Based on KYC Midnight's direct SDK approach
 * Bypasses the broken boilerplate entirely
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Import Midnight SDK packages (like KYC Midnight does)
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import { Transaction } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { webcrypto } from 'crypto';
import * as Rx from 'rxjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const projectRoot = path.resolve(__dirname);
dotenv.config({ path: path.join(projectRoot, '.env') });

console.log('\n🌙 MedProof Minimal SDK Deployment');
console.log('═'.repeat(70));
console.log('Based on KYC Midnight\'s direct SDK approach\n');

// Configuration
const TESTNET_CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  networkId: NetworkId.TestNet
};

// Check prerequisites
const walletSeed = process.env.MIDNIGHT_PRIVATE_KEY || process.env.WALLET_MNEMONIC || process.env.WALLET_SEED;
if (!walletSeed) {
  console.error('❌ MIDNIGHT_PRIVATE_KEY, WALLET_MNEMONIC, or WALLET_SEED not found in .env');
  process.exit(1);
}
const contractManagedPath = path.join(projectRoot, 'boilerplate', 'contract', 'src', 'managed', 'medproof');

if (!existsSync(contractManagedPath)) {
  console.error('❌ Contract not compiled!');
  console.error('Run: export PATH="/Users/bhargavap/.local/bin:$PATH" && compact compile medproof.compact boilerplate/contract/src/managed/medproof');
  process.exit(1);
}

console.log('✅ Prerequisites:');
console.log(`   Wallet Seed: ${walletSeed.substring(0, 16)}...`);
console.log(`   Contract: ${contractManagedPath}`);
console.log(`   Network: ${TESTNET_CONFIG.indexer}`);
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

async function deploy() {
  try {
    console.log('🚀 Starting deployment...\n');

    // Step 1: Set network ID
    setNetworkId(TESTNET_CONFIG.networkId);
    console.log('✅ Network ID set to TestNet');

    // Step 2: Build wallet from seed (like KYC Midnight)
    console.log('\n📦 Building wallet from seed...');
    
    const wallet = await WalletBuilder.buildFromSeed(
      TESTNET_CONFIG.indexer,
      TESTNET_CONFIG.indexerWS,
      TESTNET_CONFIG.proofServer,
      TESTNET_CONFIG.node,
      walletSeed,
      getZswapNetworkId(),
      'info'
    );
    
    wallet.start();
    console.log('✅ Wallet built and started');

    // Step 3: Wait for wallet to sync
    await waitForSync(wallet);
    const state = await Rx.firstValueFrom(wallet.state());
    console.log(`✅ Wallet synced: ${state.address}`);
    console.log(`   Balance: ${state.balances['0'] ?? 0n} tDUST`);

    // Step 4: Import compiled contract
    console.log('\n📄 Importing compiled contract...');
    
    // Dynamic import of the contract module
    const contractModulePath = path.join(contractManagedPath, 'contract', 'index.cjs');
    if (!existsSync(contractModulePath)) {
      throw new Error(`Contract module not found: ${contractModulePath}`);
    }

    const { contracts, witnesses } = await import('@midnight-ntwrk/contract');
    console.log('✅ Contract module imported');

    // Get the contract instance (like KYC Midnight does)
    const contractModule = contracts[Object.keys(contracts)[0]];
    if (!contractModule) {
      throw new Error('No contract found in contracts object');
    }
    const contractInstance = new contractModule.Contract(witnesses);
    console.log(`✅ Contract instance created: ${Object.keys(contracts)[0]}`);

    // Step 5: Configure providers (like KYC Midnight)
    console.log('\n🔧 Configuring providers...');
    const walletAndMidnightProvider = await createWalletAndMidnightProvider(wallet);
    
    const providers = {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'medproof-private-state'
      }),
      publicDataProvider: indexerPublicDataProvider(TESTNET_CONFIG.indexer, TESTNET_CONFIG.indexerWS),
      zkConfigProvider: new NodeZkConfigProvider(contractManagedPath),
      proofProvider: httpClientProofProvider(TESTNET_CONFIG.proofServer),
      walletProvider: walletAndMidnightProvider,
      midnightProvider: walletAndMidnightProvider
    };
    console.log('✅ Providers configured');

    // Step 6: Deploy contract (like KYC Midnight)
    console.log('\n🚀 Deploying contract to Midnight testnet...');
    console.log('   This may take a few minutes...');
    
    const deployedContract = await deployContract(providers, {
      contract: contractInstance,
      privateStateId: 'medproofPrivateState',
      initialPrivateState: { secretKey: new Uint8Array(32).fill(1) }
    });

    const contractAddress = deployedContract.deployTxData.public.contractAddress;
    console.log('\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!');
    console.log('═'.repeat(70));
    console.log(`\n📍 Contract Address: ${contractAddress}`);
    console.log(`\n🔗 View on Explorer:`);
    console.log(`   https://explorer.midnight.network/testnet/contract/${contractAddress}`);
    console.log('\n💾 Update your .env files with:');
    console.log(`   MIDNIGHT_CONTRACT_ADDRESS=${contractAddress}`);
    console.log('\n═'.repeat(70));

    // Cleanup
    wallet.close();

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run deployment
deploy().catch(console.error);

