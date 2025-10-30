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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  LocalHospital,
  LocationOn,
  People,
  Assessment,
  TrendingUp,
  Send,
  FilterList,
} from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Hospital {
  id: string;
  hospital_id: string;
  name: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  institution_type?: string;
  patient_population_size?: number;
  research_areas?: string[];
  available_data_types?: string[];
  specialty_departments?: string[];
  contact_email?: string;
  website?: string;
}

const HospitalNetwork: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterState, setFilterState] = useState('all');

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('public_visibility', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setHospitals(data || []);
      setFilteredHospitals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  // Filter hospitals when search or filters change
  useEffect(() => {
    let filtered = [...hospitals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(h => h.institution_type === filterType);
    }

    // State filter
    if (filterState !== 'all') {
      filtered = filtered.filter(h => h.state === filterState);
    }

    setFilteredHospitals(filtered);
  }, [searchTerm, filterType, filterState, hospitals]);

  const handleRequestAccess = (hospitalId: string) => {
    navigate('/hospital-data-request', { state: { hospitalId } });
  };

  // Get unique states for filter
  const uniqueStates = Array.from(new Set(hospitals.map(h => h.state).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(hospitals.map(h => h.institution_type).filter(Boolean)));

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

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search hospitals"
                placeholder="Search by name, city, or state"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Hospital Type</InputLabel>
                <Select
                  value={filterType}
                  label="Hospital Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>State</InputLabel>
                <Select
                  value={filterState}
                  label="State"
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <MenuItem value="all">All States</MenuItem>
                  {uniqueStates.map(state => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <LocalHospital sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {filteredHospitals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || filterType !== 'all' || filterState !== 'all' ? 'Filtered' : 'Total'} Hospitals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {filteredHospitals.reduce((sum, h) => sum + (h.patient_population_size || 0), 0).toLocaleString()}
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
                  {Math.round(filteredHospitals.filter(h => h.institution_type === 'Academic Medical Center').length / (filteredHospitals.length || 1) * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Academic Centers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {uniqueStates.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  States Represented
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Hospital Grid */}
      <Grid container spacing={3}>
        {filteredHospitals.map((hospital) => (
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
                        {hospital.city && hospital.state ? `${hospital.city}, ${hospital.state}` : hospital.location || 'Location not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Badges */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={hospital.institution_type || 'Hospital'}
                    size="small"
                    color={hospital.institution_type === 'Academic Medical Center' ? 'primary' : 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                  {hospital.specialty_departments && hospital.specialty_departments.length > 0 && (
                    <Chip
                      label={`${hospital.specialty_departments.length} Specialties`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  )}
                </Box>

                {/* Stats */}
                <Box sx={{ space: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Patient Population:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {hospital.patient_population_size?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                  {hospital.research_areas && hospital.research_areas.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Research Areas:</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {hospital.research_areas.slice(0, 3).map((area, idx) => (
                          <Chip key={idx} label={area} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                        {hospital.research_areas.length > 3 && (
                          <Chip label={`+${hospital.research_areas.length - 3} more`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Actions */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Send />}
                  onClick={() => handleRequestAccess(hospital.id)}
                  sx={{ mt: 'auto', fontWeight: 600 }}
                >
                  Request Data Access
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredHospitals.length === 0 && !loading && (
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