-- Migration Script: Individual Researcher Approval → Organization-Based System
-- Run this AFTER the original schema.sql to upgrade to the new system

-- ===== STEP 1: CREATE NEW TABLES =====

-- Organization types
CREATE TYPE organization_type AS ENUM ('university', 'research_institute', 'biotech_company', 'pharmaceutical', 'government_agency', 'ngo');

-- Document types for verification
CREATE TYPE document_type AS ENUM (
    'institutional_registration',
    'irb_ethics_approval', 
    'research_license',
    'tax_exempt_certificate',
    'accreditation_certificate',
    'insurance_certificate',
    'principal_investigator_cv',
    'organization_charter',
    'financial_audit',
    'data_security_certificate'
);

-- Document status
CREATE TYPE document_status AS ENUM ('uploaded', 'under_review', 'approved', 'rejected', 'expired');

-- Approval workflow status
CREATE TYPE approval_workflow_status AS ENUM (
    'draft',
    'documents_required', 
    'documents_submitted',
    'documents_under_review',
    'documents_approved',
    'platform_review',
    'approved',
    'rejected',
    'suspended'
);

-- Verification status and levels
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'documents_pending', 'manual_review', 'verified', 'rejected', 'suspended');
CREATE TYPE verification_level AS ENUM ('basic', 'standard', 'premium', 'institutional');

-- Research Organizations table (the entities that get approved)
CREATE TABLE research_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT UNIQUE NOT NULL, -- e.g., "STANFORD_MED_001"
    name TEXT NOT NULL,
    organization_type organization_type NOT NULL,
    description TEXT,
    website TEXT,
    contact_email TEXT NOT NULL,
    address JSONB,
    
    -- Verification info
    tax_id TEXT,
    registration_number TEXT,
    accreditations TEXT[],
    ethics_board_approval BOOLEAN DEFAULT false,
    
    -- Research focus
    research_areas TEXT[],
    primary_contact_name TEXT,
    primary_contact_title TEXT,
    
    -- Verification status
    verification_status verification_status DEFAULT 'unverified',
    verification_level verification_level DEFAULT 'basic',
    verification_score INTEGER DEFAULT 0,
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Automated verification checks
    domain_verification BOOLEAN DEFAULT false,
    ein_verification BOOLEAN DEFAULT false,
    website_verification BOOLEAN DEFAULT false,
    academic_ranking_verified BOOLEAN DEFAULT false,
    
    -- Document verification
    verification_documents JSONB DEFAULT '{}',
    irb_approval_document TEXT,
    accreditation_documents TEXT[],
    legal_registration_proof TEXT,
    
    -- Professional verification
    orcid_verified_members INTEGER DEFAULT 0,
    pubmed_publications INTEGER DEFAULT 0,
    grant_history JSONB DEFAULT '{}',
    peer_references TEXT[],
    
    -- Midnight Network integration
    wallet_address TEXT UNIQUE,
    midnight_org_proof TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization memberships (researchers join organizations)
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    
    role TEXT DEFAULT 'researcher', -- researcher, admin, pi (principal investigator)
    permissions TEXT[] DEFAULT '{"view_data", "submit_studies"}',
    
    -- Membership details
    employee_id TEXT,
    department TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    -- Approval
    invited_by UUID REFERENCES user_profiles(id),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one active membership per user per org
    UNIQUE(user_id, organization_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Document uploads table
CREATE TABLE organization_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    
    -- Document info
    document_type document_type NOT NULL,
    document_name TEXT NOT NULL,
    file_path TEXT, -- Secure file storage path
    file_hash TEXT, -- SHA-256 hash for integrity
    file_size INTEGER,
    mime_type TEXT,
    
    -- Document metadata
    issue_date DATE,
    expiration_date DATE,
    issuing_authority TEXT,
    document_number TEXT,
    
    -- Review process
    status document_status DEFAULT 'uploaded',
    uploaded_by UUID REFERENCES user_profiles(id),
    reviewed_by UUID REFERENCES user_profiles(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization approval workflow
CREATE TABLE organization_approval_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    
    -- Workflow status
    status approval_workflow_status DEFAULT 'draft',
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 4,
    
    -- Approval steps tracking
    email_domain_verified BOOLEAN DEFAULT false,
    required_documents_submitted BOOLEAN DEFAULT false,
    documents_reviewed BOOLEAN DEFAULT false,
    manual_review_completed BOOLEAN DEFAULT false,
    
    -- Review assignments
    assigned_reviewer UUID REFERENCES user_profiles(id),
    platform_admin_reviewer UUID REFERENCES user_profiles(id),
    
    -- Process metadata
    initiated_by UUID REFERENCES user_profiles(id),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Decision
    approval_decision TEXT,
    decision_reason TEXT,
    decision_made_by UUID REFERENCES user_profiles(id),
    decision_made_at TIMESTAMP WITH TIME ZONE,
    
    -- Follow-up requirements
    conditional_approval BOOLEAN DEFAULT false,
    conditions_to_meet TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital-Organization Agreements (replaces individual researcher approvals)
CREATE TABLE hospital_organization_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    
    -- Agreement details
    agreement_type TEXT DEFAULT 'data_access',
    permissions TEXT[] NOT NULL,
    data_scope TEXT[],
    
    -- Terms
    max_studies_per_year INTEGER DEFAULT 10,
    data_retention_months INTEGER DEFAULT 24,
    requires_irb_approval BOOLEAN DEFAULT true,
    
    -- Approval workflow
    status application_status DEFAULT 'pending',
    requested_by UUID REFERENCES user_profiles(id),
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Midnight Network proof
    midnight_agreement_proof TEXT,
    midnight_tx_hash TEXT,
    
    -- Validity
    effective_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(hospital_id, organization_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Hospital data access requests (separate process)
CREATE TABLE hospital_data_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    
    -- Request details
    request_type TEXT DEFAULT 'data_access',
    requested_permissions TEXT[] NOT NULL,
    intended_use_case TEXT NOT NULL,
    data_retention_period INTEGER DEFAULT 24,
    
    -- Research proposal
    research_title TEXT,
    research_description TEXT,
    research_methodology TEXT,
    expected_outcomes TEXT,
    publication_plans TEXT,
    
    -- IRB and ethics
    irb_approval_number TEXT,
    irb_approval_date DATE,
    ethics_committee TEXT,
    
    -- Data security
    data_security_plan TEXT,
    hipaa_compliance_confirmed BOOLEAN DEFAULT false,
    gdpr_compliance_confirmed BOOLEAN DEFAULT false,
    
    -- Request workflow
    status approval_workflow_status DEFAULT 'documents_required',
    requested_by UUID REFERENCES user_profiles(id),
    hospital_reviewer UUID REFERENCES user_profiles(id),
    
    -- Hospital decision
    hospital_decision TEXT,
    hospital_decision_reason TEXT,
    hospital_decision_date TIMESTAMP WITH TIME ZONE,
    
    -- Approved terms
    approved_permissions TEXT[],
    data_access_conditions TEXT[],
    monitoring_requirements TEXT[],
    
    -- Agreement period
    agreement_start_date DATE,
    agreement_end_date DATE,
    renewable BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_id, hospital_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Platform administrators
CREATE TABLE platform_administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    admin_level TEXT DEFAULT 'reviewer',
    specializations TEXT[],
    
    -- Permissions
    can_approve_organizations BOOLEAN DEFAULT true,
    can_review_documents BOOLEAN DEFAULT true,
    can_assign_reviewers BOOLEAN DEFAULT false,
    can_manage_hospitals BOOLEAN DEFAULT false,
    
    is_active BOOLEAN DEFAULT true,
    appointed_by UUID REFERENCES user_profiles(id),
    appointed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Required documents by organization type
CREATE TABLE required_documents_by_org_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_type organization_type NOT NULL,
    document_type document_type NOT NULL,
    is_required BOOLEAN DEFAULT true,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(organization_type, document_type)
);

-- Trusted institutional domains
CREATE TABLE trusted_institutional_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT UNIQUE NOT NULL,
    institution_name TEXT NOT NULL,
    institution_type organization_type NOT NULL,
    verification_level verification_level DEFAULT 'standard',
    
    verified_by TEXT,
    verification_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== STEP 2: MODIFY EXISTING TABLES =====

-- Update user_profiles to work with organizations
ALTER TABLE user_profiles DROP COLUMN IF EXISTS hospital_id;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS orcid_id TEXT;

-- Update medical_studies to reference organizations
ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES research_organizations(id);
ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS principal_investigator TEXT;
ALTER TABLE medical_studies ADD COLUMN IF NOT EXISTS contributing_hospitals UUID[] DEFAULT '{}';

-- ===== STEP 3: INSERT REFERENCE DATA =====

-- Insert required documents by organization type
INSERT INTO required_documents_by_org_type (organization_type, document_type, is_required, description) VALUES
-- Universities
('university', 'institutional_registration', true, 'Official university registration/charter'),
('university', 'irb_ethics_approval', true, 'Institutional Review Board approval for research'),
('university', 'accreditation_certificate', true, 'University accreditation from recognized body'),
('university', 'principal_investigator_cv', true, 'CV of primary research contact'),

-- Research Institutes
('research_institute', 'institutional_registration', true, 'Legal entity registration documents'),
('research_institute', 'irb_ethics_approval', true, 'Ethics committee approval'),
('research_institute', 'research_license', true, 'License to conduct research'),
('research_institute', 'insurance_certificate', true, 'Professional liability insurance'),

-- Biotech Companies
('biotech_company', 'institutional_registration', true, 'Corporate registration documents'),
('biotech_company', 'research_license', true, 'License to conduct research'),
('biotech_company', 'insurance_certificate', true, 'Professional liability insurance'),
('biotech_company', 'data_security_certificate', true, 'Data security compliance certificate'),
('biotech_company', 'financial_audit', true, 'Recent financial audit');

-- Insert trusted domains
INSERT INTO trusted_institutional_domains (domain, institution_name, institution_type, verification_level) VALUES
-- Top Universities
('stanford.edu', 'Stanford University', 'university', 'premium'),
('harvard.edu', 'Harvard University', 'university', 'premium'),
('mit.edu', 'Massachusetts Institute of Technology', 'university', 'premium'),
('yale.edu', 'Yale University', 'university', 'premium'),
('mayo.edu', 'Mayo Clinic', 'research_institute', 'institutional'),
('jhmi.edu', 'Johns Hopkins University School of Medicine', 'university', 'institutional'),
('broadinstitute.org', 'Broad Institute', 'research_institute', 'institutional'),
('nih.gov', 'National Institutes of Health', 'government_agency', 'institutional');

-- Insert sample research organizations
INSERT INTO research_organizations (
    org_id, name, organization_type, description, website, contact_email, 
    research_areas, primary_contact_name, ethics_board_approval,
    verification_status, domain_verification
) VALUES
('STANFORD_MED_001', 'Stanford University School of Medicine', 'university', 
 'Leading medical research institution focusing on precision medicine and AI-driven healthcare', 
 'https://med.stanford.edu', 'research@stanford.edu', 
 ARRAY['cardiology', 'oncology', 'neuroscience', 'ai_healthcare'], 
 'Dr. Jennifer Chen', true, 'verified', true),

('MIT_CSAIL_001', 'MIT Computer Science and Artificial Intelligence Laboratory', 'university', 
 'AI and computational biology research laboratory', 
 'https://csail.mit.edu', 'admin@csail.mit.edu', 
 ARRAY['ai_healthcare', 'computational_biology', 'medical_imaging'], 
 'Dr. Alex Rodriguez', true, 'verified', true),

('BROAD_INSTITUTE_001', 'Broad Institute', 'research_institute', 
 'Genomic medicine and therapeutics research institute', 
 'https://broadinstitute.org', 'contact@broadinstitute.org', 
 ARRAY['genomics', 'drug_discovery', 'precision_medicine'], 
 'Dr. Sarah Williams', true, 'verified', true);

-- ===== STEP 4: CREATE FUNCTIONS =====

-- Function to get required documents for an organization
CREATE OR REPLACE FUNCTION get_required_documents(org_type organization_type)
RETURNS TABLE(document_type document_type, is_required boolean, description text) AS $$
BEGIN
    RETURN QUERY
    SELECT rd.document_type, rd.is_required, rd.description
    FROM required_documents_by_org_type rd
    WHERE rd.organization_type = org_type
    ORDER BY rd.is_required DESC, rd.document_type;
END;
$$ LANGUAGE plpgsql;

-- Function to check if organization has all required documents
CREATE OR REPLACE FUNCTION check_required_documents_submitted(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    org_type organization_type;
    required_count INTEGER;
    submitted_count INTEGER;
BEGIN
    SELECT organization_type INTO org_type FROM research_organizations WHERE id = org_id;
    
    SELECT COUNT(*) INTO required_count
    FROM required_documents_by_org_type
    WHERE organization_type = org_type AND is_required = true;
    
    SELECT COUNT(*) INTO submitted_count
    FROM organization_documents od
    JOIN required_documents_by_org_type rd ON od.document_type = rd.document_type
    WHERE od.organization_id = org_id 
    AND rd.organization_type = org_type 
    AND rd.is_required = true
    AND od.status IN ('approved', 'under_review');
    
    RETURN submitted_count >= required_count;
END;
$$ LANGUAGE plpgsql;

-- ===== STEP 5: UPDATE ROW LEVEL SECURITY =====

-- Enable RLS on new tables
ALTER TABLE research_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_organization_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_data_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables

-- Organizations - viewable by members and platform admins
CREATE POLICY "Org members can view their organization" ON research_organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators pa
            JOIN user_profiles up ON pa.user_id = up.id
            WHERE up.id = auth.uid() AND pa.is_active = true
        )
    );

-- Organization memberships - viewable by org members
CREATE POLICY "Org members can view memberships" ON organization_memberships
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Documents - viewable by org members and platform admins
CREATE POLICY "Org members can view their documents" ON organization_documents
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators pa
            JOIN user_profiles up ON pa.user_id = up.id
            WHERE up.id = auth.uid() AND pa.is_active = true
        )
    );

