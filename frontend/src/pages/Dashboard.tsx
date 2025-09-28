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
      const response = await fetch('/api/study-requests');
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

  // const handleRequestHospitalData = () => {
  //   navigate('/hospital-data-request');
  // };

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
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if ((loading && hospitals.length === 0) || (orgLoading && user)) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
          <LinearProgress />
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

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          MedProof Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Privacy-preserving medical research collaboration platform
        </Typography>
        
        {/* Midnight Network Showcase */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          p: 3, 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
          color: 'white', 
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.1)',
          mb: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <Box sx={{ fontSize: 40 }}>🌙</Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Built on Midnight Network
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Enabling secure, privacy-preserving medical research through zero-knowledge proofs and programmable privacy
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              ZK-SNARKS
            </Typography>
            <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
              VERIFIED
            </Typography>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  My Organizations
                </Typography>
                <Typography variant="h4" component="div">
                  {organizations.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <VerifiedUser sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Verified Orgs
                </Typography>
                <Typography variant="h4" component="div">
                  {organizations.filter(org => org.research_organizations?.verification_status === 'verified').length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Science sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Active Studies
                </Typography>
                <Typography variant="h4" component="div">
                  {studies.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalHospital sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Partner Hospitals
                </Typography>
                <Typography variant="h4" component="div">
                  {hospitals.length}
                </Typography>
              </Box>
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
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Amazon for Medical Research
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                  Create study requests and get competitive bids from hospitals with ZK proof verification
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
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
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Create Study Request
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleViewStudyMarketplace}
                    startIcon={<Search />}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Browse Marketplace
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

      {/* Other Quick Actions */}
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
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {organizations.map((orgMembership) => {
              const org = orgMembership.research_organizations;
              if (!org) return null;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={org.id}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getOrganizationIcon(org.organization_type)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" noWrap>
                            {org.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {org.organization_type.replace('_', ' ').toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={org.verification_status}
                          size="small"
                          color={getVerificationColor(org.verification_status) as any}
                          variant={org.verification_status === 'verified' ? 'filled' : 'outlined'}
                        />
                        <Chip
                          label={orgMembership.role}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {org.description || 'No description available'}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Org ID:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {org.org_id}
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => handleViewOrganization(org.id)}
                        variant="contained"
                        fullWidth
                      >
                        Manage Organization
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card sx={{ textAlign: 'center', py: 6, mb: 4 }}>
            <CardContent>
              <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Organizations Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Register your research organization to start collaborating with hospitals and accessing medical research data.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleRegisterOrganization}
              >
                Register Your Organization
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
    </Container>
  );
};

export default Dashboard;