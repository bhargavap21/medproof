export interface Hospital {
  id: string;
  name: string;
  location: string;
  type: 'academic' | 'community' | 'regional';
  size: 'small' | 'medium' | 'large';
  specialties: string[];
  activeStudies?: number;
  totalPatients?: number;
  lastActivity?: string;
}

export interface Patient {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  ethnicity: string;
  insurance: string;
  condition: string;
  enrollmentDate: string;
  followUpMonths: number;
}

export interface StudyOutcome {
  patientId: string;
  group: 'treatment' | 'control';
  outcome: 'improved' | 'no-improvement';
  baselineScore: number;
  followUpScore: number;
  adherence: number;
  sideEffects: string[];
}

export interface StudyStatistics {
  treatmentSuccessRate: number;
  controlSuccessRate: number;
  treatmentN: number;
  controlN: number;
  effectSize: number;
  pValue: number;
  confidenceInterval: {
    lowerBound: number;
    upperBound: number;
  };
}

export interface StudyOutcomes {
  cohortId: string;
  treatmentOutcomes: StudyOutcome[];
  controlOutcomes: StudyOutcome[];
  statistics: StudyStatistics;
}

export interface Cohort {
  hospitalId: string;
  hospitalName: string;
  studyId: string;
  condition: string;
  treatment: string;
  patients: Patient[];
  studyStartDate: string;
  studyEndDate: string;
  metadata: {
    totalPatients: number;
    averageAge: number;
    genderDistribution: Record<string, number>;
    ethnicityDistribution: Record<string, number>;
  };
}

export interface ZKProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: number[];
  metadata: {
    studyType: string;
    hospitalName?: string;
    hospitalId?: string;
    condition?: string;
    treatment?: string;
    efficacyRate: number;
    sampleSize: number;
    pValue: number;
    timestamp: string;
    proofHash?: string;
  };
}

export interface StudySite {
  hospital: Hospital;
  cohort: Cohort;
  outcomes: StudyOutcomes;
  zkProof?: ZKProof;
}

export interface MultiSiteStudy {
  studyId: string;
  condition: string;
  treatment: string;
  sites: StudySite[];
  aggregateStats: {
    totalSites: number;
    totalTreatmentN: number;
    totalControlN: number;
    aggregateTreatmentRate: number;
    aggregateControlRate: number;
    effectSize: number;
    pValue: number;
    heterogeneity: number;
  };
  timestamp: string;
}

export interface StudyDataset {
  name: string;
  study: MultiSiteStudy;
}

export interface FHIRConnection {
  connected: boolean;
  hospitalId: string;
  hospitalName?: string;
  fhirVersion?: string;
  supportedResources?: Array<{
    type: string;
    interactions: string[];
    searchParams: string[];
  }>;
  timestamp: string;
  error?: string;
}

export interface ResearchCriteria {
  condition: string;
  ageMin?: number;
  ageMax?: number;
  maxPatients?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AggregateResults {
  studyType: string;
  condition: string;
  aggregateStats: {
    totalHospitals: number;
    totalMinSamples: number;
    averageEfficacy: number;
    significantResults: number;
    overallPValue: number;
    confidenceLevel: number;
  };
  verifiedProofs: number;
  timestamp: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  // Direct properties for backward compatibility
  hospitals?: Hospital[];
  totalHospitals?: number;
  studies?: StudyDataset[];
  totalStudies?: number;
  proof?: ZKProof;
  proofHash?: string;
  connection?: FHIRConnection;
}

export interface ProofGenerationRequest {
  studyData: {
    patientCount: number;
    treatmentSuccess: number;
    controlSuccess: number;
    controlCount: number;
    pValue: number;
  };
  studyType?: string;
  hospitalId?: string;
}