-- Hospital data access requests - viewable by org members and hospital admins
CREATE POLICY "View data access requests" ON hospital_data_access_requests
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
        OR hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

-- ===== STEP 6: CREATE INDEXES =====

CREATE INDEX idx_research_organizations_verification ON research_organizations(verification_status, verification_level);
CREATE INDEX idx_organization_memberships_user_org ON organization_memberships(user_id, organization_id, is_active);
CREATE INDEX idx_organization_documents_org_type ON organization_documents(organization_id, document_type, status);
CREATE INDEX idx_hospital_org_agreements_hospital_org ON hospital_organization_agreements(hospital_id, organization_id, is_active);
CREATE INDEX idx_hospital_data_requests_org_hospital ON hospital_data_access_requests(organization_id, hospital_id, status);

-- ===== STEP 7: ADD TRIGGERS =====

CREATE TRIGGER update_research_organizations_updated_at BEFORE UPDATE ON research_organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_memberships_updated_at BEFORE UPDATE ON organization_memberships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_org_agreements_updated_at BEFORE UPDATE ON hospital_organization_agreements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== MIGRATION COMPLETE =====

-- Add comments
COMMENT ON TABLE research_organizations IS 'Research institutions that can access hospital data after approval';
COMMENT ON TABLE organization_memberships IS 'Researchers association with approved organizations';  
COMMENT ON TABLE organization_documents IS 'Document uploads for organization verification';
COMMENT ON TABLE hospital_organization_agreements IS 'Approved data access agreements between hospitals and research orgs';
COMMENT ON TABLE hospital_data_access_requests IS 'Requests for hospital data access by organizations';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! New organization-based system is ready.';
    RAISE NOTICE 'Sample organizations created: Stanford Med, MIT CSAIL, Broad Institute';
    RAISE NOTICE 'Next steps: Update your application code to use the new organization tables.';
END $$;