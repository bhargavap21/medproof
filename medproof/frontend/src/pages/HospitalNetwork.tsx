import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  LocalHospital,
  LocationOn,
  People,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { useAPI } from '../hooks/useAPI';

const HospitalNetwork: React.FC = () => {
  const { hospitals, loading, error, loadHospitals } = useAPI();

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  if (loading && hospitals.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 8 }}>
        <LocalHospital sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Loading Hospital Network</Typography>
        <LinearProgress sx={{ width: 300, borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalHospital sx={{ color: 'primary.main' }} />
          Hospital Network
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Partner hospitals in our privacy-preserving medical research network
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {hospitals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hospitals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {hospitals.reduce((sum, h) => sum + (h.activeStudies || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Studies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {hospitals.reduce((sum, h) => sum + (h.totalPatients || 0), 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {Math.round(hospitals.filter(h => h.type === 'academic').length / hospitals.length * 100) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Academic Centers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Hospital Grid */}
      <Grid container spacing={3}>
        {hospitals.map((hospital) => (
          <Grid item xs={12} sm={6} md={4} key={hospital.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <LocalHospital />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {hospital.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {hospital.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Badges */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={hospital.type}
                    size="small"
                    color={hospital.type === 'academic' ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                  <Chip
                    label={hospital.size}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                </Box>

                {/* Stats */}
                <Box sx={{ space: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Active Studies:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {hospital.activeStudies || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Total Patients:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {hospital.totalPatients?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Assessment />}
                  sx={{ mt: 'auto', fontWeight: 600 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {hospitals.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LocalHospital sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            No Hospitals Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The hospital network is currently being set up. Please check back later.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HospitalNetwork;