const { createClient } = require('@supabase/supabase-js');

class HospitalDataAccessService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    );
  }

  // Create a new data access request
  async createDataAccessRequest(requestData, requesterId) {
    try {
      const { data: request, error } = await this.supabase
        .from('hospital_data_access_requests')
        .insert({
          organization_id: requestData.organizationId,
          hospital_id: requestData.hospitalId,
          request_type: requestData.requestType || 'data_access',
          requested_permissions: requestData.requestedPermissions,
          intended_use_case: requestData.intendedUseCase,
          data_retention_period: requestData.dataRetentionPeriod || 24,
          research_title: requestData.researchTitle,
          research_description: requestData.researchDescription,
          research_methodology: requestData.researchMethodology,
          expected_outcomes: requestData.expectedOutcomes,
          publication_plans: requestData.publicationPlans,
          irb_approval_number: requestData.irbApprovalNumber,
          irb_approval_date: requestData.irbApprovalDate,
          ethics_committee: requestData.ethicsCommittee,
          data_security_plan: requestData.dataSecurityPlan,
          hipaa_compliance_confirmed: requestData.hipaaCompliance || false,
          gdpr_compliance_confirmed: requestData.gdprCompliance || false,
          requested_by: requesterId,
          status: 'approved' // 🚀 HACKATHON MODE: Auto-approve all requests
        })
        .select()
        .single();

      if (error) throw error;

      // 🚀 HACKATHON MODE: Automatically create agreement for approved request
      console.log('🚀 HACKATHON MODE: Auto-approving request and creating agreement');
      
      const { data: agreement, error: agreementError } = await this.supabase
        .from('hospital_organization_agreements')
        .insert({
          organization_id: requestData.organizationId,
          hospital_id: requestData.hospitalId,
          permissions: requestData.requestedPermissions,
          data_scope: requestData.requestedPermissions,
          status: 'approved',
          effective_date: new Date().toISOString().split('T')[0],
          expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (agreementError) {
        console.error('Error creating agreement:', agreementError);
        // Continue even if agreement creation fails
      } else {
        console.log('✅ Auto-created agreement:', agreement.id);
      }

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'data_access_auto_approved',
          target_organization_id: requestData.organizationId,
          performed_by: requesterId,
          hospital_id: requestData.hospitalId,
          details: {
            request_type: requestData.requestType,
            permissions: requestData.requestedPermissions,
            hackathon_mode: true,
            agreement_id: agreement?.id
          }
        });

      return { 
        success: true, 
        request,
        agreement: agreement || null,
        message: '🚀 HACKATHON MODE: Request auto-approved and agreement created!'
      };
    } catch (error) {
      console.error('Error creating data access request:', error);
      return { success: false, error: error.message };
    }
  }

  // Get data access requests for a hospital
  async getHospitalDataRequests(hospitalId, status = null) {
    try {
      let query = this.supabase
        .from('hospital_data_access_requests')
        .select(`
          *,
          research_organizations (
            id,
            name,
            org_id,
            organization_type,
            verification_status,
            verification_score,
            primary_contact_name,
            contact_email
          )
        `)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: requests, error } = await query;

      if (error) throw error;

      return { success: true, requests };
    } catch (error) {
      console.error('Error getting hospital data requests:', error);
      return { success: false, error: error.message };
    }
  }

  // Get data access requests for an organization
  async getOrganizationDataRequests(organizationId, status = null) {
    try {
      let query = this.supabase
        .from('hospital_data_access_requests')
        .select(`
          *,
          hospitals (
            id,
            name,
            hospital_id,
            institution_type
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: requests, error } = await query;

      if (error) throw error;

      return { success: true, requests };
    } catch (error) {
      console.error('Error getting organization data requests:', error);
      return { success: false, error: error.message };
    }
  }

  // Hospital approves data access request
  async approveDataAccessRequest(requestId, reviewerId, approvalData) {
    try {
      // Update the request
      const { error: requestError } = await this.supabase
        .from('hospital_data_access_requests')
        .update({
          status: 'approved',
          hospital_decision: 'approved',
          hospital_decision_reason: approvalData.reason,
          hospital_decision_date: new Date().toISOString(),
          hospital_reviewer: reviewerId,
          approved_permissions: approvalData.approvedPermissions,
          data_access_conditions: approvalData.conditions || [],
          monitoring_requirements: approvalData.monitoringRequirements || [],
          agreement_start_date: approvalData.startDate,
          agreement_end_date: approvalData.endDate,
          renewable: approvalData.renewable || true
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Get request details to create agreement
      const { data: request, error: getError } = await this.supabase
        .from('hospital_data_access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (getError) throw getError;

      // Create hospital-organization agreement
      const { error: agreementError } = await this.supabase
        .from('hospital_organization_agreements')
        .insert({
          hospital_id: request.hospital_id,
          organization_id: request.organization_id,
          agreement_type: request.request_type,
          permissions: approvalData.approvedPermissions,
          data_scope: approvalData.dataScope || [],
          max_studies_per_year: approvalData.maxStudiesPerYear || 10,
          data_retention_months: request.data_retention_period,
          requires_irb_approval: true,
          status: 'approved',
          requested_by: request.requested_by,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: approvalData.reason,
          effective_date: approvalData.startDate,
          expiration_date: approvalData.endDate,
          is_active: true
        });

      if (agreementError) throw agreementError;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'data_access_approved',
          target_organization_id: request.organization_id,
          performed_by: reviewerId,
          hospital_id: request.hospital_id,
          details: {
            request_id: requestId,
            approved_permissions: approvalData.approvedPermissions,
            conditions: approvalData.conditions
          }
        });

      return { success: true };
    } catch (error) {
      console.error('Error approving data access request:', error);
      return { success: false, error: error.message };
    }
  }

  // Hospital rejects data access request
  async rejectDataAccessRequest(requestId, reviewerId, reason) {
    try {
      // Get request details first
      const { data: request, error: getError } = await this.supabase
        .from('hospital_data_access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (getError) throw getError;

      // Update the request
      const { error: requestError } = await this.supabase
        .from('hospital_data_access_requests')
        .update({
          status: 'rejected',
          hospital_decision: 'rejected',
          hospital_decision_reason: reason,
          hospital_decision_date: new Date().toISOString(),
          hospital_reviewer: reviewerId
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'data_access_rejected',
          target_organization_id: request.organization_id,
          performed_by: reviewerId,
          hospital_id: request.hospital_id,
          details: {
            request_id: requestId,
            reason: reason
          }
        });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting data access request:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active agreements for a hospital
  async getHospitalAgreements(hospitalId, status = 'approved') {
    try {
      const { data: agreements, error } = await this.supabase
        .from('hospital_organization_agreements')
        .select(`
          *,
          research_organizations (
            id,
            name,
            org_id,
            organization_type,
            verification_status
          )
        `)
        .eq('hospital_id', hospitalId)
        .eq('status', status)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, agreements };
    } catch (error) {
      console.error('Error getting hospital agreements:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active agreements for an organization
  async getOrganizationAgreements(organizationId, status = 'approved') {
    try {
      const { data: agreements, error } = await this.supabase
        .from('hospital_organization_agreements')
        .select(`
          *,
          hospitals (
            id,
            name,
            hospital_id,
            institution_type
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', status)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, agreements };
    } catch (error) {
      console.error('Error getting organization agreements:', error);
      return { success: false, error: error.message };
    }
  }

  // Suspend/revoke an agreement
  async suspendAgreement(agreementId, reviewerId, reason) {
    try {
      // Get agreement details first
      const { data: agreement, error: getError } = await this.supabase
        .from('hospital_organization_agreements')
        .select('*')
        .eq('id', agreementId)
        .single();

      if (getError) throw getError;

      // Update agreement status
      const { error: updateError } = await this.supabase
        .from('hospital_organization_agreements')
        .update({
          status: 'suspended',
          is_active: false,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: reason
        })
        .eq('id', agreementId);

      if (updateError) throw updateError;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'agreement_suspended',
          target_organization_id: agreement.organization_id,
          performed_by: reviewerId,
          hospital_id: agreement.hospital_id,
          details: {
            agreement_id: agreementId,
            reason: reason
          }
        });

      return { success: true };
    } catch (error) {
      console.error('Error suspending agreement:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if organization has access to hospital data
  async checkDataAccess(organizationId, hospitalId) {
    try {
      const { data: agreement, error } = await this.supabase
        .from('hospital_organization_agreements')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('hospital_id', hospitalId)
        .eq('status', 'approved')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        success: true,
        hasAccess: !!agreement,
        agreement: agreement || null
      };
    } catch (error) {
      console.error('Error checking data access:', error);
      return { success: false, error: error.message };
    }
  }

  // Get hospital settings
  async getHospitalSettings(hospitalId) {
    try {
      const { data: hospital, error } = await this.supabase
        .from('hospitals')
        .select('settings')
        .eq('id', hospitalId)
        .single();

      if (error) throw error;

      return { success: true, settings: hospital.settings || {} };
    } catch (error) {
      console.error('Error getting hospital settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Update hospital settings
  async updateHospitalSettings(hospitalId, settings, updatedBy) {
    try {
      const { error } = await this.supabase
        .from('hospitals')
        .update({
          settings: settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', hospitalId);

      if (error) throw error;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'hospital_settings_updated',
          performed_by: updatedBy,
          hospital_id: hospitalId,
          details: { updated_settings: settings }
        });

      return { success: true };
    } catch (error) {
      console.error('Error updating hospital settings:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = HospitalDataAccessService;