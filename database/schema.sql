-- MedProof Database Schema for Supabase
-- Complete user management, roles, and hospital authorization system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('public', 'researcher', 'hospital_admin', 'super_admin');

-- Application status enum
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'revoked');

-- Study status enum  
CREATE TYPE study_status AS ENUM ('draft', 'submitted', 'verified', 'published');

-- Hospitals table
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id TEXT UNIQUE NOT NULL, -- e.g., "MAYO_CLINIC_001"
    name TEXT NOT NULL,
    institution_type TEXT NOT NULL DEFAULT 'hospital',
    address JSONB,
    accreditations TEXT[],
    website TEXT,
    contact_email TEXT,
    midnight_contract_address TEXT, -- Midnight Network contract
    settings JSONB DEFAULT '{
        "require_supervisor_approval": true,
        "auto_approve_institutional_emails": true,
        "max_studies_per_researcher": 10,
        "allowed_email_domains": []
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    role user_role NOT NULL DEFAULT 'public',
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    employee_id TEXT, -- Hospital employee ID
    department TEXT,
    position TEXT,
    medical_license TEXT,
    wallet_address TEXT, -- Midnight Network wallet
    credentials JSONB DEFAULT '{}', -- Store verification status
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraints
    UNIQUE(hospital_id, employee_id),
    UNIQUE(wallet_address)
);

-- Researcher applications table
CREATE TABLE researcher_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    application_data JSONB NOT NULL, -- Store all application details
    requested_permissions TEXT[] DEFAULT '{}',
    status application_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    midnight_auth_tx TEXT, -- Midnight Network transaction hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital authorizations (approved researchers)
CREATE TABLE hospital_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id),
    authorized_by UUID REFERENCES user_profiles(id),
    permissions TEXT[] NOT NULL,
    wallet_address TEXT NOT NULL,
    midnight_auth_proof TEXT, -- ZK proof of authorization
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES user_profiles(id),
    revoke_reason TEXT,
    
    -- Unique constraint: one active authorization per user per hospital
    UNIQUE(user_id, hospital_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Medical studies table
CREATE TABLE medical_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id TEXT UNIQUE NOT NULL, -- External study identifier
    title TEXT NOT NULL,
    description TEXT,
    condition TEXT NOT NULL,
    treatment TEXT NOT NULL,
    hospital_id UUID REFERENCES hospitals(id),
    submitted_by UUID REFERENCES user_profiles(id),
    
    -- Study data (encrypted/hashed for privacy)
    study_data JSONB NOT NULL, -- Contains non-sensitive metadata
    patient_count INTEGER NOT NULL,
    treatment_success INTEGER NOT NULL,
    control_success INTEGER NOT NULL,  
    control_count INTEGER NOT NULL,
    p_value DECIMAL NOT NULL,
    
    -- Midnight Network integration
    midnight_proof_hash TEXT, -- ZK proof hash
    midnight_tx_hash TEXT, -- Blockchain transaction
    data_commitment TEXT, -- Commitment to private data
    
    status study_status DEFAULT 'draft',
    verified_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-hospital study collaborations
CREATE TABLE study_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES medical_studies(id),
    collaborating_hospital_id UUID REFERENCES hospitals(id),
    contribution_hash TEXT, -- Hash of hospital's contribution
    authorized_by UUID REFERENCES user_profiles(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(study_id, collaborating_hospital_id)
);

-- Audit log for all authorization actions
CREATE TABLE authorization_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL, -- 'approve', 'reject', 'revoke', 'update'
    target_user_id UUID REFERENCES user_profiles(id),
    performed_by UUID REFERENCES user_profiles(id),
    hospital_id UUID REFERENCES hospitals(id),
    details JSONB,
    midnight_tx_hash TEXT, -- Associated blockchain transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE researcher_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorization_audit_log ENABLE ROW LEVEL SECURITY;

-- Hospital data isolation policies
CREATE POLICY "Users can view their own hospital" ON hospitals
    FOR SELECT USING (
        id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Hospital admins can update their hospital" ON hospitals
    FOR UPDATE USING (
        id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

-- User profile policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Hospital admins can view their hospital's users" ON user_profiles
    FOR SELECT USING (
        hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

-- Researcher application policies
CREATE POLICY "Users can view their own applications" ON researcher_applications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Hospital admins can view their hospital's applications" ON researcher_applications
    FOR SELECT USING (
        hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

CREATE POLICY "Hospital admins can update their hospital's applications" ON researcher_applications
    FOR UPDATE USING (
        hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

-- Hospital authorization policies
CREATE POLICY "Users can view their own authorizations" ON hospital_authorizations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Hospital admins can manage their hospital's authorizations" ON hospital_authorizations
    FOR ALL USING (
        hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
        )
    );

-- Medical studies policies
CREATE POLICY "Authorized researchers can view hospital studies" ON medical_studies
    FOR SELECT USING (
        hospital_id IN (
            SELECT ha.hospital_id FROM hospital_authorizations ha
            WHERE ha.user_id = auth.uid() AND ha.is_active = true
        )
    );

CREATE POLICY "Authorized researchers can insert studies" ON medical_studies
    FOR INSERT WITH CHECK (
        hospital_id IN (
            SELECT ha.hospital_id FROM hospital_authorizations ha
            WHERE ha.user_id = auth.uid() AND ha.is_active = true
        )
    );

-- Audit log policies
CREATE POLICY "Hospital admins can view their hospital's audit log" ON authorization_audit_log
    FOR SELECT USING (
        hospital_id IN (
            SELECT hospital_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'hospital_admin'
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

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_researcher_applications_updated_at BEFORE UPDATE ON researcher_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_studies_updated_at BEFORE UPDATE ON medical_studies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_profiles_hospital_role ON user_profiles(hospital_id, role);
CREATE INDEX idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX idx_researcher_applications_hospital_status ON researcher_applications(hospital_id, status);
CREATE INDEX idx_hospital_authorizations_user_hospital ON hospital_authorizations(user_id, hospital_id, is_active);
CREATE INDEX idx_medical_studies_hospital ON medical_studies(hospital_id);
CREATE INDEX idx_medical_studies_submitted_by ON medical_studies(submitted_by);
CREATE INDEX idx_authorization_audit_hospital ON authorization_audit_log(hospital_id, created_at DESC);

-- Insert sample data
INSERT INTO hospitals (hospital_id, name, institution_type, settings) VALUES
('MAYO_CLINIC_001', 'Mayo Clinic', 'academic_medical_center', '{
    "require_supervisor_approval": true,
    "auto_approve_institutional_emails": true,
    "max_studies_per_researcher": 10,
    "allowed_email_domains": ["mayo.edu", "mayoclinic.org"]
}'),
('JOHNS_HOPKINS_001', 'Johns Hopkins Hospital', 'academic_medical_center', '{
    "require_supervisor_approval": true,
    "auto_approve_institutional_emails": false,
    "max_studies_per_researcher": 15,
    "allowed_email_domains": ["jhmi.edu", "jh.edu"]
}'),
('CLEVELAND_CLINIC_001', 'Cleveland Clinic', 'hospital', '{
    "require_supervisor_approval": false,
    "auto_approve_institutional_emails": true,
    "max_studies_per_researcher": 8,
    "allowed_email_domains": ["ccf.org"]
}');

-- Comments for documentation
COMMENT ON TABLE hospitals IS 'Hospital institutions in the MedProof network';
COMMENT ON TABLE user_profiles IS 'Extended user profiles with roles and hospital associations';
COMMENT ON TABLE researcher_applications IS 'Applications from researchers to join hospitals';
COMMENT ON TABLE hospital_authorizations IS 'Active authorizations for researchers at hospitals';
COMMENT ON TABLE medical_studies IS 'Medical research studies with privacy-preserving proofs';
COMMENT ON TABLE study_collaborations IS 'Multi-hospital study collaborations';
COMMENT ON TABLE authorization_audit_log IS 'Audit trail for all authorization actions';