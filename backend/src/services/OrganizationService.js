const { createClient } = require('@supabase/supabase-js');

class OrganizationService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  // Create a new organization
  async createOrganization(organizationData, userId) {
    try {
      // Generate organization ID
      const orgId = `${organizationData.organizationType.toUpperCase()}_${organizationData.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now().toString().slice(-3)}`;

      // Insert organization
      const { data: organization, error: orgError } = await this.supabase
        .from('research_organizations')
        .insert({
          org_id: orgId,
          name: organizationData.name,
          organization_type: organizationData.organizationType,
          description: organizationData.description,
          website: organizationData.website,
          contact_email: organizationData.contactEmail,
          primary_contact_name: organizationData.primaryContactName,
          primary_contact_title: organizationData.primaryContactTitle,
          tax_id: organizationData.taxId,
          registration_number: organizationData.registrationNumber,
          research_areas: organizationData.researchAreas,
          address: organizationData.address,
          verification_status: 'unverified',
          verification_level: 'basic',
          verification_score: 0
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create organization membership for the creator
      const { error: membershipError } = await this.supabase
        .from('organization_memberships')
        .insert({
          user_id: userId,
          organization_id: organization.id,
          role: 'admin',
          permissions: ['manage_organization', 'invite_members', 'submit_studies', 'request_data_access'],
          is_active: true,
          approved_by: userId,
          approved_at: new Date().toISOString()
        });

      if (membershipError) throw membershipError;

      // Create approval workflow
      const { error: workflowError } = await this.supabase
        .from('organization_approval_workflow')
        .insert({
          organization_id: organization.id,
          status: 'draft',
          initiated_by: userId
        });

      if (workflowError) throw workflowError;

      // Update user role to org_admin
      const { error: userError } = await this.supabase
        .from('user_profiles')
        .update({ role: 'org_admin' })
        .eq('id', userId);

      if (userError) throw userError;

      return { success: true, organization };
    } catch (error) {
      console.error('Error creating organization:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload organization document
  async uploadDocument(organizationId, documentData, userId) {
    try {
      const { data: document, error } = await this.supabase
        .from('organization_documents')
        .insert({
          organization_id: organizationId,
          document_type: documentData.type,
          document_name: documentData.name,
          file_path: documentData.filePath,
          file_hash: documentData.fileHash,
          file_size: documentData.fileSize,
          mime_type: documentData.mimeType,
          status: 'uploaded',
          uploaded_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      // Check if all required documents are now submitted
      await this.checkRequiredDocuments(organizationId);

      return { success: true, document };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if organization has all required documents
  async checkRequiredDocuments(organizationId) {
    try {
      const { data: hasAllDocs } = await this.supabase
        .rpc('check_required_documents_submitted', { org_id: organizationId });

      if (hasAllDocs) {
        // Update workflow status
        await this.supabase
          .from('organization_approval_workflow')
          .update({
            status: 'documents_submitted',
            required_documents_submitted: true
          })
          .eq('organization_id', organizationId);

        // Trigger verification score calculation
        await this.calculateVerificationScore(organizationId);
      }

      return hasAllDocs;
    } catch (error) {
      console.error('Error checking required documents:', error);
      return false;
    }
  }

  // Calculate verification score
  async calculateVerificationScore(organizationId) {
    try {
      const { data: score } = await this.supabase
        .rpc('calculate_verification_score', { org_id: organizationId });

      // Update organization with new score
      await this.supabase
        .from('research_organizations')
        .update({ verification_score: score })
        .eq('id', organizationId);

      return score;
    } catch (error) {
      console.error('Error calculating verification score:', error);
      return 0;
    }
  }

  // Get organization by ID
  async getOrganization(organizationId) {
    try {
      const { data: organization, error } = await this.supabase
        .from('research_organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      return { success: true, organization };
    } catch (error) {
      console.error('Error getting organization:', error);
      return { success: false, error: error.message };
    }
  }

  // Get organizations for approval (platform admin)
  async getOrganizationsForApproval(status = null) {
    try {
      let query = this.supabase
        .from('research_organizations')
        .select(`
          *,
          organization_approval_workflow(*),
          organization_documents(*)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('verification_status', status);
      }

      const { data: organizations, error } = await query;

      if (error) throw error;

      return { success: true, organizations };
    } catch (error) {
      console.error('Error getting organizations for approval:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve organization (platform admin)
  async approveOrganization(organizationId, reviewerId, notes = null) {
    try {
      // Update organization status
      const { error: orgError } = await this.supabase
        .from('research_organizations')
        .update({
          verification_status: 'verified',
          verification_level: 'standard'
        })
        .eq('id', organizationId);

      if (orgError) throw orgError;

      // Update workflow
      const { error: workflowError } = await this.supabase
        .from('organization_approval_workflow')
        .update({
          status: 'approved',
          platform_admin_reviewer: reviewerId,
          approval_decision: 'approved',
          decision_reason: notes,
          decision_made_by: reviewerId,
          decision_made_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId);

      if (workflowError) throw workflowError;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'org_approved',
          target_organization_id: organizationId,
          performed_by: reviewerId,
          details: { notes }
        });

      return { success: true };
    } catch (error) {
      console.error('Error approving organization:', error);
      return { success: false, error: error.message };
    }
  }

  // Reject organization (platform admin)
  async rejectOrganization(organizationId, reviewerId, reason) {
    try {
      // Update organization status
      const { error: orgError } = await this.supabase
        .from('research_organizations')
        .update({
          verification_status: 'rejected'
        })
        .eq('id', organizationId);

      if (orgError) throw orgError;

      // Update workflow
      const { error: workflowError } = await this.supabase
        .from('organization_approval_workflow')
        .update({
          status: 'rejected',
          platform_admin_reviewer: reviewerId,
          approval_decision: 'rejected',
          decision_reason: reason,
          decision_made_by: reviewerId,
          decision_made_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId);

      if (workflowError) throw workflowError;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'org_rejected',
          target_organization_id: organizationId,
          performed_by: reviewerId,
          details: { reason }
        });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting organization:', error);
      return { success: false, error: error.message };
    }
  }

  // Get organization members
  async getOrganizationMembers(organizationId) {
    try {
      const { data: members, error } = await this.supabase
        .from('organization_memberships')
        .select(`
          *,
          user_profiles(
            id,
            first_name,
            last_name,
            email,
            title,
            department
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (error) throw error;

      return { success: true, members };
    } catch (error) {
      console.error('Error getting organization members:', error);
      return { success: false, error: error.message };
    }
  }

  // Invite user to organization
  async inviteUserToOrganization(organizationId, userEmail, role, inviterId, permissions = []) {
    try {
      // Find user by email
      const { data: user, error: userError } = await this.supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) throw new Error('User not found');

      // Check if user is already a member
      const { data: existingMembership } = await this.supabase
        .from('organization_memberships')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existingMembership) {
        throw new Error('User is already a member of this organization');
      }

      // Create membership
      const { error: membershipError } = await this.supabase
        .from('organization_memberships')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          role,
          permissions,
          invited_by: inviterId,
          is_active: true,
          approved_by: inviterId,
          approved_at: new Date().toISOString()
        });

      if (membershipError) throw membershipError;

      // Log audit event
      await this.supabase
        .from('authorization_audit_log')
        .insert({
          action: 'member_added',
          target_organization_id: organizationId,
          target_user_id: user.id,
          performed_by: inviterId,
          details: { role, permissions }
        });

      return { success: true };
    } catch (error) {
      console.error('Error inviting user to organization:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's organizations
  async getUserOrganizations(userId) {
    try {
      const { data: memberships, error } = await this.supabase
        .from('organization_memberships')
        .select(`
          organization_id,
          role,
          permissions,
          research_organizations (
            id,
            name,
            org_id,
            organization_type,
            verification_status,
            verification_level
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return { success: true, organizations: memberships };
    } catch (error) {
      console.error('Error getting user organizations:', error);
      return { success: false, error: error.message };
    }
  }

  // Domain verification check
  async verifyEmailDomain(organizationId, email) {
    try {
      const domain = email.split('@')[1];
      
      // Check if domain is in trusted domains
      const { data: trustedDomain } = await this.supabase
        .from('trusted_institutional_domains')
        .select('*')
        .eq('domain', domain)
        .eq('is_active', true)
        .single();

      if (trustedDomain) {
        // Update organization with domain verification
        await this.supabase
          .from('research_organizations')
          .update({
            domain_verification: true,
            academic_ranking_verified: true // If it's a trusted domain
          })
          .eq('id', organizationId);

        // Update workflow
        await this.supabase
          .from('organization_approval_workflow')
          .update({
            email_domain_verified: true
          })
          .eq('organization_id', organizationId);

        return { success: true, trusted: true, institution: trustedDomain };
      }

      return { success: true, trusted: false };
    } catch (error) {
      console.error('Error verifying email domain:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = OrganizationService;