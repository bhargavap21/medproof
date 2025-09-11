import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Switch,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  LocalHospital,
  Business,
  Security,
  Assessment,
  Settings,
  Visibility,
  Description,
  AdminPanelSettings,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface HospitalDataRequest {
  id: string;
  organization_id: string;
  hospital_id: string;
  request_type: string;
  requested_permissions: string[];
  intended_use_case: string;
  data_retention_period: number;
  research_title?: string;
  research_description?: string;
  research_methodology?: string;
  irb_approval_number?: string;
  irb_approval_date?: string;
  data_security_plan?: string;
  hipaa_compliance_confirmed: boolean;
  gdpr_compliance_confirmed: boolean;
  status: string;
  hospital_decision?: string;
  hospital_decision_reason?: string;
  created_at: string;
  organization?: {
    name: string;
    org_id: string;
    organization_type: string;
    verification_status: string;
    verification_score: number;
    primary_contact_name?: string;
    contact_email: string;
  };
}

interface Agreement {
  id: string;
  hospital_id: string;
  organization_id: string;
  agreement_type: string;
  permissions: string[];
  data_scope: string[];
  max_studies_per_year: number;
  data_retention_months: number;
  status: string;
  effective_date: string;
  expiration_date: string;
  organization?: {
    name: string;
    org_id: string;
    organization_type: string;
  };
}

const HospitalDataAccessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<HospitalDataRequest[]>([]);
  const [activeAgreements, setActiveAgreements] = useState<Agreement[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HospitalDataRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  const [loading, setLoading] = useState(true);

  // Sample data for development
  const sampleRequests: HospitalDataRequest[] = [
    {
      id: '1',
      organization_id: '1',
      hospital_id: 'MAYO_CLINIC_001',
      request_type: 'data_access',
      requested_permissions: ['submit_studies', 'view_aggregated_data', 'export_anonymized_data'],
      intended_use_case: 'Cardiovascular outcomes research focusing on long-term patient outcomes after cardiac procedures',
      data_retention_period: 24,
      research_title: 'Long-term Outcomes in Cardiac Intervention Patients',
      research_description: 'Comprehensive analysis of 5-year outcomes following various cardiac interventions',
      research_methodology: 'Retrospective cohort study using anonymized patient data',
      irb_approval_number: 'IRB-2024-001',
      irb_approval_date: '2024-01-10',
      data_security_plan: 'Data will be stored in HIPAA-compliant cloud infrastructure with end-to-end encryption',
      hipaa_compliance_confirmed: true,
      gdpr_compliance_confirmed: true,
      status: 'documents_submitted',
      created_at: '2024-01-15T00:00:00Z',
      organization: {
        name: 'Stanford University School of Medicine',
        org_id: 'STANFORD_MED_001',
        organization_type: 'university',
        verification_status: 'verified',
        verification_score: 95,
        primary_contact_name: 'Dr. Jennifer Chen',
        contact_email: 'research@stanford.edu'
      }
    },
    {
      id: '2',
      organization_id: '2',
      hospital_id: 'MAYO_CLINIC_001',
      request_type: 'data_access',
      requested_permissions: ['submit_studies', 'view_aggregated_data'],
      intended_use_case: 'Genomic research for rare disease identification and treatment development',
      data_retention_period: 36,
      research_title: 'Genomic Markers in Rare Diseases',
      research_description: 'Identification of novel genomic markers associated with rare metabolic disorders',
      irb_approval_number: 'IRB-BROAD-2024-005',
      irb_approval_date: '2024-01-08',
      hipaa_compliance_confirmed: true,
      gdpr_compliance_confirmed: false,
      status: 'documents_submitted',
      created_at: '2024-01-12T00:00:00Z',
      organization: {
        name: 'Broad Institute',
        org_id: 'BROAD_INSTITUTE_001',
        organization_type: 'research_institute',
        verification_status: 'verified',
        verification_score: 88,
        primary_contact_name: 'Dr. Sarah Williams',
        contact_email: 'contact@broadinstitute.org'
      }
    }
  ];

  const sampleAgreements: Agreement[] = [
    {
      id: '1',
      hospital_id: 'MAYO_CLINIC_001',
      organization_id: '1',
      agreement_type: 'data_access',
      permissions: ['submit_studies', 'view_aggregated_data'],
      data_scope: ['cardiology', 'internal_medicine'],
      max_studies_per_year: 20,
      data_retention_months: 24,
      status: 'approved',
      effective_date: '2024-01-01',
      expiration_date: '2026-01-01',
      organization: {
        name: 'Stanford University School of Medicine',
        org_id: 'STANFORD_MED_001',
        organization_type: 'university'
      }
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setPendingRequests(sampleRequests);
    setActiveAgreements(sampleAgreements);
    setLoading(false);
  }, []);

  const handleReviewRequest = (request: HospitalDataRequest) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    // Update request status
    setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
    
    // Create new agreement
    const newAgreement: Agreement = {
      id: Date.now().toString(),
      hospital_id: selectedRequest.hospital_id,
      organization_id: selectedRequest.organization_id,
      agreement_type: selectedRequest.request_type,
      permissions: selectedRequest.requested_permissions,
      data_scope: ['cardiology', 'internal_medicine'], // Would be configured
      max_studies_per_year: 15,
      data_retention_months: selectedRequest.data_retention_period,
      status: 'approved',
      effective_date: new Date().toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years
      organization: selectedRequest.organization
    };
    
    setActiveAgreements(prev => [...prev, newAgreement]);
    setReviewDialogOpen(false);
    setSelectedRequest(null);
    setDecisionReason('');
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    setPendingRequests(prev => prev.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'rejected', hospital_decision: 'rejected', hospital_decision_reason: decisionReason }
        : req
    ));
    
    setReviewDialogOpen(false);
    setSelectedRequest(null);
    setDecisionReason('');
  };

  const revokeAgreement = async (agreementId: string) => {
    setActiveAgreements(prev => prev.map(agreement => 
      agreement.id === agreementId 
        ? { ...agreement, status: 'suspended' }
        : agreement
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'documents_submitted': return 'warning';
      case 'rejected': return 'error';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalHospital fontSize="large" />
          Mayo Clinic - Data Access Management
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {pendingRequests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Requests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {activeAgreements.filter(a => a.status === 'approved').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Agreements
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {activeAgreements.reduce((sum, a) => sum + a.max_studies_per_year, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max Studies/Year
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Chip 
                  icon={<Security />} 
                  label="HIPAA Compliant" 
                  color="success" 
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Security Status
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab 
            label={`Pending Requests (${pendingRequests.length})`} 
            icon={<Schedule />} 
            iconPosition="start"
          />
          <Tab 
            label={`Active Agreements (${activeAgreements.length})`} 
            icon={<CheckCircle />} 
            iconPosition="start"
          />
          <Tab 
            label="Hospital Settings" 
            icon={<Settings />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Pending Requests Tab */}
      {activeTab === 0 && (
        <Box>
          {loading ? (
            <LinearProgress />
          ) : pendingRequests.length === 0 ? (
            <Alert severity="info">No pending data access requests</Alert>
          ) : (
            <Grid container spacing={3}>
              {pendingRequests.map(request => (
                <Grid item xs={12} key={request.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business />
                            {request.organization?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {request.organization?.org_id} • {request.organization?.organization_type.replace('_', ' ')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip 
                            label={`Score: ${request.organization?.verification_score}/100`} 
                            color="info"
                            size="small"
                          />
                          <Chip 
                            label={request.organization?.verification_status} 
                            color="success"
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {request.research_title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {request.intended_use_case}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Contact:</strong> {request.organization?.primary_contact_name} ({request.organization?.contact_email})
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>IRB Approval:</strong> {request.irb_approval_number} ({request.irb_approval_date})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Data Retention:</strong> {request.data_retention_period} months
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Compliance Status:</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                icon={request.hipaa_compliance_confirmed ? <CheckCircle /> : <Warning />}
                                label="HIPAA"
                                color={request.hipaa_compliance_confirmed ? 'success' : 'warning'}
                                size="small"
                              />
                              <Chip
                                icon={request.gdpr_compliance_confirmed ? <CheckCircle /> : <Warning />}
                                label="GDPR"
                                color={request.gdpr_compliance_confirmed ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Requested Permissions:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {request.requested_permissions.map(permission => (
                            <Chip 
                              key={permission} 
                              label={permission.replace(/_/g, ' ')} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleReviewRequest(request)}
                        >
                          Review Request
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Active Agreements Tab */}
      {activeTab === 1 && (
        <Box>
          {activeAgreements.length === 0 ? (
            <Alert severity="info">No active data access agreements</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Agreement Type</TableCell>
                    <TableCell>Data Scope</TableCell>
                    <TableCell>Max Studies/Year</TableCell>
                    <TableCell>Retention Period</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeAgreements.map(agreement => (
                    <TableRow key={agreement.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {agreement.organization?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {agreement.organization?.org_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={agreement.agreement_type.replace('_', ' ')} 
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {agreement.data_scope.map(scope => (
                          <Chip 
                            key={scope} 
                            label={scope} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>{agreement.max_studies_per_year}</TableCell>
                      <TableCell>{agreement.data_retention_months} months</TableCell>
                      <TableCell>{new Date(agreement.expiration_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={agreement.status} 
                          color={getStatusColor(agreement.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {agreement.status === 'approved' && (
                          <Button 
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => revokeAgreement(agreement.id)}
                          >
                            Suspend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Hospital Settings Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🏥 Hospital Information
                  </Typography>
                  <TextField 
                    fullWidth 
                    label="Hospital ID" 
                    value="MAYO_CLINIC_001" 
                    disabled 
                    margin="normal"
                  />
                  <TextField 
                    fullWidth 
                    label="Hospital Name" 
                    value="Mayo Clinic" 
                    disabled 
                    margin="normal"
                  />
                  <TextField 
                    fullWidth 
                    select 
                    label="Institution Type" 
                    defaultValue="academic_medical_center"
                    margin="normal"
                    SelectProps={{ native: true }}
                  >
                    <option value="academic_medical_center">Academic Medical Center</option>
                    <option value="community_hospital">Community Hospital</option>
                    <option value="research_hospital">Research Hospital</option>
                  </TextField>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🔐 Data Access Policies
                  </Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-approve known organizations"
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Require IRB approval for all requests"
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    fullWidth 
                    type="number" 
                    label="Default data retention period (months)" 
                    defaultValue="24" 
                    margin="normal"
                  />
                  <TextField 
                    fullWidth 
                    type="number" 
                    label="Maximum studies per organization per year" 
                    defaultValue="30" 
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Review Data Access Request
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedRequest.organization?.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {selectedRequest.research_title}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Research Description:</strong><br />
                {selectedRequest.research_description}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Methodology:</strong><br />
                {selectedRequest.research_methodology}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Data Security Plan:</strong><br />
                {selectedRequest.data_security_plan}
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Compliance Confirmations:</strong>
                </Typography>
                <FormControlLabel
                  control={<Checkbox checked={selectedRequest.hipaa_compliance_confirmed} disabled />}
                  label="HIPAA Compliance Confirmed"
                />
                <FormControlLabel
                  control={<Checkbox checked={selectedRequest.gdpr_compliance_confirmed} disabled />}
                  label="GDPR Compliance Confirmed"
                />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Decision Notes (optional)"
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                margin="normal"
                placeholder="Add any notes about your decision..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRejectRequest}
            color="error"
            variant="outlined"
          >
            Reject Request
          </Button>
          <Button 
            onClick={handleApproveRequest}
            color="success"
            variant="contained"
          >
            Approve Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalDataAccessDashboard;