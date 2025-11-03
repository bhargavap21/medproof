# Study Request Interface Implementation Plan

## Overview
This plan implements a comprehensive Study Request Interface that transforms medical research matching from a manual, opaque process into an automated, transparent marketplace leveraging ZK proofs for data integrity.

## Phase 1: Database Schema & Backend Foundation (Week 1-2)

### 1.1 Database Schema Extension
```sql
-- Extend existing database with new tables
CREATE TABLE study_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  study_type study_type_enum NOT NULL,
  therapeutic_area VARCHAR(100) NOT NULL,
  condition_data JSONB NOT NULL, -- {icd10Code, description, severity}
  protocol_data JSONB NOT NULL, -- Full protocol specification
  requirements JSONB NOT NULL, -- Sample size, timeline, budget
  researcher_info JSONB NOT NULL,
  status request_status_enum DEFAULT 'draft',
  estimated_costs JSONB, -- Cost breakdown from multiple hospitals
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hospital_capacity_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  condition_icd10 VARCHAR(10) NOT NULL,
  patient_count_commitment BYTEA NOT NULL, -- ZK commitment to patient count
  capacity_proof_hash VARCHAR(64) NOT NULL, -- ZK proof hash
  demographic_breakdown JSONB NOT NULL,
  last_verified TIMESTAMP NOT NULL,
  proof_expiry TIMESTAMP NOT NULL
);

CREATE TABLE study_hospital_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_request_id UUID NOT NULL,
  hospital_id UUID NOT NULL,
  bid_amount DECIMAL(12,2) NOT NULL,
  estimated_timeline_months INTEGER NOT NULL,
  capacity_proof JSONB NOT NULL, -- ZK proof data
  hospital_proposal JSONB NOT NULL, -- Detailed proposal
  match_score DECIMAL(4,2) NOT NULL,
  bid_status bid_status_enum DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

### 1.2 Backend Services Architecture
```typescript
// Core services to implement
interface StudyRequestService {
  createStudyRequest(data: StudyRequestForm): Promise<StudyRequest>;
  validateStudyRequest(data: StudyRequestForm): Promise<ValidationResult>;
  generateCostEstimates(request: StudyRequest): Promise<CostEstimate[]>;
  updateRequestStatus(id: string, status: RequestStatus): Promise<void>;
}

interface HospitalMatchingService {
  findEligibleHospitals(request: StudyRequest): Promise<HospitalMatch[]>;
  generateCapacityProofs(hospitalId: string, request: StudyRequest): Promise<CapacityProof>;
  calculateMatchScore(hospital: Hospital, request: StudyRequest): Promise<number>;
  notifyHospitalsOfRequest(requestId: string, hospitalIds: string[]): Promise<void>;
}

interface CostEstimationEngine {
  calculateBaseCosts(request: StudyRequest): Promise<BaseCostFactors>;
  getHospitalPricingMultipliers(hospitalId: string): Promise<PricingFactors>;
  generateCostBreakdown(request: StudyRequest, hospital: Hospital): Promise<CostBreakdown>;
}
```

## Phase 2: Backend API Implementation (Week 2-3)

### 2.1 Study Request API Endpoints
```typescript
// Add to existing backend/src/index.js

