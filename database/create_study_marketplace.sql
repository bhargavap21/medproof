-- Simple Study Marketplace Tables
-- Matches the frontend interface requirements

-- Study requests table (simplified for MVP)
CREATE TABLE IF NOT EXISTS study_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES research_organizations(id),
  study_title VARCHAR(500) NOT NULL,
  principal_investigator VARCHAR(255) NOT NULL,
  study_type VARCHAR(50) NOT NULL,
  required_patient_count INTEGER NOT NULL,
  inclusion_criteria TEXT NOT NULL,
  exclusion_criteria TEXT NOT NULL,
  timeline_months INTEGER NOT NULL,
  compensation_available BOOLEAN DEFAULT false,
  funding_amount DECIMAL(12,2),
  irb_approved BOOLEAN DEFAULT false,
  privacy_level VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hospital interest in studies
CREATE TABLE IF NOT EXISTS hospital_study_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  study_request_id UUID NOT NULL REFERENCES study_requests(id),
  organization_id UUID NOT NULL REFERENCES research_organizations(id),
  estimated_patient_match INTEGER,
  status VARCHAR(20) DEFAULT 'interested',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, study_request_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_requests_status ON study_requests(status);
CREATE INDEX IF NOT EXISTS idx_study_requests_org ON study_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_hospital_interest_hospital ON hospital_study_interest(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_interest_study ON hospital_study_interest(study_request_id);

-- Sample data for testing
INSERT INTO study_requests (
  organization_id,
  study_title,
  principal_investigator,
  study_type,
  required_patient_count,
  inclusion_criteria,
  exclusion_criteria,
  timeline_months,
  compensation_available,
  funding_amount,
  irb_approved,
  privacy_level,
  status
)
SELECT
  id,
  'Long-term Effects of Diabetes Management',
  'Dr. Sarah Johnson',
  'Observational',
  150,
  'Adults 18-65 with Type 2 Diabetes, HbA1c > 7.0%',
  'Pregnancy, Type 1 Diabetes, Recent cardiac event',
  12,
  true,
  125000,
  true,
  'standard',
  'open'
FROM research_organizations
WHERE name LIKE '%Research%'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO study_requests (
  organization_id,
  study_title,
  principal_investigator,
  study_type,
  required_patient_count,
  inclusion_criteria,
  exclusion_criteria,
  timeline_months,
  compensation_available,
  funding_amount,
  irb_approved,
  privacy_level,
  status
)
SELECT
  id,
  'Novel Hypertension Treatment Protocol',
  'Dr. Michael Chen',
  'Interventional',
  200,
  'Hypertension Stage 2, Age 40-70, No previous complications',
  'Secondary hypertension, Kidney disease, Recent stroke',
  18,
  true,
  250000,
  true,
  'high',
  'open'
FROM research_organizations
WHERE name LIKE '%Medical%'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO study_requests (
  organization_id,
  study_title,
  principal_investigator,
  study_type,
  required_patient_count,
  inclusion_criteria,
  exclusion_criteria,
  timeline_months,
  compensation_available,
  funding_amount,
  irb_approved,
  privacy_level,
  status
)
SELECT
  id,
  'Cancer Screening Adherence Study',
  'Dr. Emily Rodriguez',
  'Survey',
  500,
  'Adults 50+, No cancer history, Due for screening',
  'Active cancer treatment, Mental health conditions affecting consent',
  6,
  true,
  75000,
  true,
  'standard',
  'open'
FROM research_organizations
LIMIT 1
ON CONFLICT DO NOTHING;
