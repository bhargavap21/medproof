-- Organization Verification Process Schema
-- Multi-layer verification system for research organizations

-- Verification status enum
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'documents_pending', 'manual_review', 'verified', 'rejected', 'suspended');

-- Verification levels
CREATE TYPE verification_level AS ENUM ('basic', 'standard', 'premium', 'institutional');

-- Add verification fields to research_organizations
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS verification_status verification_status DEFAULT 'unverified';
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS verification_level verification_level DEFAULT 'basic';
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT 0; -- 0-100 score
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Automated verification checks
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS domain_verification BOOLEAN DEFAULT false;
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS ein_verification BOOLEAN DEFAULT false;
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS website_verification BOOLEAN DEFAULT false;
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS academic_ranking_verified BOOLEAN DEFAULT false;

-- Document verification
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '{}';
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS irb_approval_document TEXT;
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS accreditation_documents TEXT[];
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS legal_registration_proof TEXT;

-- Professional verification
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS orcid_verified_members INTEGER DEFAULT 0;
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS pubmed_publications INTEGER DEFAULT 0;
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS grant_history JSONB DEFAULT '{}';
ALTER TABLE research_organizations ADD COLUMN IF NOT EXISTS peer_references TEXT[];

-- Verification attempts and history
CREATE TABLE organization_verification_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES research_organizations(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'initial', 'renewal', 'audit'
    
    -- Verification steps
    automated_checks_passed BOOLEAN DEFAULT false,
    documents_submitted BOOLEAN DEFAULT false,
    manual_review_completed BOOLEAN DEFAULT false,
    
    -- Results
    verification_result verification_status NOT NULL,
    verification_score INTEGER DEFAULT 0,
    verification_notes TEXT,
    
    -- Process metadata
    initiated_by UUID REFERENCES user_profiles(id),
    reviewed_by UUID REFERENCES user_profiles(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- External verification data
    external_verifications JSONB DEFAULT '{}', -- Store API responses, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Known trusted domains (for automated verification)
CREATE TABLE trusted_institutional_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT UNIQUE NOT NULL,
    institution_name TEXT NOT NULL,
    institution_type organization_type NOT NULL,
    verification_level verification_level DEFAULT 'standard',
    
    -- Verification info
    verified_by TEXT, -- Manual verifier or automated system
    verification_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic rankings (for automated verification)
CREATE TABLE academic_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name TEXT NOT NULL,
    ranking_system TEXT NOT NULL, -- 'QS', 'US_News', 'Times_Higher_Ed'
    subject_area TEXT, -- 'Medicine', 'Life_Sciences', 'Overall'
    rank_position INTEGER,
    year INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(institution_name, ranking_system, subject_area, year)
);

-- Insert sample trusted domains
INSERT INTO trusted_institutional_domains (domain, institution_name, institution_type, verification_level) VALUES
-- Top US Universities
('stanford.edu', 'Stanford University', 'university', 'premium'),
('harvard.edu', 'Harvard University', 'university', 'premium'),
('mit.edu', 'Massachusetts Institute of Technology', 'university', 'premium'),
('yale.edu', 'Yale University', 'university', 'premium'),
('princeton.edu', 'Princeton University', 'university', 'premium'),
('columbia.edu', 'Columbia University', 'university', 'premium'),
('upenn.edu', 'University of Pennsylvania', 'university', 'premium'),
('uchicago.edu', 'University of Chicago', 'university', 'premium'),
('caltech.edu', 'California Institute of Technology', 'university', 'premium'),
('duke.edu', 'Duke University', 'university', 'premium'),

-- Medical Schools & Research Institutes
('mayo.edu', 'Mayo Clinic', 'research_institute', 'institutional'),
('jhmi.edu', 'Johns Hopkins University School of Medicine', 'university', 'institutional'),
('broadinstitute.org', 'Broad Institute', 'research_institute', 'institutional'),
('dana-farber.org', 'Dana-Farber Cancer Institute', 'research_institute', 'institutional'),
('mskcc.org', 'Memorial Sloan Kettering Cancer Center', 'research_institute', 'institutional'),

-- Government Agencies
('nih.gov', 'National Institutes of Health', 'government_agency', 'institutional'),
('cdc.gov', 'Centers for Disease Control and Prevention', 'government_agency', 'institutional'),
('fda.gov', 'Food and Drug Administration', 'government_agency', 'institutional'),

-- International Universities
('ox.ac.uk', 'University of Oxford', 'university', 'premium'),
('cam.ac.uk', 'University of Cambridge', 'university', 'premium'),
('imperial.ac.uk', 'Imperial College London', 'university', 'premium'),
('ethz.ch', 'ETH Zurich', 'university', 'premium'),
('u-tokyo.ac.jp', 'University of Tokyo', 'university', 'premium');

-- Insert sample academic rankings
INSERT INTO academic_rankings (institution_name, ranking_system, subject_area, rank_position, year) VALUES
('Stanford University', 'QS', 'Medicine', 2, 2024),
('Harvard University', 'QS', 'Medicine', 1, 2024),
('Johns Hopkins University', 'QS', 'Medicine', 3, 2024),
('University of Cambridge', 'QS', 'Medicine', 4, 2024),
('University of Oxford', 'QS', 'Medicine', 5, 2024),
('MIT', 'QS', 'Life_Sciences', 1, 2024),
('Stanford University', 'QS', 'Life_Sciences', 2, 2024),
('Harvard University', 'QS', 'Life_Sciences', 3, 2024);

-- Verification scoring function
CREATE OR REPLACE FUNCTION calculate_verification_score(org_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    org_record RECORD;
    domain_trusted BOOLEAN := false;
    ranked_institution BOOLEAN := false;
BEGIN
    -- Get organization record
    SELECT * INTO org_record FROM research_organizations WHERE id = org_id;
    
    -- Domain verification (20 points)
    IF org_record.domain_verification THEN
        score := score + 20;
    END IF;
    
    -- Trusted domain bonus (15 points)
    SELECT EXISTS(
        SELECT 1 FROM trusted_institutional_domains 
        WHERE domain = split_part(org_record.contact_email, '@', 2)
    ) INTO domain_trusted;
    
    IF domain_trusted THEN
        score := score + 15;
    END IF;
    
    -- Academic ranking bonus (10 points)
    SELECT EXISTS(
        SELECT 1 FROM academic_rankings 
        WHERE institution_name = org_record.name
    ) INTO ranked_institution;
    
    IF ranked_institution THEN
        score := score + 10;
    END IF;
    
    -- EIN verification (15 points)
    IF org_record.ein_verification THEN
        score := score + 15;
    END IF;
    
    -- IRB approval (15 points)
    IF org_record.irb_approval_document IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    -- ORCID verified members (up to 10 points)
    score := score + LEAST(org_record.orcid_verified_members, 10);
    
    -- Publications (up to 10 points, 1 point per 100 publications)
    score := score + LEAST(org_record.pubmed_publications / 100, 10);
    
    -- Website verification (5 points)
    IF org_record.website_verification THEN
        score := score + 5;
    END IF;
    
    RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Trigger to update verification score
CREATE OR REPLACE FUNCTION update_verification_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.verification_score := calculate_verification_score(NEW.id);
    
    -- Auto-approve high scoring organizations
    IF NEW.verification_score >= 80 AND NEW.verification_status = 'pending' THEN
        NEW.verification_status := 'verified';
        NEW.verification_level := 'standard';
        NEW.verification_expires_at := NOW() + INTERVAL '2 years';
    ELSIF NEW.verification_score >= 95 THEN
        NEW.verification_level := 'premium';
        NEW.verification_expires_at := NOW() + INTERVAL '3 years';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_verification_score
    BEFORE UPDATE ON research_organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_score();

COMMENT ON TABLE organization_verification_attempts IS 'Track all verification attempts and their outcomes';
COMMENT ON TABLE trusted_institutional_domains IS 'Pre-approved institutional domains for automated verification';
COMMENT ON TABLE academic_rankings IS 'Academic rankings data for verification scoring';
COMMENT ON FUNCTION calculate_verification_score IS 'Calculate verification score (0-100) based on multiple factors';