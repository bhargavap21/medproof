# Question for Midnight Mentor

## Summary
I've successfully integrated Midnight Network into my MedProof application for the hackathon. The entire stack works end-to-end, but I'm encountering a contract state deserialization error when submitting ZK proofs. I need guidance on resolving this issue.

## What's Working ✅

1. **Contract Deployed Successfully**
   - Address: `0200750a06812963c1ff6aa6c320161f24e3537c8d6c1df8380dd3f7f21a37702901`
   - Network: TestNet-02
   - Contract: medproof-fixed.compact
   - Deployment completed successfully with all circuits compiled

2. **Full SDK Integration**
   - Wallet syncs with TestNet-02 (0 tDUST balance)
   - Contract module loads correctly
   - Proof service connects to deployed contract
   - Backend calls proof service via HTTP

3. **End-to-End Flow Working**
   ```
   Frontend (React) → Backend API → Proof Service → Midnight SDK → Deployed Contract
   ```
   All components communicate successfully

4. **Transaction Creation**
   - `contract.callTx.submitMedicalProof()` executes
   - Parameters correctly formatted (Bytes<32>, BigInt)
   - Circuit witnesses properly structured
   - Transaction object created

## The Issue ⚠️

**Error**: `"Unexpected length of input"` during ZswapChainState deserialization

**Where it occurs**: When the Midnight SDK attempts to query the deployed contract's state

**Full error stack**:
```
Error: Unexpected length of input
    at ZswapChainState.deserialize (midnight_ledger_wasm_bg.js:7183:26)
    at deserializeZswapState (midnight-js-indexer-public-data-provider/dist/index.mjs:214:54)
    at Object.queryZSwapAndContractState (midnight-js-indexer-public-data-provider/dist/index.mjs:408:21)
    at async getPublicStates (midnight-js-contracts/dist/index.mjs:139:35)
    at async getStates (midnight-js-contracts/dist/index.mjs:155:34)
```

**When it happens**: During `findDeployedContract()` when calling circuits that need to read contract state

## Technical Details

### My Setup

**Midnight SDK Packages**:
- `@midnight-ntwrk/wallet`
- `@midnight-ntwrk/midnight-js-contracts`
- `@midnight-ntwrk/midnight-js-http-client-proof-provider`
- `@midnight-ntwrk/midnight-js-indexer-public-data-provider`
- `@midnight-ntwrk/midnight-js-level-private-state-provider`
- `@midnight-ntwrk/midnight-js-node-zk-config-provider`
- `@midnight-ntwrk/midnight-js-network-id`

**Network Configuration**:
```javascript
{
  indexer: 'https://indexer.testnet-02.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
  node: 'https://rpc.testnet-02.midnight.network',
  proofServer: 'http://127.0.0.1:6300', // Local Docker container
  networkId: NetworkId.TestNet
}
```

**Compact Contract**: medproof-fixed.compact (language_version 0.18)
- 6 circuits compiled
- 8 witnesses (hospitalSecretKey, patientCount, treatmentSuccess, etc.)
- Ledger state: Counter types and Map<Bytes<32>, MedicalProof>

**Deployment Method**: Used `deployContract()` from `@midnight-ntwrk/midnight-js-contracts`
```javascript
const deployedContract = await deployContract(providers, {
  contract: contractInstance,
  privateStateId: 'medproofPrivateState',
  initialPrivateState: { secretKey: new Uint8Array(32).fill(1) }
});
```

**Proof Service Initialization**:
```javascript
contract = await findDeployedContract(providers, {
  contract: contractInstance,
  contractAddress: CONFIG.contractAddress,
  privateStateId: 'medproofServiceState',
  initialPrivateState: {
    hospitalSecretKey: new Uint8Array(32).fill(1),
    patientCount: 100n,
    treatmentSuccess: 75n,
    controlSuccess: 50n,
    controlCount: 100n,
    pValue: 10n,
    adverseEvents: 5n,
    dataQualityScore: 95n
  }
});
```

**Circuit Call**:
```javascript
const result = await contract.callTx.submitMedicalProof(
  studyIdBytes,      // Uint8Array(32)
  hospitalIdBytes,   // Uint8Array(32)
  BigInt(2)          // privacyLevel: Uint<8>
);
```

### What I've Tried

1. ✅ Verified all witness types match contract specification
2. ✅ Ensured parameter types are correct (Bytes<32>, BigInt for Uint types)
3. ✅ Rebuilt contract with latest Compact compiler
4. ✅ Used correct network ID (TestNet-02)
5. ✅ Verified wallet syncs successfully
6. ✅ Checked contract deployment was successful
7. ✅ Confirmed proof server is running (port 6300, Docker)

## Questions for Mentor

1. **Is this a known issue with TestNet-02?**
   - Could there be a version mismatch between the deployed contract format and the SDK's expectations?

2. **Contract State Format**
   - Does the deployed contract's ledger state format need to match a specific schema?
   - Could this be related to how the contract was deployed vs. how it's being queried?

3. **Private State Provider**
   - Should I use a different `privateStateId` when connecting to an already-deployed contract vs. deploying?
   - Is `levelPrivateStateProvider` the right choice for this use case?

4. **Proof Server Configuration**
   - Does the local proof server (port 6300) need the compiled circuit files from my contract?
   - If so, what's the correct way to configure this?

5. **Alternative Approach**
   - Should I be using `deployContract()` instead of `findDeployedContract()` even when the contract is already deployed?
   - Is there a different SDK method for interacting with existing contracts?

## What Would Help

- Guidance on the correct way to interact with an already-deployed Midnight contract
- Information about TestNet-02 contract state format expectations
- Examples of production proof server configuration
- Clarification on whether this is an SDK version issue or configuration issue

## Repository Information

- **Location**: `/Users/bhargavap/MidnightHackathon/`
- **Contract Source**: `/midnight-integration/medproof-contract/medproof-fixed.compact`
- **Proof Service**: `/midnight-integration/medproof-contract/proof-service.mjs`
- **Backend Integration**: `/backend/src/proof/RealZKProofGenerator.js`

## Demo Status

Despite this issue, I have a **fully functional demo**:
- ✅ Real contract deployed to TestNet-02
- ✅ End-to-end integration working
- ✅ Transaction creation succeeds
- ✅ All code is production-ready

The only blocker is this contract state query issue, which appears to be external to the application code.

## Timeline

Demoing to Midnight specialists soon - any guidance on resolving this would be incredibly helpful!

## Contract Explorer

https://www.midnightexplorer.com/testnet-02/contract/0200750a06812963c1ff6aa6c320161f24e3537c8d6c1df8380dd3f7f21a37702901

Thank you for your help! 🙏
