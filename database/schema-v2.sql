-- MedProof Database Schema v2 - Organization-Based Access Control
-- Redesigned for organization approval instead of individual researcher approval

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum - simplified
CREATE TYPE user_role AS ENUM ('public', 'org_admin', 'hospital_admin', 'super_admin');

-- Organization types
CREATE TYPE organization_type AS ENUM ('university', 'research_institute', 'biotech_company', 'pharmaceutical', 'government_agency', 'ngo');

-- Application status enum
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Study status enum  
CREATE TYPE study_status AS ENUM ('draft', 'submitted', 'verified', 'published');

-- Hospitals table (data providers)
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    institution_type TEXT NOT NULL DEFAULT 'hospital',
    address JSONB,
    accreditations TEXT[],
    website TEXT,
    contact_email TEXT,
    midnight_contract_address TEXT,
    settings JSONB DEFAULT '{
        "auto_approve_known_orgs": false,
        "max_studies_per_org": 50,
        "data_retention_months": 24,
        "allowed_organization_types": ["university", "research_institute"]
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    
    -- Midnight Network integration
    wallet_address TEXT UNIQUE,
    midnight_org_proof TEXT, -- ZK proof of organization legitimacy
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (anyone can register)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'public',
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    
    -- Professional info (optional)
    title TEXT,
    department TEXT,
    institution TEXT,
    orcid_id TEXT, -- Academic identifier
    
    -- Midnight Network
    wallet_address TEXT UNIQUE,
    
    -- Profile settings
    credentials JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
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

-- Hospital-Organization Agreements (hospitals approve organizations)
CREATE TABLE hospital_organization_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    
    -- Agreement details
    agreement_type TEXT DEFAULT 'data_access', -- data_access, collaboration, partnership
    permissions TEXT[] NOT NULL, -- What the org can do with hospital data
    data_scope TEXT[], -- What datasets they can access
    
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
    
    -- Midnight Network proof of agreement
    midnight_agreement_proof TEXT,
    midnight_tx_hash TEXT,
    
    -- Validity
    effective_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one active agreement per hospital-org pair
    UNIQUE(hospital_id, organization_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Medical studies table (submitted by organization members)
CREATE TABLE medical_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    condition TEXT NOT NULL,
    treatment TEXT NOT NULL,
    
    -- Attribution
    organization_id UUID REFERENCES research_organizations(id),
    submitted_by UUID REFERENCES user_profiles(id),
    principal_investigator TEXT,
    
    -- Data sources (which hospitals provided data)
    contributing_hospitals UUID[] DEFAULT '{}',
    
    -- Study data (privacy-preserving)
    study_data JSONB NOT NULL,
    patient_count INTEGER NOT NULL,
    treatment_success INTEGER NOT NULL,
    control_success INTEGER NOT NULL,  
    control_count INTEGER NOT NULL,
    p_value DECIMAL NOT NULL,
    
    -- Midnight Network integration
    midnight_proof_hash TEXT,
    midnight_tx_hash TEXT,
    data_commitment TEXT,
    
    status study_status DEFAULT 'draft',
    verified_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study collaborations (multiple organizations on one study)
CREATE TABLE study_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES medical_studies(id),
    collaborating_organization_id UUID REFERENCES research_organizations(id),
    contribution_type TEXT, -- lead, data_provider, analyst, reviewer
    contribution_hash TEXT,
    authorized_by UUID REFERENCES user_profiles(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(study_id, collaborating_organization_id)
);

-- Audit log for all authorization actions
CREATE TABLE authorization_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL, -- org_approved, org_suspended, member_added, study_submitted
    target_organization_id UUID REFERENCES research_organizations(id),
    target_user_id UUID REFERENCES user_profiles(id),
    performed_by UUID REFERENCES user_profiles(id),
    hospital_id UUID REFERENCES hospitals(id),
    details JSONB,
    midnight_tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_organization_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User profiles - users can see their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- Hospital admins can view their hospital data
CREATE POLICY "Hospital admins can view hospital data" ON hospitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

-- Organization data is viewable by members
CREATE POLICY "Org members can view their organization" ON research_organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Studies are viewable by organization members
CREATE POLICY "Org members can view their studies" ON medical_studies
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_organizations_updated_at BEFORE UPDATE ON research_organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_studies_updated_at BEFORE UPDATE ON medical_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_org_memberships_user_org ON organization_memberships(user_id, organization_id, is_active);
CREATE INDEX idx_hospital_org_agreements_status ON hospital_organization_agreements(hospital_id, organization_id, status);
CREATE INDEX idx_medical_studies_org ON medical_studies(organization_id);
CREATE INDEX idx_authorization_audit_org ON authorization_audit_log(target_organization_id, created_at DESC);

-- Insert sample data

-- Sample hospitals
INSERT INTO hospitals (hospital_id, name, institution_type, settings) VALUES
('MAYO_CLINIC_001', 'Mayo Clinic', 'academic_medical_center', '{
    "auto_approve_known_orgs": true,
    "max_studies_per_org": 50,
    "data_retention_months": 24,
    "allowed_organization_types": ["university", "research_institute"]
}'),
('JOHNS_HOPKINS_001', 'Johns Hopkins Hospital', 'academic_medical_center', '{
    "auto_approve_known_orgs": false,
    "max_studies_per_org": 30,
    "data_retention_months": 18,
    "allowed_organization_types": ["university", "research_institute", "government_agency"]
}'),
('CLEVELAND_CLINIC_001', 'Cleveland Clinic', 'hospital', '{
    "auto_approve_known_orgs": false,
    "max_studies_per_org": 20,
    "data_retention_months": 12,
    "allowed_organization_types": ["university", "biotech_company"]
}');

-- Sample research organizations
INSERT INTO research_organizations (org_id, name, organization_type, description, website, contact_email, research_areas, primary_contact_name, ethics_board_approval) VALUES
('STANFORD_MED_001', 'Stanford University School of Medicine', 'university', 'Leading medical research institution', 'https://med.stanford.edu', 'research@stanford.edu', ARRAY['cardiology', 'oncology', 'neuroscience'], 'Dr. Jennifer Chen', true),
('MIT_CSAIL_001', 'MIT Computer Science and Artificial Intelligence Laboratory', 'university', 'AI and computational biology research', 'https://csail.mit.edu', 'admin@csail.mit.edu', ARRAY['ai_healthcare', 'computational_biology', 'medical_imaging'], 'Dr. Alex Rodriguez', true),
('BROAD_INSTITUTE_001', 'Broad Institute', 'research_institute', 'Genomic medicine and therapeutics', 'https://broadinstitute.org', 'contact@broadinstitute.org', ARRAY['genomics', 'drug_discovery', 'precision_medicine'], 'Dr. Sarah Williams', true);

-- Comments for documentation
COMMENT ON TABLE hospitals IS 'Healthcare institutions that provide data for research';
COMMENT ON TABLE research_organizations IS 'Research institutions that can access hospital data after approval';
COMMENT ON TABLE user_profiles IS 'All users in the system - anyone can register';
COMMENT ON TABLE organization_memberships IS 'Researchers association with approved organizations';
COMMENT ON TABLE hospital_organization_agreements IS 'Approved data access agreements between hospitals and research orgs';
COMMENT ON TABLE medical_studies IS 'Research studies submitted by organization members';
COMMENT ON TABLE authorization_audit_log IS 'Audit trail for all organizational actions';