-- Study Request System Database Schema
-- This extends the existing MedProof database with study request marketplace functionality

-- Create enums for type safety
CREATE TYPE study_type_enum AS ENUM (
  'observational',
  'interventional',
  'survey',
  'registry',
  'diagnostic',
  'prevention'
);

CREATE TYPE request_status_enum AS ENUM (
  'draft',
  'submitted',
  'review',
  'active',
  'matching',
  'bidding',
  'awarded',
  'in_progress',
  'completed',
  'cancelled',
  'expired'
);

CREATE TYPE bid_status_enum AS ENUM (
  'pending',
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'withdrawn',
  'expired'
);

CREATE TYPE therapeutic_area_enum AS ENUM (
  'cardiology',
  'oncology',
  'endocrinology',
  'neurology',
  'psychiatry',
  'infectious_disease',
  'gastroenterology',
  'pulmonology',
  'rheumatology',
  'dermatology',
  'ophthalmology',
  'orthopedics',
  'urology',
  'pediatrics',
  'geriatrics',
  'emergency_medicine',
  'anesthesiology',
  'radiology',
  'pathology',
  'other'
);

-- Main study requests table
CREATE TABLE study_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL, -- Foreign key to users table
  title VARCHAR(255) NOT NULL,
  description TEXT,
  study_type study_type_enum NOT NULL,
  therapeutic_area therapeutic_area_enum NOT NULL,

  -- Medical condition information
  condition_data JSONB NOT NULL, -- {icd10Code, description, severity, keywords}

  -- Detailed protocol specification
  protocol_data JSONB NOT NULL, -- {
    -- primaryEndpoint: {metric, measurementMethod, timeframe},
    -- secondaryEndpoints: [{metric, timeframe}],
    -- inclusionCriteria: [string],
    -- exclusionCriteria: [string],
    -- intervention: {type, description, dosage},
    -- studyDesign: {type, blinding, randomization, duration}
  -- }

  -- Study requirements and constraints
  requirements JSONB NOT NULL, -- {
    -- sampleSize: {min, max, target},
    -- timeline: {duration, startDate, endDate},
    -- budget: {min, max, currency},
    -- specialRequirements: [string],
    -- equipment: [string],
    -- certifications: [string]
  -- }

  -- Researcher contact information
  researcher_info JSONB NOT NULL, -- {
    -- name, institution, credentials, email, phone,
    -- previousStudies, expertise, budget
  -- }

  -- Current status and workflow
  status request_status_enum DEFAULT 'draft',

  -- Cost estimates from hospitals
  estimated_costs JSONB, -- {
    -- costRange: {min, max},
    -- breakdown: {recruitment, management, equipment, overhead},
    -- hospitalEstimates: [{hospitalId, estimate, timeline}]
  -- }

  -- Study commitment hash for integrity verification
  study_commitment_hash VARCHAR(64),

  -- Additional metadata
  priority_level INTEGER DEFAULT 1, -- 1-5, 5 being highest
  confidentiality_level VARCHAR(20) DEFAULT 'standard', -- standard, high, maximum

  -- Audit trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  expires_at TIMESTAMP, -- Auto-expire if no activity

  -- Constraints
  CONSTRAINT valid_priority CHECK (priority_level >= 1 AND priority_level <= 5),
  CONSTRAINT valid_confidentiality CHECK (confidentiality_level IN ('standard', 'high', 'maximum'))
);

-- Hospital capacity proofs for ZK verification
CREATE TABLE hospital_capacity_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL, -- Foreign key to hospitals table
  condition_icd10 VARCHAR(10) NOT NULL,

  -- ZK proof components
  patient_count_commitment BYTEA NOT NULL, -- Cryptographic commitment to patient count
  capacity_proof_hash VARCHAR(64) NOT NULL, -- ZK proof hash using StudyCommitmentGenerator
  demographic_breakdown JSONB NOT NULL, -- {age, gender, severity distributions}

  -- Capacity metadata
  minimum_capacity INTEGER NOT NULL, -- Minimum patients they can provide
  maximum_capacity INTEGER, -- Maximum if known
  research_capability JSONB NOT NULL, -- {
    -- maxConcurrentStudies, activeStudies, specializations,
    -- equipment, certifications, experience
  -- }

  -- Verification timestamps
  last_verified TIMESTAMP NOT NULL,
  proof_expiry TIMESTAMP NOT NULL,
  verified_by VARCHAR(100), -- Verification method/authority

  -- Performance metrics
  historical_accuracy DECIMAL(4,2) DEFAULT 0.0, -- Past accuracy of capacity claims
  completion_rate DECIMAL(4,2) DEFAULT 0.0, -- Study completion rate

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_accuracy CHECK (historical_accuracy >= 0.0 AND historical_accuracy <= 100.0),
  CONSTRAINT valid_completion_rate CHECK (completion_rate >= 0.0 AND completion_rate <= 100.0)
);

