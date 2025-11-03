import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Grid,
  Divider,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Business,
  Science,
  Schedule,
  VerifiedUser,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface DataAccessRequest {
  id: string;
  organization_id: string | null;
  hospital_id: string | null;
  request_type: string | null;
  requested_permissions: string[];
  intended_use_case: string;
  data_retention_period: number | null;
  research_title?: string | null;
  research_description?: string | null;
  research_methodology?: string | null;
  expected_outcomes?: string | null;
  publication_plans?: string | null;
  irb_approval_number?: string | null;
  irb_approval_date?: string | null;
  ethics_committee?: string | null;
  data_security_plan?: string | null;
  hipaa_compliance_confirmed: boolean;
  gdpr_compliance_confirmed: boolean;
  status: string;
  requested_by: string;
  hospital_reviewer?: string;
  hospital_decision?: string;
  hospital_decision_reason?: string;
  hospital_decision_date?: string;
  created_at: string;
  updated_at: string;
  research_organizations?: {
    name: string;
    org_id: string;
    organization_type: string;
    verification_status: string;
  };
  user_profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

const HospitalDataApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DataAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DataAccessRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewReason, setReviewReason] = useState('');
  const [approvedPermissions, setApprovedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospital_data_access_requests')
        .select(`
          *,
          research_organizations!inner(
            name,
            org_id,
            organization_type,
            verification_status
          ),
          user_profiles!hospital_data_access_requests_requested_by_fkey(
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Loaded requests:', data);
      // @ts-ignore - Database schema mismatch with interface types
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      setError(error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: DataAccessRequest) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleStartReview = (request: DataAccessRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setApprovedPermissions(action === 'approve' ? [...request.requested_permissions] : []);
    setReviewReason('');
    setReviewDialogOpen(true);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setApprovedPermissions(prev => 
      checked 
        ? [...prev, permission]
        : prev.filter(p => p !== permission)
    );
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest || !user) return;

    setSubmitting(true);
    try {
      const updates: any = {
        status: reviewAction === 'approve' ? 'approved' : 'rejected',
        hospital_reviewer: user.id,
        hospital_decision: reviewAction,
        hospital_decision_reason: reviewReason,
        hospital_decision_date: new Date().toISOString(),
        approved_permissions: reviewAction === 'approve' ? approvedPermissions : [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('hospital_data_access_requests')
        .update(updates)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // If approved, create a hospital-organization agreement
      if (reviewAction === 'approve') {
        const agreementData = {
          hospital_id: selectedRequest.hospital_id,
          organization_id: selectedRequest.organization_id,
          agreement_type: 'data_access',
          data_scope: approvedPermissions,
          permissions: approvedPermissions, // Required field
          data_retention_months: selectedRequest.data_retention_period || 12,
          status: 'approved' as const,
          requested_by: selectedRequest.requested_by,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewReason,
          effective_date: new Date().toISOString().split('T')[0],
          expiration_date: new Date(Date.now() + (selectedRequest.data_retention_period || 12) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true,
        };

        const { error: agreementError } = await supabase
          .from('hospital_organization_agreements')
          .insert([agreementData]);

        if (agreementError) {
          console.error('Error creating agreement:', agreementError);
          // Don't throw here, the request was still processed
        }
      }

      await loadRequests(); // Reload the data
      setReviewDialogOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'documents_required': return 'info';
      case 'under_review': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Loading Requests...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hospital Data Access Requests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve organization requests for hospital data access
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Research Title</TableCell>
              <TableCell>Permissions Requested</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {request.research_organizations?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.research_organizations?.org_id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {request.research_title || 'No title provided'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    by {request.user_profiles?.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {request.requested_permissions.length} permissions
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(request.created_at), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(request)}
                    >
                      View
                    </Button>
                    {(request.status === 'documents_required' || request.status === 'pending') && (
                      <>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleStartReview(request, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleStartReview(request, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {requests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No requests found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organizations haven't submitted any data access requests yet.
          </Typography>
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Organization Information</Typography>
                <Typography variant="body2"><strong>Name:</strong> {selectedRequest.research_organizations?.name}</Typography>
                <Typography variant="body2"><strong>ID:</strong> {selectedRequest.research_organizations?.org_id}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {selectedRequest.research_organizations?.organization_type}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {selectedRequest.research_organizations?.verification_status}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Request Information</Typography>
                <Typography variant="body2"><strong>Requested by:</strong> {selectedRequest.user_profiles?.email}</Typography>
                <Typography variant="body2"><strong>Retention Period:</strong> {selectedRequest.data_retention_period} months</Typography>
                <Typography variant="body2"><strong>HIPAA Compliant:</strong> {selectedRequest.hipaa_compliance_confirmed ? 'Yes' : 'No'}</Typography>
                <Typography variant="body2"><strong>GDPR Compliant:</strong> {selectedRequest.gdpr_compliance_confirmed ? 'Yes' : 'No'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Research Details</Typography>
                {selectedRequest.research_title && (
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>Title:</strong> {selectedRequest.research_title}</Typography>
                )}
                {selectedRequest.research_description && (
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>Description:</strong> {selectedRequest.research_description}</Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1 }}><strong>Intended Use:</strong> {selectedRequest.intended_use_case}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Requested Permissions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedRequest.requested_permissions.map((permission) => (
                    <Chip key={permission} label={permission} size="small" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve' : 'Reject'} Data Access Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedRequest.research_organizations?.name} - {selectedRequest.research_title || 'Data Access Request'}
                </Typography>
              </Grid>

              {reviewAction === 'approve' && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Approved Permissions</Typography>
                  <FormGroup>
                    {selectedRequest.requested_permissions.map((permission) => (
                      <FormControlLabel
                        key={permission}
                        control={
                          <Checkbox
                            checked={approvedPermissions.includes(permission)}
                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                          />
                        }
                        label={permission.replace('_', ' ').toUpperCase()}
                      />
                    ))}
                  </FormGroup>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  required={reviewAction === 'reject'}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            disabled={submitting || (reviewAction === 'reject' && !reviewReason.trim())}
          >
            {submitting ? 'Submitting...' : (reviewAction === 'approve' ? 'Approve Request' : 'Reject Request')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalDataApprovalDashboard;