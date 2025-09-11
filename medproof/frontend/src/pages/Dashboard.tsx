import React, { useEffect } from 'react';
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
} from '@mui/material';
import {
  LocalHospital,
  Science,
  VerifiedUser,
  TrendingUp,
  Groups,
  Assessment,
} from '@mui/icons-material';
import { useAPI } from '../hooks/useAPI';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hospitals, studies, loading, error, loadHospitals, loadDemoStudies } = useAPI();

  useEffect(() => {
    loadHospitals();
    loadDemoStudies();
  }, [loadHospitals, loadDemoStudies]);

  const handleViewHospital = (hospitalId: string) => {
    navigate(`/hospital/${hospitalId}`);
  };

  const handleViewResearch = () => {
    navigate('/research');
  };

  if (loading && hospitals.length === 0) {
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
              <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Active Hospitals
                </Typography>
                <Typography variant="h4" component="div">
                  {hospitals.length}
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
              <VerifiedUser sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Verified Proofs
                </Typography>
                <Typography variant="h4" component="div">
                  {studies.reduce((total, study) => 
                    total + study.study.sites.filter(site => site.zkProof).length, 0
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Groups sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Patients
                </Typography>
                <Typography variant="h4" component="div">
                  {studies.reduce((total, study) => 
                    total + study.study.aggregateStats.totalTreatmentN + study.study.aggregateStats.totalControlN, 0
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
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

        <Grid item xs={12} md={6}>
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
                variant="outlined"
                disabled
                sx={{ opacity: 0.7 }}
              >
                Coming Soon
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Hospitals Grid */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Participating Hospitals
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