# Step-by-Step Reproduction Instructions

## Issue Summary
The `proof-service.mjs` successfully deploys and connects to a Midnight contract, but when it tries to submit proofs via `contract.callTx.submitMedicalProof()`, it encounters a 400 Bad Request error from the proof server due to circuit complexity (21MB circuit).

## Deployed Contract Details

- **Contract Address**: `02007ec2c2f2289ca262b57eac28f2e9233ccdbb26cea7f51c476008e4f84ab4b379`
- **Network**: TestNet-02
- **Contract File**: `midnight-integration/medproof-contract/boilerplate/contract/src/medproof-mvp.compact`

## Artifacts Structure

The project uses the Midnight boilerplate structure with artifacts managed in nested folders:

```
midnight-integration/medproof-contract/
├── boilerplate/
│   └── contract/
│       ├── src/
│       │   ├── medproof-mvp.compact           # Source Compact contract
│       │   └── managed/
│       │       └── medproof-mvp/              # Generated TypeScript (src artifacts)
│       │           └── index.ts
│       └── dist/
│           ├── medproof-mvp.compact           # Compiled contract copy
│           ├── witnesses.js                   # Witness definitions
│           └── managed/
│               ├── managed/                   # Nested managed folder (confusing!)
│               └── medproof-mvp/              # Compiled artifacts
│                   └── [compiled contract files]
├── proof-service.mjs                          # Service that calls findDeployedContract()
└── deploy-sdk-minimal.mjs                     # Deployment script
```

**Note**: The proof-service currently has a **path mismatch**:
- It tries to load from: `boilerplate/contract/dist/managed/medproof/contract/index.cjs` (line 109)
- But artifacts are in: `boilerplate/contract/dist/managed/medproof-mvp/`

## Prerequisites

1. Node.js 18+
2. Midnight Network wallet with tDUST (from faucet)
3. Local proof server running on `http://127.0.0.1:6300` OR accept 400 errors

## Step-by-Step Reproduction

### Step 1: Install Dependencies

```bash
cd /Users/bhargavap/MidnightHackathon/midnight-integration/medproof-contract
npm install
```

### Step 2: Configure Environment

Create/update `.env` file in the `medproof-contract` directory:

```bash
MIDNIGHT_PRIVATE_KEY=your_wallet_seed_here
MIDNIGHT_CONTRACT_ADDRESS=02007ec2c2f2289ca262b57eac28f2e9233ccdbb26cea7f51c476008e4f84ab4b379
```

### Step 3: Verify Contract Compilation

The contract should already be compiled. Verify artifacts exist:

```bash
ls -la boilerplate/contract/dist/managed/medproof-mvp/
```

You should see the compiled contract artifacts.

### Step 4: Start Proof Service

```bash
node proof-service.mjs
```

**Expected Output:**
```
🌙 Midnight Proof Service - REAL ON-CHAIN INTEGRATION
══════════════════════════════════════════════════════════════════════
🚀 Midnight Proof Service running on port 3002
📍 Contract: 02007ec2c2f2289ca262b57eac28f2e9233ccdbb26cea7f51c476008e4f84ab4b379
🌐 Network: TestNet-02
💰 Proof Server: http://127.0.0.1:6300

📦 Building wallet...
✅ Wallet synced: tmXXXXXXXX
   Balance: 10000000 tDUST

📄 Loading contract...
```

**Issue occurs here**: The service tries to load the contract from the wrong path.

### Step 5: Fix the Path Mismatch (Current Issue #1)

In `proof-service.mjs` line 109, change:

```javascript
// Current (wrong):
const contractPath = path.join(__dirname, 'boilerplate/contract/dist/managed/medproof/contract/index.cjs');

// Should be:
const contractPath = path.join(__dirname, 'boilerplate/contract/dist/managed/medproof-mvp/contract/index.cjs');
```

Also update line 128:

```javascript
// Current (wrong):
const zkConfigPath = path.join(__dirname, 'boilerplate/contract/src/managed/medproof');

// Should be:
const zkConfigPath = path.join(__dirname, 'boilerplate/contract/src/managed/medproof-mvp');
```

### Step 6: Restart and Connect to Contract

After fixing the paths, restart the service:

```bash
node proof-service.mjs
```

**Expected Output (if successful):**
```
🔗 Connecting to deployed contract...
✅ CONNECTED TO DEPLOYED CONTRACT!
══════════════════════════════════════════════════════════════════════
```

### Step 7: Test Proof Submission

Send a POST request to test proof generation:

```bash
curl -X POST http://localhost:3002/submit-proof \
  -H "Content-Type: application/json" \
  -d '{
    "privateData": {
      "patientCount": 100,
      "treatmentSuccess": 75,
      "controlSuccess": 50,
      "controlCount": 100,
      "pValue": 10,
      "adverseEvents": 5,
      "dataQualityScore": 95
    },
    "publicMetadata": {
      "studyId": "test_study_001",
      "hospitalId": "hospital_001",
      "privacyLevel": 2
    }
  }'
```

