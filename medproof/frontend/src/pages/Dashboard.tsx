import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAPI } from '../hooks/useAPI';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hospitals, studies, loading, error, loadHospitals, loadDemoStudies } = useAPI();
  const { user, profile, getUserOrganizations } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    loadHospitals();
    loadDemoStudies();
  }, [loadHospitals, loadDemoStudies]);

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

  const handleRequestHospitalData = () => {
    navigate('/hospital-data-request');
  };

  const handleGenerateZKProof = () => {
    navigate('/zk-proof-generator');
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          MedProof Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Privacy-preserving medical research collaboration platform
        </Typography>
        
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

      {/* Quick Actions */}
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
                Hospital Data Access
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Request access to hospital data for zero-knowledge proof generation and research purposes.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                onClick={handleRequestHospitalData}
                startIcon={<Add />}
                color="secondary"
              >
                Request Access
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