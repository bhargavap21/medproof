import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Container,
  Avatar,
  IconButton,
  Tooltip,
  Fab,
  Divider,
} from '@mui/material';
import {
  LocalHospital,
  Science,
  VerifiedUser,
  TrendingUp,
  Groups,
  Assessment,
  Business,
  PersonAdd,
  Add,
  School,
  Biotech,
  AccountBalance,
  VolunteerActivism,
  Assignment,
  Gavel,
  Search,
  Settings,
  Launch,
  People,
  Description,
} from '@mui/icons-material';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hospitals, studies, loading, error, loadHospitals, loadDemoStudies } = useAPI();
  const { user, profile, getUserOrganizations } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [studyRequests, setStudyRequests] = useState<any[]>([]);
  const [studyRequestsLoading, setStudyRequestsLoading] = useState(true);

  const loadStudyRequests = async () => {
    try {
      setStudyRequestsLoading(true);
      const response = await fetch('http://localhost:3001/api/study-requests');
      if (response.ok) {
        const data = await response.json();
        setStudyRequests(data.studyRequests || []);
      } else {
        console.error('Failed to fetch study requests:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading study requests:', error);
    } finally {
      setStudyRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
    loadDemoStudies();
    loadStudyRequests();
  }, [loadHospitals, loadDemoStudies]);

  useEffect(() => {
    // Check for success message from navigation state or sessionStorage
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      // Refresh study requests count when a new study request is created
      loadStudyRequests();
      // Clear the navigation state to prevent showing the message again
      window.history.replaceState({}, document.title);
      // Auto-hide the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      // Check sessionStorage for success message
      const storedMessage = sessionStorage.getItem('successMessage');
      if (storedMessage) {
        setSuccessMessage(storedMessage);
        // Refresh study requests count when a new study request is created
        loadStudyRequests();
        // Clear the stored message
        sessionStorage.removeItem('successMessage');
        // Auto-hide the message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const loadUserOrganizations = async () => {
      if (user) {
        try {
          const userOrgs = await getUserOrganizations();
          setOrganizations(userOrgs);
        } catch (error) {
          console.error('Error loading organizations:', error);
        } finally {
          setOrgLoading(false);
        }
      } else {
        setOrgLoading(false);
      }
    };

    loadUserOrganizations();
  }, [user, getUserOrganizations]);

  const handleViewHospital = (hospitalId: string) => {
    navigate(`/hospital/${hospitalId}`);
  };

  const handleViewResearch = () => {
    navigate('/research');
  };

  const handleRegisterOrganization = () => {
    navigate('/organization/register');
  };

  const handleViewOrganization = (orgId: string) => {
    navigate(`/organization/${orgId}`);
  };

  const handleGenerateZKProof = () => {
    navigate('/zk-proof-generator');
  };

  const handleCreateStudyRequest = () => {
    navigate('/study-request/create');
  };

  const handleViewStudyRequests = () => {
    navigate('/study-requests');
  };

  const handleViewStudyMarketplace = () => {
    navigate('/study-marketplace');
  };

  const getOrganizationIcon = (type: string) => {
    switch (type) {
      case 'university':
        return <School />;
      case 'research_institute':
        return <Science />;
      case 'biotech_company':
        return <Biotech />;
      case 'pharmaceutical':
        return <LocalHospital />;
      case 'government_agency':
        return <AccountBalance />;
      case 'ngo':
        return <VolunteerActivism />;
      default:
        return <Business />;
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'rejected':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getOrganizationTypeLabel = (type: string | undefined | null) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if ((loading && hospitals.length === 0) || (orgLoading && user)) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
          <Business sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Loading MedProof Dashboard
          </Typography>
          <LinearProgress sx={{ width: 300, borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          MedProof Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Privacy-preserving medical research collaboration platform
        </Typography>


        {/* Welcome User Section */}
        {user && (
          <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4, background: 'linear-gradient(135deg, #1c2128 0%, #252d38 100%)', color: '#f0f6fc', border: '1px solid #30363d' }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'rgba(255,255,255,0.2)' }}>
                  {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Welcome, {profile?.first_name || user?.email?.split('@')[0]}!
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {profile?.role?.replace('_', ' ') || 'Researcher'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {organizations.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                My Organizations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <VerifiedUser sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {organizations.filter(org => org.research_organizations?.verification_status === 'verified').length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Verified Orgs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <Science sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {studies.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active Studies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <LocalHospital sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {hospitals.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Partner Hospitals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Platform Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <Assignment sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {studyRequests.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Study Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <VerifiedUser sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {studies.reduce((total, study) => total + study.study.sites.length, 0)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ZK Proofs Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <Groups sx={{ fontSize: 48, color: 'purple', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {hospitals.reduce((sum, h) => sum + (h.totalPatients || 0), 0).toLocaleString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ fontSize: 48, mb: 2 }}>🌙</Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
                100%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Privacy Preserved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Study Request Marketplace - Highlighted Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Study Request Marketplace
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Study Request Platform
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  Create study requests and get competitive bids from hospitals with ZK proof verification
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  • Automated hospital matching with capacity proofs<br/>
                  • Transparent competitive bidding<br/>
                  • Privacy-preserving patient count verification<br/>
                  • Weeks instead of months to launch studies
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleCreateStudyRequest}
                    startIcon={<Add />}
                  >
                    Create Study Request
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Gavel sx={{ mr: 1, color: 'warning.main' }} />
                  My Study Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage your active study requests, review hospital bids, and track progress.
                </Typography>
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 600 }}>
                    {studyRequestsLoading ? '...' : studyRequests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Requests
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleViewStudyRequests}
                  startIcon={<Assignment />}
                >
                  Manage Requests
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Research Tools */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Research Tools
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 1 }} />
                Research Aggregator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Analyze and aggregate research findings across multiple hospitals while preserving patient privacy.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={handleViewResearch}
                startIcon={<TrendingUp />}
              >
                View Research
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospital sx={{ mr: 1 }} />
                Hospital Data Network
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect with {hospitals.length} verified hospitals in our privacy-preserving research network powered by Midnight.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={() => navigate('/research')}
                startIcon={<Assessment />}
                color="secondary"
              >
                Explore Network
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedUser sx={{ mr: 1 }} />
                Zero-Knowledge Proofs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate and verify cryptographic proofs that validate research findings without exposing sensitive data.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={handleGenerateZKProof}
                startIcon={<VerifiedUser />}
                color="primary"
              >
                Generate Proofs
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Organizations Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            My Organizations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleRegisterOrganization}
            sx={{ minWidth: 'auto' }}
          >
            Register Organization
          </Button>
        </Box>

        {orgLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        ) : organizations.length > 0 ? (
          <Grid container spacing={4}>
            {organizations.map((orgMembership) => {
              const org = orgMembership.research_organizations;
              if (!org) return null;

              return (
                <Grid item xs={12} md={6} lg={4} key={org.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                    onClick={() => handleViewOrganization(org.id)}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            bgcolor: 'primary.main',
                            boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
                          }}
                        >
                          {getOrganizationIcon(org.organization_type)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {org.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {getOrganizationTypeLabel(org.organization_type)}
                          </Typography>
                        </Box>
                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                          <Launch fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Status Badges */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        <Chip
                          label={(org.verification_status || 'unverified').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getVerificationColor(org.verification_status) + '20',
                            color: getVerificationColor(org.verification_status),
                            border: `1px solid ${getVerificationColor(org.verification_status)}40`,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                        <Chip
                          label={(orgMembership.role || 'member').toUpperCase()}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {org.description || 'Research organization focused on advancing medical knowledge through collaborative studies.'}
                      </Typography>

                      {/* Organization Details */}
                      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Organization ID
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {org.org_id}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <Box sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Settings />}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: 2
                        }}
                      >
                        Manage Organization
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card sx={{ textAlign: 'center', py: 8, background: 'linear-gradient(135deg, #1c2128 0%, #252d38 100%)', border: '1px solid #30363d' }}>
            <CardContent>
              <Business sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                No Organizations Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                Get started by registering your research organization to collaborate with hospitals
                and access medical research data through our privacy-preserving platform.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleRegisterOrganization}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                  }
                }}
              >
                Register Your First Organization
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Hospitals Grid */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Partner Hospitals
      </Typography>

      <Grid container spacing={3}>
        {hospitals.map((hospital) => (
          <Grid item xs={12} sm={6} md={4} key={hospital.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {hospital.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {hospital.location}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={hospital.type}
                    size="small"
                    color={hospital.type === 'academic' ? 'primary' : 'default'}
                  />
                  <Chip
                    label={hospital.size}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Active Studies:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {hospital.activeStudies || 0}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Patients:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {hospital.totalPatients?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleViewHospital(hospital.id)}
                  variant="contained"
                  fullWidth
                >
                  View Dashboard
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {hospitals.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <LocalHospital sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hospitals available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please check your connection and try again.
          </Typography>
        </Box>
      )}

      {/* Quick Actions FAB */}
      {organizations.length > 0 && (
        <Tooltip title="Quick Register" placement="left">
          <Fab
            color="primary"
            onClick={handleRegisterOrganization}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: '0 8px 16px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 20px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            <Add />
          </Fab>
        </Tooltip>
      )}
    </Container>
  );
};

export default Dashboard;