-- Study-hospital bids and proposals
CREATE TABLE study_hospital_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_request_id UUID NOT NULL REFERENCES study_requests(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL, -- Foreign key to hospitals table

  -- Bid financial details
  bid_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  estimated_timeline_months INTEGER NOT NULL,

  -- ZK proof of capacity for this specific study
  capacity_proof JSONB NOT NULL, -- {
    -- proofHash, patientCountRange, demographicMatch,
    -- verificationTimestamp, confidenceLevel
  -- }

  -- Detailed hospital proposal
  hospital_proposal JSONB NOT NULL, -- {
    -- timeline: {recruitment, execution, analysis},
    -- team: {investigators, coordinators, statisticians},
    -- facilities: {equipment, labs, locations},
    -- experience: {similarStudies, publications, success_rate},
    -- differentiators: [unique capabilities],
    -- riskMitigation: [strategies]
  -- }

  -- Matching and scoring
  match_score DECIMAL(4,2) NOT NULL, -- Algorithm-calculated match score (0-100)
  scoring_breakdown JSONB, -- {capacity, experience, cost, timeline, quality}

  -- Bid status and workflow
  bid_status bid_status_enum DEFAULT 'pending',

  -- Additional terms
  special_terms TEXT, -- Any special conditions or requirements
  payment_terms VARCHAR(100), -- milestone, upfront, completion, etc.

  -- Audit trail
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  expires_at TIMESTAMP, -- Bid expiry

  -- Constraints
  CONSTRAINT valid_timeline CHECK (estimated_timeline_months > 0 AND estimated_timeline_months <= 120),
  CONSTRAINT valid_match_score CHECK (match_score >= 0.0 AND match_score <= 100.0),
  CONSTRAINT positive_bid_amount CHECK (bid_amount > 0)
);