// Create study request
app.post('/api/study-requests', authenticate, async (req, res) => {
  try {
    const { studyRequestData } = req.body;
    const researcherId = req.user.id;

    // Validate request data
    const validation = await studyRequestService.validateStudyRequest(studyRequestData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Create study request
    const studyRequest = await studyRequestService.createStudyRequest({
      ...studyRequestData,
      researcherId,
      status: 'draft'
    });

    // Generate initial cost estimates
    const costEstimates = await costEstimationEngine.generateCostEstimates(studyRequest);

    // Find matching hospitals
    const hospitalMatches = await hospitalMatchingService.findEligibleHospitals(studyRequest);

    // Update request with estimates
    await studyRequestService.updateCostEstimates(studyRequest.id, costEstimates);

    res.json({
      success: true,
      studyRequest: {
        id: studyRequest.id,
        status: studyRequest.status,
        costEstimates,
        potentialHospitals: hospitalMatches.length
      }
    });
  } catch (error) {
    console.error('Error creating study request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hospital matches for study request
app.get('/api/study-requests/:requestId/matches', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Verify user owns this request
    const studyRequest = await studyRequestService.getById(requestId);
    if (studyRequest.researcherId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Get hospital matches with ZK proofs
    const matches = await hospitalMatchingService.getMatchesForRequest(requestId);

    // Generate capacity proofs for each match
    const matchesWithProofs = await Promise.all(
      matches.map(async (match) => {
        const capacityProof = await hospitalMatchingService.generateCapacityProof(
          match.hospitalId,
          studyRequest
        );

        return {
          ...match,
          capacityProof: {
            verified: capacityProof.isValid,
            patientCountRange: capacityProof.patientCountRange, // e.g., "100-200"
            proofHash: capacityProof.commitmentHash
          }
        };
      })
    );

    res.json({
      success: true,
      matches: matchesWithProofs,
      totalMatches: matchesWithProofs.length
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 2.2 Hospital Capacity Proof Service
```typescript
// Add to backend/src/services/HospitalCapacityService.js
const StudyCommitmentGenerator = require('../proof/StudyCommitmentGenerator');

class HospitalCapacityService {
  constructor() {
    this.commitmentGenerator = new StudyCommitmentGenerator();
  }

  async generateCapacityProof(hospitalId, studyRequest) {
    console.log(`🔍 Generating capacity proof for hospital ${hospitalId}`);

    // Get hospital's patient data (anonymized counts)
    const hospitalCapacity = await this.getHospitalCapacity(hospitalId, studyRequest.protocol.condition.icd10Code);

    if (!hospitalCapacity) {
      throw new Error('Hospital capacity data not found');
    }

    // Generate ZK commitment to patient count without revealing exact number
    const capacityCommitment = {
      hospitalId,
      conditionCode: studyRequest.protocol.condition.icd10Code,
      patientCountCommitment: this.generatePatientCountCommitment(hospitalCapacity.patientCount),
      demographicProof: this.generateDemographicProof(hospitalCapacity.demographics),
      timestamp: Date.now()
    };

    // Create deterministic hash
    const proofHash = this.commitmentGenerator.generateCommitmentHash(capacityCommitment);

    return {
      isValid: hospitalCapacity.patientCount >= studyRequest.requirements.sampleSize,
      patientCountRange: this.getCountRange(hospitalCapacity.patientCount),
      commitmentHash: proofHash,
      proofData: capacityCommitment,
      verifiedAt: new Date().toISOString()
    };
  }

  generatePatientCountCommitment(actualCount) {
    // Generate commitment that proves count >= required without revealing exact count
    const range = this.getCountRange(actualCount);
    return crypto.createHash('sha256')
      .update(`${range}:${Date.now()}`)
      .digest('hex');
  }

  getCountRange(count) {
    // Return range instead of exact count for privacy
    if (count < 50) return '0-50';
    if (count < 100) return '50-100';
    if (count < 200) return '100-200';
    if (count < 500) return '200-500';
    return '500+';
  }

  async getHospitalCapacity(hospitalId, conditionCode) {
    // Query hospital's patient database (mocked for now)
    return {
      hospitalId,
      conditionCode,
      patientCount: 150, // This would come from real hospital data
      demographics: {
        ageDistribution: { '18-30': 20, '31-50': 45, '51-70': 60, '70+': 25 },
        genderDistribution: { male: 45, female: 55 },
        severityDistribution: { mild: 40, moderate: 35, severe: 25 }
      },
      lastUpdated: new Date()
    };
  }
}
```

## Phase 3: Frontend Components (Week 3-4)

### 3.1 Study Request Wizard Component
```typescript
// frontend/src/components/study-request/StudyRequestWizard.tsx
import React, { useState, useEffect } from 'react';
import { StudyRequestForm, StudyRequestStep } from '../../types/StudyRequest';

const StudyRequestWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudyRequestForm>({
    basicInfo: {},
    protocol: {},
    requirements: {},
    budget: {},
    timeline: {}
  });
  const [costEstimates, setCostEstimates] = useState<CostEstimate[]>([]);
  const [hospitalMatches, setHospitalMatches] = useState<HospitalMatch[]>([]);

  const steps = [
    { id: 1, title: 'Basic Information', component: BasicInfoStep },
    { id: 2, title: 'Protocol Design', component: ProtocolDesignStep },
    { id: 3, title: 'Requirements', component: RequirementsStep },
    { id: 4, title: 'Budget & Timeline', component: BudgetTimelineStep },
    { id: 5, title: 'Review & Submit', component: ReviewSubmitStep }
  ];

  const handleStepComplete = async (stepNumber: number, stepData: any) => {
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);

    // Auto-generate cost estimates after step 3
    if (stepNumber === 3) {
      try {
        const estimates = await generateCostEstimates(updatedFormData);
        setCostEstimates(estimates);
      } catch (error) {
        console.error('Error generating cost estimates:', error);
      }
    }

    setCurrentStep(stepNumber + 1);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/study-requests', {
        studyRequestData: formData
      });

      if (response.data.success) {
        // Redirect to study request dashboard
        window.location.href = `/study-requests/${response.data.studyRequest.id}`;
      }
    } catch (error) {
      console.error('Error submitting study request:', error);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep > step.id ? 'bg-green-500 text-white' :
                  currentStep === step.id ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'}
              `}>
                {currentStep > step.id ? '✓' : step.id}
              </div>
              <div className="ml-3 text-sm">
                <div className={`font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-6 h-0.5 w-16 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step component */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {CurrentStepComponent && (
          <CurrentStepComponent
            data={formData}
            costEstimates={costEstimates}
            hospitalMatches={hospitalMatches}
            onNext={handleStepComplete}
            onBack={() => setCurrentStep(Math.max(1, currentStep - 1))}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};
```

## Phase 4: Integration & Testing (Week 4-5)

### 4.1 Integration with Existing Systems
```typescript
// Integrate with existing StudyCommitmentGenerator
// frontend/src/hooks/useStudyRequest.tsx
import { useAPI } from './useAPI';
import { StudyCommitmentGenerator } from '../services/StudyCommitmentGenerator';

export const useStudyRequest = () => {
  const api = useAPI();
  const commitmentGenerator = new StudyCommitmentGenerator();

  const createStudyRequest = async (formData: StudyRequestForm) => {
    try {
      // Generate study commitment for the request
      const studyCommitment = await commitmentGenerator.generateRequestCommitment(formData);

      // Submit to backend with commitment
      const response = await api.post('/api/study-requests', {
        studyRequestData: formData,
        studyCommitment
      });

      return response.data;
    } catch (error) {
      console.error('Error creating study request:', error);
      throw error;
    }
  };

  const getHospitalMatches = async (requestId: string) => {
    try {
      const response = await api.get(`/api/study-requests/${requestId}/matches`);
      return response.data.matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
  };

  return {
    createStudyRequest,
    getHospitalMatches
  };
};
```

## Phase 5: Hospital Dashboard Integration (Week 5-6)

### 5.1 Hospital Bid Management
```typescript
// frontend/src/components/hospital/StudyRequestBids.tsx
const StudyRequestBids: React.FC = () => {
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myBids, setMyBids] = useState([]);

  useEffect(() => {
    loadAvailableRequests();
    loadMyBids();
  }, []);

  const submitBid = async (requestId: string, bidData: BidData) => {
    try {
      // Generate capacity proof
      const capacityProof = await generateCapacityProof(requestId);

      const response = await api.post(`/api/study-requests/${requestId}/bids`, {
        ...bidData,
        capacityProof
      });

      if (response.data.success) {
        toast.success('Bid submitted successfully!');
        loadMyBids();
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Study Request Opportunities</h1>

      {/* Available Requests */}
      <div className="grid gap-6">
        {availableRequests.map(request => (
          <StudyRequestCard
            key={request.id}
            request={request}
            onSubmitBid={submitBid}
          />
        ))}
      </div>
    </div>
  );
};
```

## Implementation Timeline Summary

**Week 1-2: Backend Foundation**
- Database schema implementation
- Core service architecture
- ZK proof integration for hospital capacity

**Week 3-4: Frontend Components**
- Study Request Wizard implementation
- Protocol design interface
- Cost estimation display

**Week 4-5: Integration & Testing**
- Connect with existing MedProof systems
- StudyCommitmentGenerator integration
- Comprehensive testing

**Week 5-6: Hospital Dashboard**
- Hospital bid management
- Capacity proof generation
- Match scoring algorithm

**Week 6-7: Polish & Deployment**
- UI/UX refinements
- Performance optimization
- Production deployment

## Key Benefits

1. **Automated Matching**: Like "Uber for medical research" - instant hospital discovery
2. **Fraud Prevention**: ZK proofs prevent hospitals from lying about patient capacity
3. **Transparent Pricing**: Competitive bidding drives fair market rates
4. **Fast Study Launch**: Weeks instead of months to start research
5. **Quality Assurance**: Platform tracks hospital performance and study outcomes

This implementation leverages the existing StudyCommitmentGenerator system and extends the MedProof platform with a comprehensive study request marketplace that maintains privacy through ZK proofs while enabling transparent, competitive bidding between researchers and hospitals.