**Issue occurs here (Issue #2):** The proof server returns 400 Bad Request because the circuit is too complex (21MB).

## The findDeployedContract() Issue

In `proof-service.mjs` lines 153-158:

```javascript
contract = await findDeployedContract(providers, {
  contract: contractInstance,
  contractAddress: CONFIG.contractAddress,
  privateStateId: 'medproofServiceState',
  initialPrivateState
});
```

### What We're Passing:

1. **providers**: Object with all required providers (privateState, publicData, zkConfig, proof, wallet, midnight)
2. **contractInstance**: Instance of the Contract class with witnesses
3. **contractAddress**: `02007ec2c2f2289ca262b57eac28f2e9233ccdbb26cea7f51c476008e4f84ab4b379`
4. **privateStateId**: Unique identifier for this contract's private state
5. **initialPrivateState**: Initial values for the private state variables

### Current Behavior:

If the path mismatch is fixed, `findDeployedContract()` successfully connects, but then when we call:

```javascript
await contract.callTx.submitMedicalProof(studyIdBytes, hospitalIdBytes, privacyLevel)
```

It attempts to generate a ZK proof via the proof server, which returns:
```
400 Bad Request - Circuit too complex (21MB)
```

### Expected Behavior:

The circuit should either:
1. Be optimized to be smaller
2. Use a remote proof server with more capacity
3. Have the 400 error handled gracefully (we added a demo fallback for this)

## Quick Test Without Backend

To test just the proof service in isolation:

```bash
# Terminal 1: Start proof service
cd midnight-integration/medproof-contract
node proof-service.mjs

# Terminal 2: Test with curl (after service is ready)
curl -X POST http://localhost:3002/submit-proof \
  -H "Content-Type: application/json" \
  -d '{"privateData":{"patientCount":100,"treatmentSuccess":75,"controlSuccess":50,"controlCount":100,"pValue":10,"adverseEvents":5,"dataQualityScore":95},"publicMetadata":{"studyId":"test","hospitalId":"test","privacyLevel":2}}'
```

## Full Stack Test (Frontend → Backend → Proof Service)

```bash
# Terminal 1: Start proof service
cd midnight-integration/medproof-contract
node proof-service.mjs

# Terminal 2: Start backend
cd backend
PORT=3001 node src/index.js

# Terminal 3: Start frontend
cd frontend
npm start

# Browser: Visit http://localhost:3000
# Click "Generate Proof" for any study
```

## Key Files to Review

1. **Contract**: `boilerplate/contract/src/medproof-mvp.compact` (68 lines)
2. **Proof Service**: `proof-service.mjs` (lines 107-158 for loading/connecting)
3. **Witnesses**: Lines 113-122 in proof-service.mjs
4. **findDeployedContract call**: Lines 153-158 in proof-service.mjs

## Questions for Review

1. Is the artifacts folder structure correct? (the nested `managed/managed/` seems odd)
2. Should `zkConfigPath` point to `src/managed/medproof-mvp` or `dist/managed/medproof-mvp`?
3. Is the `initialPrivateState` format correct for the contract's private state?
4. Are the witness functions correctly accessing `privateState.patientCount` etc.?

## Contract Source (medproof-mvp.compact)

```compact
circuit submitMedicalProof(
  const studyId: Bytes<32>,
  const hospitalId: Bytes<32>,
  const privacyLevel: Ledger.Nat
) {
  const ^hospitalSecretKey = witness(Bytes<32>);
  const ^patientCount = witness(Ledger.Nat);
  const ^treatmentSuccess = witness(Ledger.Nat);
  const ^controlSuccess = witness(Ledger.Nat);
  const ^controlCount = witness(Ledger.Nat);
  const ^pValue = witness(Ledger.Nat);
  const ^adverseEvents = witness(Ledger.Nat);
  const ^dataQualityScore = witness(Ledger.Nat);

  // FDA-compliant validation constraints
  assert(patientCount >= 50n);           // Minimum sample size
  assert(pValue <= 50n);                 // p < 0.05 (scaled by 1000)
  assert(treatmentSuccess * controlCount > controlSuccess * (patientCount - controlCount)); // Treatment superiority
  assert(dataQualityScore >= 80n);       // Data quality threshold
  assert(adverseEvents * 100n < patientCount * 10n); // Adverse events < 10%

  // Store proof on-chain
  studyProofs[studyId] = {
    hospitalId,
    privacyLevel,
    proofExists: true
  };
  totalProofs = totalProofs + 1n;
}
```

This contract requires witness data that gets validated through the ZK circuit, which is what creates the 21MB complexity.
