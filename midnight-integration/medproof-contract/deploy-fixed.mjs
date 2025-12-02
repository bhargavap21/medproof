#!/usr/bin/env node

/**
 * MedProof Fixed Deployment Script
 * Deploys the full-featured medproof-fixed contract
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { NetworkId, setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { getLedgerNetworkId, getZswapNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Transaction } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import * as Rx from 'rxjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('\n🌙 MedProof Fixed Deployment');
console.log('═'.repeat(70));

const CONFIG = {
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  proofServer: 'http://127.0.0.1:6300',
  networkId: NetworkId.TestNet
};

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

async function createProvider(wallet) {
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
        .then((zswapTx) => Transaction.deserialize(zswapTx.serialize(getZswapNetworkId()), getLedgerNetworkId()));
    }
  };
}

async function main() {
  // Set network ID FIRST
  setNetworkId(CONFIG.networkId);

  const walletSeed = process.env.MIDNIGHT_PRIVATE_KEY || process.env.WALLET_MNEMONIC;
  if (!walletSeed) {
    console.error('❌ MIDNIGHT_PRIVATE_KEY or WALLET_MNEMONIC not found in .env');
    process.exit(1);
  }

  // Load medproof-fixed contract
  const zkConfigPath = path.join(__dirname, 'boilerplate/contract/src/managed/medproof-fixed');
  const contractPath = path.join(zkConfigPath, 'contract/index.cjs');

  console.log(`📄 Contract: ${contractPath}`);
  console.log(`🔑 ZK Config: ${zkConfigPath}\n`);

  const contractModule = await import(contractPath);

  // medproof-fixed witnesses (all 8)
  const witnesses = {
    hospitalSecretKey: ({ privateState }) => [privateState, privateState.hospitalSecretKey],
    patientCount: ({ privateState }) => [privateState, privateState.patientCount],
    treatmentSuccess: ({ privateState }) => [privateState, privateState.treatmentSuccess],
    controlSuccess: ({ privateState }) => [privateState, privateState.controlSuccess],
    controlCount: ({ privateState }) => [privateState, privateState.controlCount],
    pValue: ({ privateState }) => [privateState, privateState.pValue],
    adverseEvents: ({ privateState }) => [privateState, privateState.adverseEvents],
    dataQualityScore: ({ privateState }) => [privateState, privateState.dataQualityScore],
  };

  const contractInstance = new contractModule.Contract(witnesses);

  // Build wallet
  console.log('📦 Building wallet...');
  const wallet = await WalletBuilder.buildFromSeed(
    CONFIG.indexer,
    CONFIG.indexerWS,
    CONFIG.proofServer,
    'https://rpc.testnet-02.midnight.network',
    walletSeed,
    getZswapNetworkId(),
    'error'
  );

  wallet.start();
  await waitForSync(wallet);

  const state = await Rx.firstValueFrom(wallet.state());
  console.log(`✅ Wallet synced: ${state.address}`);
  console.log(`   Balance: ${state.balances['0'] ?? 0n} tDUST\n`);

  // Setup providers
  const provider = await createProvider(wallet);
  const providers = {
    privateStateProvider: levelPrivateStateProvider({ privateStateStoreName: 'medproof-deployment' }),
    publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(CONFIG.proofServer),
    walletProvider: provider,
    midnightProvider: provider
  };

  // Deploy
  console.log('🚀 Deploying medproof-fixed contract...\n');

  const deployment = await deployContract(providers, {
    contract: contractInstance,
    initialPrivateState: {
      hospitalSecretKey: new Uint8Array(32).fill(1),
      patientCount: 0n,
      treatmentSuccess: 0n,
      controlSuccess: 0n,
      controlCount: 0n,
      pValue: 0n,
      adverseEvents: 0n,
      dataQualityScore: 0n
    }
  });

  console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
  console.log('═'.repeat(70));
  console.log(`📍 Contract Address: ${deployment.deployTxData.public.contractAddress}`);
  console.log('\nUpdate your .env file:');
  console.log(`MIDNIGHT_CONTRACT_ADDRESS=${deployment.deployTxData.public.contractAddress}`);
  console.log('═'.repeat(70));

  process.exit(0);
}

main().catch(console.error);
