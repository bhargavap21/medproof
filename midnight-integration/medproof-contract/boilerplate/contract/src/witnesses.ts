import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';

// Get __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the only folder inside ./managed
const managedPath = path.join(__dirname, 'managed');
const [folder] = fs.readdirSync(managedPath).filter(f =>
  fs.statSync(path.join(managedPath, f)).isDirectory()
);

// Dynamically import the contract
const { Ledger } = await import(`./managed/${folder}/contract/index.cjs`);

export type MedProofPrivateState = {
  readonly hospitalSecretKey: Uint8Array;
  readonly patientCount: bigint;
  readonly treatmentSuccess: bigint;
  readonly controlSuccess: bigint;
  readonly controlCount: bigint;
  readonly pValue: bigint;
  readonly adverseEvents: bigint;
  readonly dataQualityScore: bigint;
};

export const createMedProofPrivateState = (
  hospitalSecretKey: Uint8Array,
  patientCount: bigint = 0n,
  treatmentSuccess: bigint = 0n,
  controlSuccess: bigint = 0n,
  controlCount: bigint = 0n,
  pValue: bigint = 0n,
  adverseEvents: bigint = 0n,
  dataQualityScore: bigint = 0n
): MedProofPrivateState => ({
  hospitalSecretKey,
  patientCount,
  treatmentSuccess,
  controlSuccess,
  controlCount,
  pValue,
  adverseEvents,
  dataQualityScore
});

export const witnesses = {
  hospitalSecretKey: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, Uint8Array] => {
    return [privateState, privateState.hospitalSecretKey];
  },
  patientCount: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.patientCount];
  },
  treatmentSuccess: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.treatmentSuccess];
  },
  controlSuccess: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.controlSuccess];
  },
  controlCount: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.controlCount];
  },
  pValue: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.pValue];
  },
  adverseEvents: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.adverseEvents];
  },
  dataQualityScore: ({ privateState }: WitnessContext<typeof Ledger, MedProofPrivateState>): [MedProofPrivateState, bigint] => {
    return [privateState, privateState.dataQualityScore];
  },
};
