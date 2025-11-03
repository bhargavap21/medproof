import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface PendingApplication {
  id: string;
  research_organizations: {
    name: string;
    org_id: string;
    organization_type: string;
  } | null;
  research_title: string | null;
  research_description: string | null;
  requested_permissions: string[];
  intended_use_case: string;
  created_at: string | null;
}

interface AuthorizedOrganization {
  id: string;
  research_organizations: {
    name: string;
    org_id: string;
    organization_type: string;
    verification_status: string | null;
  } | null;
  permissions: string[];
  created_at: string | null;
  is_active: boolean | null;
  status: string | null;
}

export const useAdminData = () => {
  const { user, profile } = useAuth();
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [authorizedOrganizations, setAuthorizedOrganizations] = useState<AuthorizedOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingApplications = async () => {
    if (!profile || !user?.id || profile.role !== 'hospital_admin') return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospital_data_access_requests')
        .select(`
          *,
          research_organizations (
            name,
            org_id,
            organization_type
          )
        `)
        .eq('status', 'documents_submitted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingApplications(data || []);
    } catch (err) {
      console.error('Error fetching pending applications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorizedOrganizations = async () => {
    if (!profile || profile.role !== 'hospital_admin') return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospital_organization_agreements')
        .select(`
          *,
          research_organizations (
            name,
            org_id,
            organization_type,
            verification_status
          )
        `)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) throw error;

      setAuthorizedOrganizations(data || []);
    } catch (err) {
      console.error('Error fetching authorized organizations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (applicationId: string, permissions?: string[]) => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    try {
      setLoading(true);
      
      // Find the application
      const application = pendingApplications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Update data access request status
      const { error: updateError } = await supabase
        .from('hospital_data_access_requests')
        .update({
          status: 'approved',
          hospital_reviewer: user.id,
          hospital_decision_date: new Date().toISOString(),
          hospital_decision: 'approved',
          approved_permissions: permissions || application.requested_permissions
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Refresh data
      await Promise.all([fetchPendingApplications(), fetchAuthorizedOrganizations()]);

      return { success: true };
    } catch (err) {
      console.error('Error approving application:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const rejectApplication = async (applicationId: string, reason?: string) => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('hospital_data_access_requests')
        .update({
          status: 'rejected',
          hospital_reviewer: user.id,
          hospital_decision_date: new Date().toISOString(),
          hospital_decision: 'rejected',
          hospital_decision_reason: reason || 'Application rejected'
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh data
      await fetchPendingApplications();

      return { success: true };
    } catch (err) {
      console.error('Error rejecting application:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const revokeOrganizationAccess = async (agreementId: string, reason?: string) => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    try {
      setLoading(true);

      // Deactivate organization agreement
      const { error: revokeError } = await supabase
        .from('hospital_organization_agreements')
        .update({
          is_active: false,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          review_notes: reason || 'Access revoked',
          status: 'suspended'
        })
        .eq('id', agreementId);

      if (revokeError) throw revokeError;

      // Refresh data
      await fetchAuthorizedOrganizations();

      return { success: true };
    } catch (err) {
      console.error('Error revoking organization access:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!profile || profile.role !== 'hospital_admin') return;

    const applicationsSubscription = supabase
      .channel('hospital_data_access_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hospital_data_access_requests'
      }, () => {
        fetchPendingApplications();
      })
      .subscribe();

    const agreementsSubscription = supabase
      .channel('hospital_organization_agreements')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hospital_organization_agreements'
      }, () => {
        fetchAuthorizedOrganizations();
      })
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
      agreementsSubscription.unsubscribe();
    };
  }, [profile?.role]);

  // Initial data fetch
  useEffect(() => {
    if (profile && (profile.role === 'hospital_admin' || profile.role === 'super_admin')) {
      fetchPendingApplications();
      fetchAuthorizedOrganizations();
    }
  }, [profile?.role]);

  return {
    pendingApplications,
    authorizedOrganizations,
    loading,
    error,
    approveApplication,
    rejectApplication,
    revokeOrganizationAccess,
    refetch: () => Promise.all([fetchPendingApplications(), fetchAuthorizedOrganizations()])
  };
};