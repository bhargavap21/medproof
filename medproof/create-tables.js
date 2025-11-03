const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('\n📦 Creating study marketplace tables...\n');

  try {
    // First, let's check if research_organizations table exists
    const { data: orgs, error: orgError } = await supabase
      .from('research_organizations')
      .select('id, name')
      .limit(1);

    if (orgError) {
      console.error('❌ Cannot access research_organizations table:', orgError.message);
      console.log('\n💡 You need to run this SQL in the Supabase SQL Editor:');
      console.log('👉 Go to: https://supabase.com/dashboard/project/[your-project]/sql\n');
      console.log('Copy and paste the SQL from: medproof/database/create_study_marketplace.sql\n');
      return;
    }

    if (!orgs || orgs.length === 0) {
      console.log('⚠️  No research organizations found. Creating sample data...');

      // Insert a sample organization
      const { data: newOrg, error: insertOrgError } = await supabase
        .from('research_organizations')
        .insert({
          name: 'University Medical Research Center',
          institution_type: 'academic',
          research_focus_areas: ['diabetes', 'cardiology', 'oncology'],
          verified: true
        })
        .select()
        .single();

      if (insertOrgError) {
        console.error('❌ Error creating organization:', insertOrgError.message);
      } else {
        console.log('✅ Created sample organization:', newOrg.name);
      }
    }

    // Check if study_requests table exists
    const { data: studies, error: studyError } = await supabase
      .from('study_requests')
      .select('id')
      .limit(1);

    if (studyError) {
      if (studyError.message.includes('does not exist') || studyError.code === '42P01') {
        console.log('\n❌ study_requests table does not exist!\n');
        console.log('📋 Please run the following SQL in Supabase SQL Editor:');
        console.log('👉 https://supabase.com/dashboard/project/[your-project]/sql\n');
        console.log('='.repeat(80));
        console.log(`
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

-- Create indexes
CREATE INDEX idx_study_requests_status ON study_requests(status);
CREATE INDEX idx_study_requests_org ON study_requests(organization_id);
CREATE INDEX idx_hospital_interest_hospital ON hospital_study_interest(hospital_id);
CREATE INDEX idx_hospital_interest_study ON hospital_study_interest(study_request_id);
        `);
        console.log('='.repeat(80));
        console.log('\n✨ After running the SQL, you can add sample data with this script.\n');
      } else {
        console.error('❌ Error checking study_requests:', studyError.message);
      }
      return;
    }

    console.log('✅ study_requests table exists!');

    // Add sample data if table is empty
    if (!studies || studies.length === 0) {
      console.log('\n📝 Adding sample study data...\n');

      const { data: org } = await supabase
        .from('research_organizations')
        .select('id')
        .limit(1)
        .single();

      if (org) {
        const sampleStudies = [
          {
            organization_id: org.id,
            study_title: 'Long-term Effects of Diabetes Management',
            principal_investigator: 'Dr. Sarah Johnson',
            study_type: 'Observational',
            required_patient_count: 150,
            inclusion_criteria: 'Adults 18-65 with Type 2 Diabetes, HbA1c > 7.0%',
            exclusion_criteria: 'Pregnancy, Type 1 Diabetes, Recent cardiac event',
            timeline_months: 12,
            compensation_available: true,
            funding_amount: 125000,
            irb_approved: true,
            privacy_level: 'standard',
            status: 'open'
          },
          {
            organization_id: org.id,
            study_title: 'Novel Hypertension Treatment Protocol',
            principal_investigator: 'Dr. Michael Chen',
            study_type: 'Interventional',
            required_patient_count: 200,
            inclusion_criteria: 'Hypertension Stage 2, Age 40-70, No previous complications',
            exclusion_criteria: 'Secondary hypertension, Kidney disease, Recent stroke',
            timeline_months: 18,
            compensation_available: true,
            funding_amount: 250000,
            irb_approved: true,
            privacy_level: 'high',
            status: 'open'
          },
          {
            organization_id: org.id,
            study_title: 'Cancer Screening Adherence Study',
            principal_investigator: 'Dr. Emily Rodriguez',
            study_type: 'Survey',
            required_patient_count: 500,
            inclusion_criteria: 'Adults 50+, No cancer history, Due for screening',
            exclusion_criteria: 'Active cancer treatment, Mental health conditions affecting consent',
            timeline_months: 6,
            compensation_available: true,
            funding_amount: 75000,
            irb_approved: true,
            privacy_level: 'standard',
            status: 'open'
          }
        ];

        const { data, error } = await supabase
          .from('study_requests')
          .insert(sampleStudies)
          .select();

        if (error) {
          console.error('❌ Error inserting sample data:', error.message);
        } else {
          console.log(`✅ Created ${data.length} sample studies`);
          data.forEach(study => {
            console.log(`   - ${study.study_title}`);
          });
        }
      }
    } else {
      console.log(`ℹ️  Found ${studies.length} existing studies`);
    }

    console.log('\n✅ Setup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTables();
