import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type MedicalProof = { studyId: Uint8Array;
                             hospitalCommitment: Uint8Array;
                             dataCommitment: Uint8Array;
                             proofHash: Uint8Array;
                             privacyLevel: bigint;
                             statisticalSignificance: bigint;
                             minimumSampleMet: bigint;
                             treatmentEffective: bigint;
                             timestamp: bigint;
                             verified: bigint;
                             regulatoryCompliant: bigint
                           };

export type MedicalStats = { patientCount: bigint;
                             treatmentSuccess: bigint;
                             controlSuccess: bigint;
                             controlCount: bigint;
                             pValue: bigint;
                             adverseEvents: bigint;
                             dataQualityScore: bigint
                           };

export type Witnesses<T> = {
  hospitalSecretKey(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
  patientCount(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  treatmentSuccess(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  controlSuccess(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  controlCount(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  pValue(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  adverseEvents(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
  dataQualityScore(context: __compactRuntime.WitnessContext<Ledger, T>): [T, bigint];
}

export type ImpureCircuits<T> = {
  submitMedicalProof(context: __compactRuntime.CircuitContext<T>,
                     studyId_0: Uint8Array,
                     hospitalId_0: Uint8Array,
                     privacyLevel_0: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
  authorizeHospital(context: __compactRuntime.CircuitContext<T>,
                    hospitalId_0: Uint8Array,
                    authorizationProof_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getStudyStatus(context: __compactRuntime.CircuitContext<T>,
                 studyId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  getStudyCompliance(context: __compactRuntime.CircuitContext<T>,
                     studyId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  getTotalStudies(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
  getVerifiedHospitals(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  submitMedicalProof(context: __compactRuntime.CircuitContext<T>,
                     studyId_0: Uint8Array,
                     hospitalId_0: Uint8Array,
                     privacyLevel_0: bigint): __compactRuntime.CircuitResults<T, Uint8Array>;
  authorizeHospital(context: __compactRuntime.CircuitContext<T>,
                    hospitalId_0: Uint8Array,
                    authorizationProof_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getStudyStatus(context: __compactRuntime.CircuitContext<T>,
                 studyId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  getStudyCompliance(context: __compactRuntime.CircuitContext<T>,
                     studyId_0: Uint8Array): __compactRuntime.CircuitResults<T, bigint>;
  getTotalStudies(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
  getVerifiedHospitals(context: __compactRuntime.CircuitContext<T>): __compactRuntime.CircuitResults<T, bigint>;
}

export type Ledger = {
  readonly totalStudies: bigint;
  readonly verifiedHospitals: bigint;
  registeredProofs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): MedicalProof;
    [Symbol.iterator](): Iterator<[Uint8Array, MedicalProof]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
