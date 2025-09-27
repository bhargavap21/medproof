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
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Business,
  People,
  Description,
  Upload,
  Visibility,
  Edit,
  Delete,
  CloudUpload,
  AdminPanelSettings,
  Security,
  Settings,
  School,
  Science,
  Biotech,
  AccountBalance,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface Organization {
  id: string;
  org_id: string;
  name: string;
  organization_type: string;
  description: string;
  website: string;
  contact_email: string;
  verification_status: string;
  verification_level: string;
  verification_score: number;
  created_at: string;
  primary_contact_name?: string;
  research_areas?: string[];
}

interface OrganizationDocument {
  id: string;
  organization_id: string;
  document_type: string;
  document_name: string;
  status: string;
  uploaded_by: string;
  created_at: string;
  review_notes?: string;
}

interface DataAccessRequest {
  id: string;
  organization_id: string;
  hospital_id: string;
  request_type: string;
  requested_permissions: string[];
  intended_use_case: string;
  status: string;
  hospital_decision?: string;
  created_at: string;
}

const OrganizationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [documents, setDocuments] = useState<OrganizationDocument[]>([]);
  const [dataRequests, setDataRequests] = useState<DataAccessRequest[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Sample data for development
  const sampleOrganizations: Organization[] = [
    {
      id: '1',
      org_id: 'STANFORD_MED_001',
      name: 'Stanford University School of Medicine',
      organization_type: 'university',
      description: 'Leading medical research institution',
      website: 'https://med.stanford.edu',
      contact_email: 'research@stanford.edu',
      verification_status: 'verified',
      verification_level: 'premium',
      verification_score: 95,
      created_at: '2024-01-15T00:00:00Z',
      primary_contact_name: 'Dr. Jennifer Chen',
      research_areas: ['cardiology', 'oncology', 'neuroscience']
    },
    {
      id: '2',
      org_id: 'BROAD_INSTITUTE_001',
      name: 'Broad Institute',
      organization_type: 'research_institute',
      description: 'Genomic medicine and therapeutics',
      website: 'https://broadinstitute.org',
      contact_email: 'contact@broadinstitute.org',
      verification_status: 'documents_under_review',
      verification_level: 'standard',
      verification_score: 78,
      created_at: '2024-01-10T00:00:00Z',
      primary_contact_name: 'Dr. Sarah Williams',
      research_areas: ['genomics', 'drug_discovery', 'precision_medicine']
    }
  ];

  const sampleDocuments: OrganizationDocument[] = [
    {
      id: '1',
      organization_id: '1',
      document_type: 'institutional_registration',
      document_name: 'Stanford_University_Registration.pdf',
      status: 'approved',
      uploaded_by: 'Jennifer Chen',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2', 
      organization_id: '2',
      document_type: 'irb_ethics_approval',
      document_name: 'Broad_Institute_IRB_Approval.pdf',
      status: 'under_review',
      uploaded_by: 'Sarah Williams',
      created_at: '2024-01-10T14:30:00Z',
      review_notes: 'Document needs clearer expiration date'
    }
  ];

  const sampleDataRequests: DataAccessRequest[] = [
    {
      id: '1',
      organization_id: '1',
      hospital_id: 'MAYO_CLINIC_001',
      request_type: 'data_access',
      requested_permissions: ['submit_studies', 'view_aggregated_data'],
      intended_use_case: 'Cardiovascular outcomes research',
      status: 'approved',
      hospital_decision: 'approved',
      created_at: '2024-01-16T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setOrganizations(sampleOrganizations);
    setDocuments(sampleDocuments);
    setDataRequests(sampleDataRequests);
    setLoading(false);
  }, []);

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'documents_under_review': return 'warning';
      case 'documents_required': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getOrganizationIcon = (type: string) => {
    switch (type) {
      case 'university': return <School />;
      case 'research_institute': return <Science />;
      case 'biotech_company': return <Biotech />;
      case 'pharmaceutical': return <Biotech />;
      case 'government_agency': return <AccountBalance />;
      default: return <Business />;
    }
  };

  const approveOrganization = async (orgId: string) => {
    setOrganizations(prev => prev.map(org => 
      org.id === orgId 
        ? { ...org, verification_status: 'verified', verification_level: 'standard' }
        : org
    ));
  };

  const rejectOrganization = async (orgId: string) => {
    setOrganizations(prev => prev.map(org => 
      org.id === orgId 
        ? { ...org, verification_status: 'rejected' }
        : org
    ));
  };

  const approveDocument = async (docId: string) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId
        ? { ...doc, status: 'approved' }
        : doc
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings fontSize="large" />
          Organization Management Dashboard
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {organizations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Organizations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {organizations.filter(org => org.verification_status === 'verified').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified Organizations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {organizations.filter(org => org.verification_status === 'documents_under_review').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {dataRequests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Access Requests
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
            label="Organizations" 
            icon={<Business />} 
            iconPosition="start"
          />
          <Tab 
            label="Document Review" 
            icon={<Description />} 
            iconPosition="start"
          />
          <Tab 
            label="Data Access Requests" 
            icon={<Security />} 
            iconPosition="start"
          />
          <Tab 
            label="Settings" 
            icon={<Settings />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Organizations Tab */}
      {activeTab === 0 && (
        <Box>
          {loading ? (
            <LinearProgress />
          ) : (
            <Grid container spacing={3}>
              {organizations.map(org => (
                <Grid item xs={12} key={org.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getOrganizationIcon(org.organization_type)}
                          <Box>
                            <Typography variant="h6">{org.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {org.org_id} • {org.organization_type.replace('_', ' ')}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip 
                            label={org.verification_status.replace('_', ' ')} 
                            color={getVerificationColor(org.verification_status)}
                            variant="outlined" 
                          />
                          <Chip 
                            label={`Score: ${org.verification_score}/100`} 
                            color="info"
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {org.description}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Contact:</strong> {org.primary_contact_name} ({org.contact_email})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Website:</strong> {org.website}
                        </Typography>
                        {org.research_areas && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Research Areas:</strong>
                            </Typography>
                            {org.research_areas.map(area => (
                              <Chip 
                                key={area} 
                                label={area} 
                                size="small" 
                                sx={{ mr: 1, mb: 1 }} 
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {org.verification_status === 'documents_under_review' && (
                          <>
                            <Button 
                              variant="contained" 
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => approveOrganization(org.id)}
                            >
                              Approve Organization
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => rejectOrganization(org.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => setSelectedOrg(org)}
                        >
                          View Details
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

      {/* Document Review Tab */}
      {activeTab === 1 && (
        <Box>
          {documents.length === 0 ? (
            <Alert severity="info">No documents pending review</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Document Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map(doc => {
                    const org = organizations.find(o => o.id === doc.organization_id);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {org?.name || 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.document_type.replace('_', ' ')} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{doc.document_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={doc.status} 
                            color={doc.status === 'approved' ? 'success' : doc.status === 'under_review' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{doc.uploaded_by}</TableCell>
                        <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                            {doc.status === 'under_review' && (
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => approveDocument(doc.id)}
                              >
                                <CheckCircle />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Data Access Requests Tab */}
      {activeTab === 2 && (
        <Box>
          {dataRequests.length === 0 ? (
            <Alert severity="info">No data access requests</Alert>
          ) : (
            <Grid container spacing={3}>
              {dataRequests.map(request => {
                const org = organizations.find(o => o.id === request.organization_id);
                return (
                  <Grid item xs={12} key={request.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            {org?.name} → {request.hospital_id}
                          </Typography>
                          <Chip 
                            label={request.status} 
                            color={request.status === 'approved' ? 'success' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Use Case:</strong> {request.intended_use_case}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Requested Permissions:</strong>
                          </Typography>
                          {request.requested_permissions.map(permission => (
                            <Chip 
                              key={permission} 
                              label={permission.replace('_', ' ')} 
                              size="small" 
                              sx={{ mr: 1, mb: 1 }} 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 3 && (
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🏥 Platform Settings
                  </Typography>
                  <TextField 
                    fullWidth 
                    label="Minimum Verification Score" 
                    type="number"
                    defaultValue="75" 
                    margin="normal"
                    helperText="Organizations need this score for automatic approval"
                  />
                  <TextField 
                    fullWidth 
                    label="Premium Verification Score" 
                    type="number"
                    defaultValue="90" 
                    margin="normal"
                    helperText="Score required for premium verification level"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🔐 Security Settings
                  </Typography>
                  <TextField 
                    fullWidth 
                    label="Document Retention (months)" 
                    type="number"
                    defaultValue="60" 
                    margin="normal"
                  />
                  <TextField 
                    fullWidth 
                    label="Maximum File Size (MB)" 
                    type="number"
                    defaultValue="50" 
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default OrganizationDashboard;