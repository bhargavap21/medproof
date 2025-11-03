export interface StudyRequestForm {
  basicInfo: {
    title: string;
    description: string;
    studyType: 'observational' | 'interventional' | 'survey' | 'registry' | 'diagnostic' | 'prevention';
    therapeuticArea: string;
  };
  protocol: {
    condition: {
      icd10Code: string;
      description: string;
      severity: 'mild' | 'moderate' | 'severe';
    };
    primaryEndpoint: {
      metric: string;
      measurementMethod: string;
      timeframe: string;
    };
    inclusionCriteria: string[];
    exclusionCriteria: string[];
    intervention: {
      type: 'drug' | 'device' | 'procedure' | 'behavioral' | 'none';
      description: string;
      dosage?: string;
    };
  };
  requirements: {
    sampleSize: {
      min: number;
      max: number;
      target: number;
    };
    specialRequirements: string[];
    equipment: string[];
    certifications: string[];
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    duration: number; // months
    startDate: string;
    endDate: string;
  };
  researcherInfo: {
    name: string;
    institution: string;
    credentials: string;
    email: string;
    phone: string;
    previousStudies: string[];
  };
}

export interface StudyRequest {
  id: string;
  researcherId: string;
  title: string;
  description: string;
  studyType: string;
  therapeuticArea: string;
  conditionData: StudyRequestForm['protocol']['condition'];
  protocolData: StudyRequestForm['protocol'];
  requirements: StudyRequestForm['requirements'];
  researcherInfo: StudyRequestForm['researcherInfo'];
  status: 'draft' | 'submitted' | 'review' | 'active' | 'matching' | 'bidding' | 'awarded' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  studyCommitmentHash?: string;
  priorityLevel: number;
  confidentialityLevel: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  expiresAt?: string;
}

export interface HospitalMatch {
  hospitalId: string;
  hospitalName: string;
  score: number;
  isEligible: boolean;
  estimatedCost: number;
  capacityProof: {
    verified: boolean;
    patientCountRange: string;
    proofHash: string;
    confidence: number;
    demographicMatch: number;
  };
  proposal?: {
    timeline: number;
    team: string[];
    facilities: string[];
    experience: string[];
  };
}

export interface StudyBid {
  id: string;
  studyRequestId: string;
  hospitalId: string;
  hospitalName: string;
  bidAmount: number;
  currency: string;
  estimatedTimelineMonths: number;
  capacityProof: any;
  hospitalProposal: any;
  matchScore: number;
  bidStatus: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  submittedAt: string;
  expiresAt: string;
}

export interface CostEstimate {
  hospitalId: string;
  hospitalName: string;
  baseCost: number;
  recruitmentCost: number;
  managementCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
  timeline: number;
  confidence: number;
}