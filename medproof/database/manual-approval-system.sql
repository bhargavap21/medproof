-- Manual Approval System for Organizations
-- Two-tier approval: 1) Organization creation, 2) Hospital data access

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
    approval_decision TEXT, -- 'approved', 'rejected', 'needs_more_info'
    decision_reason TEXT,
    decision_made_by UUID REFERENCES user_profiles(id),
    decision_made_at TIMESTAMP WITH TIME ZONE,
    
    -- Follow-up requirements
    conditional_approval BOOLEAN DEFAULT false,
    conditions_to_meet TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital data access requests (separate from org creation)
CREATE TABLE hospital_data_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    
    -- Request details
    request_type TEXT DEFAULT 'data_access', -- data_access, collaboration, partnership
    requested_permissions TEXT[] NOT NULL,
    intended_use_case TEXT NOT NULL,
    data_retention_period INTEGER DEFAULT 24, -- months
    
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
    
    -- Data security and compliance
    data_security_plan TEXT,
    hipaa_compliance_confirmed BOOLEAN DEFAULT false,
    gdpr_compliance_confirmed BOOLEAN DEFAULT false,
    
    -- Request workflow
    status approval_workflow_status DEFAULT 'documents_required',
    requested_by UUID REFERENCES user_profiles(id),
    hospital_reviewer UUID REFERENCES user_profiles(id),
    
    -- Hospital decision
    hospital_decision TEXT, -- 'approved', 'rejected', 'conditional'
    hospital_decision_reason TEXT,
    hospital_decision_date TIMESTAMP WITH TIME ZONE,
    
    -- Conditions and limitations
    approved_permissions TEXT[], -- What was actually approved
    data_access_conditions TEXT[],
    monitoring_requirements TEXT[],
    
    -- Agreement details
    agreement_start_date DATE,
    agreement_end_date DATE,
    renewable BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one active request per org-hospital pair
    UNIQUE(organization_id, hospital_id, status) DEFERRABLE INITIALLY DEFERRED
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

-- Platform administrators (can approve organizations)
CREATE TABLE platform_administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    admin_level TEXT DEFAULT 'reviewer', -- reviewer, senior_reviewer, super_admin
    specializations TEXT[], -- medical, legal, security, compliance
    
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

-- Workflow step definitions
CREATE TABLE approval_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    step_description TEXT,
    required_for_org_types organization_type[],
    estimated_duration_days INTEGER DEFAULT 3,
    
    -- Automation
    can_be_automated BOOLEAN DEFAULT false,
    automation_criteria JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
('research_institute', 'financial_audit', false, 'Recent financial audit (recommended)'),

-- Biotech Companies
('biotech_company', 'institutional_registration', true, 'Corporate registration documents'),
('biotech_company', 'research_license', true, 'License to conduct research'),
('biotech_company', 'insurance_certificate', true, 'Professional liability insurance'),
('biotech_company', 'data_security_certificate', true, 'Data security compliance certificate'),
('biotech_company', 'financial_audit', true, 'Recent financial audit'),

-- Pharmaceutical Companies
('pharmaceutical', 'institutional_registration', true, 'Corporate registration documents'),
('pharmaceutical', 'research_license', true, 'Pharmaceutical research license'),
('pharmaceutical', 'insurance_certificate', true, 'Professional liability insurance'),
('pharmaceutical', 'data_security_certificate', true, 'Data security compliance certificate'),
('pharmaceutical', 'financial_audit', true, 'Recent financial audit'),

-- Government Agencies
('government_agency', 'institutional_registration', true, 'Government agency authorization'),
('government_agency', 'research_license', false, 'Special research authorizations if applicable'),

-- NGOs
('ngo', 'institutional_registration', true, 'NGO registration documents'),
('ngo', 'tax_exempt_certificate', true, 'Tax-exempt status certificate'),
('ngo', 'irb_ethics_approval', true, 'Ethics approval from recognized board'),
('ngo', 'insurance_certificate', true, 'Professional liability insurance');

-- Insert workflow steps
INSERT INTO approval_workflow_steps (step_number, step_name, step_description, required_for_org_types, estimated_duration_days, can_be_automated) VALUES
(1, 'Email Domain Verification', 'Verify organization email domain matches institutional domain', ARRAY['university', 'research_institute', 'government_agency']::organization_type[], 1, true),
(2, 'Document Submission', 'Upload and submit required verification documents', ARRAY['university', 'research_institute', 'biotech_company', 'pharmaceutical', 'ngo']::organization_type[], 3, false),
(3, 'Document Review', 'Manual review of submitted documents by platform administrators', ARRAY['university', 'research_institute', 'biotech_company', 'pharmaceutical', 'ngo']::organization_type[], 5, false),
(4, 'Final Approval', 'Final platform approval decision', ARRAY['university', 'research_institute', 'biotech_company', 'pharmaceutical', 'government_agency', 'ngo']::organization_type[], 2, false);

-- Functions for workflow management

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
    -- Get organization type
    SELECT organization_type INTO org_type FROM research_organizations WHERE id = org_id;
    
    -- Count required documents
    SELECT COUNT(*) INTO required_count
    FROM required_documents_by_org_type
    WHERE organization_type = org_type AND is_required = true;
    
    -- Count submitted and approved documents
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

-- Function to advance workflow step
CREATE OR REPLACE FUNCTION advance_approval_workflow(workflow_id UUID, new_status approval_workflow_status, reviewer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    workflow_record RECORD;
BEGIN
    -- Get current workflow
    SELECT * INTO workflow_record FROM organization_approval_workflow WHERE id = workflow_id;
    
    -- Update workflow
    UPDATE organization_approval_workflow
    SET 
        status = new_status,
        current_step = CASE 
            WHEN new_status = 'documents_required' THEN 2
            WHEN new_status = 'documents_under_review' THEN 3
            WHEN new_status = 'approved' OR new_status = 'rejected' THEN 4
            ELSE current_step
        END,
        assigned_reviewer = CASE 
            WHEN new_status = 'documents_under_review' THEN reviewer_id
            ELSE assigned_reviewer
        END,
        completed_at = CASE 
            WHEN new_status IN ('approved', 'rejected') THEN NOW()
            ELSE completed_at
        END,
        updated_at = NOW()
    WHERE id = workflow_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security policies
ALTER TABLE organization_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_data_access_requests ENABLE ROW LEVEL SECURITY;

-- Organizations can view their own documents and workflows
CREATE POLICY "Org members can view their documents" ON organization_documents
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Platform admins can view all documents
CREATE POLICY "Platform admins can view all documents" ON organization_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_administrators pa
            JOIN user_profiles up ON pa.user_id = up.id
            WHERE up.id = auth.uid() AND pa.is_active = true
        )
    );

-- Hospital admins can view data access requests for their hospitals
CREATE POLICY "Hospital admins can view data requests" ON hospital_data_access_requests
    FOR SELECT USING (
        hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

COMMENT ON TABLE organization_documents IS 'Document uploads for organization verification';
COMMENT ON TABLE organization_approval_workflow IS 'Multi-step approval workflow for organization creation';
COMMENT ON TABLE hospital_data_access_requests IS 'Separate approval process for hospital data access';
COMMENT ON TABLE platform_administrators IS 'Platform staff who can approve organizations';
COMMENT ON FUNCTION get_required_documents IS 'Get list of required documents for organization type';
COMMENT ON FUNCTION check_required_documents_submitted IS 'Check if organization has submitted all required documents';