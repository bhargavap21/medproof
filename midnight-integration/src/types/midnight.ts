// Midnight Network Integration Types for MedProof
import type { Field } from '@midnight-ntwrk/compact-runtime';

// Medical data structures (private inputs)
export interface MedicalStatsInput {
  patientCount: number;
  treatmentSuccess: number;
  controlSuccess: number;
  controlCount: number;
  pValue: number; // Scaled by 1000 (e.g., 0.05 = 50)
}

// Public proof metadata
export interface MedicalProofMetadata {
  studyId: string;
  hospitalId: string;
  studyType: string;
  condition: string;
  timestamp: number;
}

// Zero-knowledge proof result
export interface ZKProofResult {
  proof: any; // ZK-SNARK proof object
  publicSignals: Field[];
  proofHash: string;
  verified: boolean;
}

// Midnight contract interaction interfaces
export interface MidnightContractMethods {
  submitMedicalProof(
    privateData: MedicalStatsInput,
    publicMetadata: MedicalProofMetadata
  ): Promise<ZKProofResult>;
  
  authorizeHospital(
    hospitalId: string,
    authorizationProof: string
  ): Promise<boolean>;
  
  aggregateResults(
    hospitalProofs: string[],
    studyType: string
  ): Promise<{
    totalHospitals: number;
    overallEfficacy: number;
    statisticalSignificance: boolean;
  }>;
  
  getStudyStatus(studyId: string): Promise<{
    verified: boolean;
    timestamp: number;
    exists: boolean;
  }>;
}

// Privacy control settings
export interface PrivacySettings {
  disclosureLevel: 'public' | 'regulatory' | 'research';
  allowPublicStatistics: boolean;
  allowRegulatorAccess: boolean;
  allowResearcherAccess: boolean;
  dataRetentionPeriod: number; // in months
}

// Selective disclosure output
export interface SelectiveDisclosure {
  public: {
    studyExists: boolean;
    statisticallySignificant: boolean;
    treatmentCategory: string;
    participatingHospitals: number;
  };
  regulatory?: {
    sampleSizeRange: string;
    efficacyRange: string;
    complianceAttestations: string[];
    safetySignals: boolean;
  };
  research?: {
    detailedStatistics: any;
    methodologyHash: string;
    peerReviewAccess: boolean;
  };
}

// Multi-hospital aggregation
export interface HospitalContribution {
  hospitalId: string;
  commitment: string;
  proofHash: string;
  verified: boolean;
}

export interface AggregatedResult {
  studyId: string;
  participatingHospitals: HospitalContribution[];
  aggregatedStatistics: {
    totalPatients: number; // Minimum bound only
    overallEfficacy: number;
    confidenceInterval: [number, number];
    pValue: number;
    statisticalPower: number;
  };
  privacyGuarantees: {
    individualHospitalDataHidden: boolean;
    patientDataNeverExposed: boolean;
    zkProofVerified: boolean;
  };
}

// Network configuration
export interface MidnightNetworkConfig {
  networkId: string;
  rpcEndpoint: string;
  contractAddress: string;
  zkConfigProvider: string;
  proofProvider: string;
}

// Wallet integration
export interface MidnightWallet {
  address: string;
  isConnected: boolean;
  networkId: string;
  balance: number;
}