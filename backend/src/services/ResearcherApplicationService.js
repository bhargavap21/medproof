const { supabase } = require('../lib/supabase');

class ResearcherApplicationService {
    async createApplication(applicationData) {
        try {
            const { data, error } = await supabase
                .from('researcher_applications')
                .insert({
                    user_id: applicationData.user_id,
                    hospital_id: applicationData.hospital_id,
                    application_data: applicationData,
                    requested_permissions: applicationData.requested_permissions || [],
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            // Log audit entry
            await this.logAuditEntry('application_submitted', applicationData.user_id, null, applicationData.hospital_id, {
                requested_permissions: applicationData.requested_permissions,
                department: applicationData.department
            });

            return { success: true, data };
        } catch (error) {
            console.error('Error creating researcher application:', error);
            return { success: false, error: error.message };
        }
    }

    async getPendingApplications(hospitalId, adminUserId) {
        try {
            // Verify admin has permission to view applications for this hospital
            const { data: adminProfile } = await supabase
                .from('user_profiles')
                .select('hospital_id, role')
                .eq('id', adminUserId)
                .single();

            if (!adminProfile || 
                (adminProfile.role !== 'hospital_admin' && adminProfile.role !== 'super_admin') ||
                (adminProfile.role === 'hospital_admin' && adminProfile.hospital_id !== hospitalId)) {
                throw new Error('Insufficient permissions');
            }

            const { data, error } = await supabase
                .from('researcher_applications')
                .select(`
                    *,
                    user_profiles!researcher_applications_user_id_fkey (
                        first_name,
                        last_name,
                        email,
                        wallet_address
                    ),
                    hospitals!researcher_applications_hospital_id_fkey (
                        name,
                        hospital_id
                    )
                `)
                .eq('hospital_id', hospitalId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching pending applications:', error);
            return { success: false, error: error.message };
        }
    }

    async approveApplication(applicationId, reviewerId, permissions = []) {
        try {
            // Start transaction
            const { data: application, error: fetchError } = await supabase
                .from('researcher_applications')
                .select('*')
                .eq('id', applicationId)
                .single();

            if (fetchError) throw fetchError;
            if (!application) throw new Error('Application not found');

            // Update application status
            const { error: updateError } = await supabase
                .from('researcher_applications')
                .update({
                    status: 'approved',
                    reviewed_by: reviewerId,
                    reviewed_at: new Date().toISOString(),
                    review_notes: 'Application approved'
                })
                .eq('id', applicationId);

            if (updateError) throw updateError;

            // Update user role to researcher
            const { error: roleUpdateError } = await supabase
                .from('user_profiles')
                .update({
                    role: 'researcher',
                    hospital_id: application.hospital_id
                })
                .eq('id', application.user_id);

            if (roleUpdateError) throw roleUpdateError;

            // Create hospital authorization record
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('wallet_address')
                .eq('id', application.user_id)
                .single();

            if (userProfile?.wallet_address) {
                const { error: authError } = await supabase
                    .from('hospital_authorizations')
                    .insert({
                        user_id: application.user_id,
                        hospital_id: application.hospital_id,
                        authorized_by: reviewerId,
                        permissions: permissions.length > 0 ? permissions : application.requested_permissions,
                        wallet_address: userProfile.wallet_address,
                        is_active: true
                    });

                if (authError) throw authError;
            }

            // Log audit entry
            await this.logAuditEntry('approve', application.user_id, reviewerId, application.hospital_id, {
                permissions: permissions.length > 0 ? permissions : application.requested_permissions,
                application_id: applicationId
            });

            return { success: true, message: 'Application approved successfully' };
        } catch (error) {
            console.error('Error approving application:', error);
            return { success: false, error: error.message };
        }
    }

    async rejectApplication(applicationId, reviewerId, reason = '') {
        try {
            const { data: application, error: fetchError } = await supabase
                .from('researcher_applications')
                .select('*')
                .eq('id', applicationId)
                .single();

            if (fetchError) throw fetchError;
            if (!application) throw new Error('Application not found');

            const { error: updateError } = await supabase
                .from('researcher_applications')
                .update({
                    status: 'rejected',
                    reviewed_by: reviewerId,
                    reviewed_at: new Date().toISOString(),
                    review_notes: reason
                })
                .eq('id', applicationId);

            if (updateError) throw updateError;

            // Log audit entry
            await this.logAuditEntry('reject', application.user_id, reviewerId, application.hospital_id, {
                reason: reason,
                application_id: applicationId
            });

            return { success: true, message: 'Application rejected' };
        } catch (error) {
            console.error('Error rejecting application:', error);
            return { success: false, error: error.message };
        }
    }

    async revokeResearcherAccess(researcherId, adminId, reason = '') {
        try {
            // Get researcher info
            const { data: researcher, error: fetchError } = await supabase
                .from('user_profiles')
                .select('hospital_id')
                .eq('id', researcherId)
                .single();

            if (fetchError) throw fetchError;

            // Deactivate hospital authorization
            const { error: revokeError } = await supabase
                .from('hospital_authorizations')
                .update({
                    is_active: false,
                    revoked_at: new Date().toISOString(),
                    revoked_by: adminId,
                    revoke_reason: reason
                })
                .eq('user_id', researcherId);

            if (revokeError) throw revokeError;

            // Update user role back to public
            const { error: roleUpdateError } = await supabase
                .from('user_profiles')
                .update({
                    role: 'public',
                    hospital_id: null
                })
                .eq('id', researcherId);

            if (roleUpdateError) throw roleUpdateError;

            // Log audit entry
            await this.logAuditEntry('revoke', researcherId, adminId, researcher.hospital_id, {
                reason: reason
            });

            return { success: true, message: 'Researcher access revoked' };
        } catch (error) {
            console.error('Error revoking researcher access:', error);
            return { success: false, error: error.message };
        }
    }

    async getHospitalResearchers(hospitalId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
                    *,
                    hospital_authorizations!hospital_authorizations_user_id_fkey (
                        permissions,
                        created_at,
                        is_active
                    )
                `)
                .eq('hospital_id', hospitalId)
                .eq('role', 'researcher');

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching hospital researchers:', error);
            return { success: false, error: error.message };
        }
    }

    async logAuditEntry(action, targetUserId, performedBy, hospitalId, details = {}) {
        try {
            await supabase
                .from('authorization_audit_log')
                .insert({
                    action,
                    target_user_id: targetUserId,
                    performed_by: performedBy,
                    hospital_id: hospitalId,
                    details: details
                });
        } catch (error) {
            console.error('Error logging audit entry:', error);
        }
    }

    async getAuditLog(hospitalId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('authorization_audit_log')
                .select(`
                    *,
                    target_user:user_profiles!authorization_audit_log_target_user_id_fkey (
                        first_name,
                        last_name,
                        email
                    ),
                    performer:user_profiles!authorization_audit_log_performed_by_fkey (
                        first_name,
                        last_name,
                        email
                    )
                `)
                .eq('hospital_id', hospitalId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            console.error('Error fetching audit log:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = ResearcherApplicationService;