# Database Setup Instructions

## Issue
The Study Marketplace feature requires two tables that don't exist yet:
1. `study_requests` - stores research studies looking for hospital partners
2. `hospital_study_interest` - tracks hospital interest in studies

## Solution

Go to your Supabase SQL Editor and run the following SQL:

👉 **https://supabase.com/dashboard/project/xewjbkmcvihgypwsfrxc/sql**

```sql
-- Create study_requests table
CREATE TABLE study_requests (
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

-- Create hospital_study_interest table
CREATE TABLE hospital_study_interest (
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

-- Create indexes for performance
CREATE INDEX idx_study_requests_status ON study_requests(status);
CREATE INDEX idx_study_requests_org ON study_requests(organization_id);
CREATE INDEX idx_hospital_interest_hospital ON hospital_study_interest(hospital_id);
CREATE INDEX idx_hospital_interest_study ON hospital_study_interest(study_request_id);

-- Insert sample study data
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
LIMIT 1;

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
LIMIT 1;

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
LIMIT 1;
```

## After Running the SQL

1. Refresh your browser
2. The Study Marketplace should now load with 3 sample studies
3. Hospital admins can browse and express interest in studies
4. Researchers can see hospital interest through the Hospital Network page

## Troubleshooting

If you get errors about `research_organizations` not existing, you need to run the base schema first.