-- Study request templates for reusability
CREATE TABLE study_request_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  therapeutic_area therapeutic_area_enum NOT NULL,

  -- Template data structure
  template_data JSONB NOT NULL, -- Protocol template with placeholders

  -- Usage statistics
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(4,2) DEFAULT 0.0, -- Success rate of studies using this template

  -- Ownership and sharing
  created_by UUID NOT NULL, -- Original creator
  is_public BOOLEAN DEFAULT false, -- Available to all users

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hospital pricing models and multipliers
CREATE TABLE hospital_pricing_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,

  -- Base pricing structure
  base_rate_per_patient DECIMAL(10,2) NOT NULL,
  setup_fee DECIMAL(10,2) DEFAULT 0.0,
  management_fee_percent DECIMAL(5,2) DEFAULT 0.0, -- % of total cost

  -- Complexity multipliers
  therapeutic_area_multipliers JSONB, -- {cardiology: 1.2, oncology: 1.5, etc.}
  study_type_multipliers JSONB, -- {interventional: 1.3, observational: 1.0, etc.}
  timeline_multipliers JSONB, -- {urgent: 1.4, standard: 1.0, flexible: 0.9}

  -- Volume discounts
  volume_discounts JSONB, -- {50: 0.95, 100: 0.90, 200: 0.85} (patient count: multiplier)

  -- Additional fees
  equipment_fees JSONB, -- {mri: 500, ct_scan: 300, etc.}
  certification_fees JSONB, -- {gcp: 1000, fda: 2000, etc.}

  -- Validity and updates
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Study request activity log for audit trail
CREATE TABLE study_request_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_request_id UUID NOT NULL REFERENCES study_requests(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL, -- User who performed the action
  actor_type VARCHAR(20) NOT NULL, -- researcher, hospital, admin, system

  -- Activity details
  action VARCHAR(50) NOT NULL, -- created, submitted, bid_received, awarded, etc.
  description TEXT,
  metadata JSONB, -- Additional context data

  -- System information
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_study_requests_researcher ON study_requests(researcher_id);
CREATE INDEX idx_study_requests_status ON study_requests(status);
CREATE INDEX idx_study_requests_therapeutic_area ON study_requests(therapeutic_area);
CREATE INDEX idx_study_requests_created_at ON study_requests(created_at);
CREATE INDEX idx_study_requests_condition ON study_requests USING GIN (condition_data);
CREATE INDEX idx_study_requests_requirements ON study_requests USING GIN (requirements);

CREATE INDEX idx_hospital_capacity_hospital ON hospital_capacity_proofs(hospital_id);
CREATE INDEX idx_hospital_capacity_condition ON hospital_capacity_proofs(condition_icd10);
CREATE INDEX idx_hospital_capacity_expiry ON hospital_capacity_proofs(proof_expiry);

CREATE INDEX idx_study_bids_study ON study_hospital_bids(study_request_id);
CREATE INDEX idx_study_bids_hospital ON study_hospital_bids(hospital_id);
CREATE INDEX idx_study_bids_status ON study_hospital_bids(bid_status);
CREATE INDEX idx_study_bids_score ON study_hospital_bids(match_score);

CREATE INDEX idx_templates_therapeutic_area ON study_request_templates(therapeutic_area);
CREATE INDEX idx_templates_public ON study_request_templates(is_public);

CREATE INDEX idx_pricing_hospital ON hospital_pricing_models(hospital_id);
CREATE INDEX idx_pricing_active ON hospital_pricing_models(is_active);

CREATE INDEX idx_activity_log_study ON study_request_activity_log(study_request_id);
CREATE INDEX idx_activity_log_actor ON study_request_activity_log(actor_id);
CREATE INDEX idx_activity_log_created ON study_request_activity_log(created_at);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_requests_timestamp
  BEFORE UPDATE ON study_requests
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_hospital_capacity_timestamp
  BEFORE UPDATE ON hospital_capacity_proofs
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_pricing_models_timestamp
  BEFORE UPDATE ON hospital_pricing_models
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Views for common queries
CREATE VIEW study_requests_with_bid_count AS
SELECT
  sr.*,
  COALESCE(bid_stats.bid_count, 0) as bid_count,
  COALESCE(bid_stats.avg_bid_amount, 0) as avg_bid_amount,
  COALESCE(bid_stats.min_bid_amount, 0) as min_bid_amount,
  COALESCE(bid_stats.max_bid_amount, 0) as max_bid_amount
FROM study_requests sr
LEFT JOIN (
  SELECT
    study_request_id,
    COUNT(*) as bid_count,
    AVG(bid_amount) as avg_bid_amount,
    MIN(bid_amount) as min_bid_amount,
    MAX(bid_amount) as max_bid_amount
  FROM study_hospital_bids
  WHERE bid_status NOT IN ('withdrawn', 'expired')
  GROUP BY study_request_id
) bid_stats ON sr.id = bid_stats.study_request_id;

CREATE VIEW hospital_performance_metrics AS
SELECT
  hcp.hospital_id,
  COUNT(DISTINCT hcp.condition_icd10) as conditions_covered,
  AVG(hcp.historical_accuracy) as avg_accuracy,
  AVG(hcp.completion_rate) as avg_completion_rate,
  COUNT(shb.id) as total_bids,
  COUNT(CASE WHEN shb.bid_status = 'accepted' THEN 1 END) as accepted_bids,
  AVG(shb.match_score) as avg_match_score,
  AVG(shb.bid_amount) as avg_bid_amount
FROM hospital_capacity_proofs hcp
LEFT JOIN study_hospital_bids shb ON hcp.hospital_id = shb.hospital_id
GROUP BY hcp.hospital_id;

-- Sample data for testing (development only)
-- INSERT INTO study_requests (researcher_id, title, study_type, therapeutic_area, condition_data, protocol_data, requirements, researcher_info)
-- VALUES (
--   gen_random_uuid(),
--   'Metformin vs Insulin in Elderly Type 2 Diabetes',
--   'interventional',
--   'endocrinology',
--   '{"icd10Code": "E11", "description": "Type 2 Diabetes Mellitus", "severity": "moderate"}',
--   '{"primaryEndpoint": {"metric": "HbA1c reduction", "timeframe": "6 months"}, "inclusionCriteria": ["Age 65-85", "HbA1c 7-10%"], "intervention": {"type": "drug", "description": "Metformin XR 1000mg BID"}}',
--   '{"sampleSize": {"min": 100, "max": 200, "target": 150}, "timeline": {"duration": 6}, "budget": {"min": 75000, "max": 125000}}',
--   '{"name": "Dr. Sarah Johnson", "institution": "University Medical Center", "email": "s.johnson@umc.edu"}'
-- );

-- Grant permissions (adjust as needed for your user setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medproof_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medproof_user;