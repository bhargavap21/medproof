import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  MenuItem,
  Menu
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  ArrowBack,
  Save
} from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HospitalProfile {
  id: string;
  hospital_id: string;
  name: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  hospital_type?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  research_areas?: string[];
  available_data_types?: string[];
  patient_population_size?: number;
  specialty_departments?: string[];
  public_visibility?: boolean;
  data_sharing_policy?: string;
}

const HospitalProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profile, setProfile] = useState<HospitalProfile>({
    id: '',
    hospital_id: '',
    name: '',
    location: '',
    city: '',
    state: '',
    country: 'United States',
    hospital_type: 'Academic Medical Center',
    contact_email: '',
    contact_phone: '',
    website: '',
    research_areas: [],
    available_data_types: [],
    patient_population_size: 0,
    specialty_departments: [],
    public_visibility: true,
    data_sharing_policy: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/hospital-admin/login');
        return;
      }

      // Get hospital for this admin via hospital_admins table
      const { data: adminData, error: adminError } = await supabase
        .from('hospital_admins')
        .select('hospital_id')
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      // Get hospital details
      const { data: hospitalData, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', adminData.hospital_id)
        .single();

      if (hospitalError) throw hospitalError;

      if (hospitalData) {
        setProfile({
          id: hospitalData.id,
          hospital_id: hospitalData.hospital_id,
          name: hospitalData.name || '',
          location: hospitalData.location || '',
          city: hospitalData.city || '',
          state: hospitalData.state || '',
          country: hospitalData.country || 'United States',
          hospital_type: hospitalData.institution_type || 'Academic Medical Center',
          contact_email: hospitalData.contact_email || '',
          contact_phone: hospitalData.contact_phone || '',
          website: hospitalData.website || '',
          research_areas: hospitalData.research_areas || [],
          available_data_types: hospitalData.available_data_types || [],
          patient_population_size: hospitalData.patient_population_size || 0,
          specialty_departments: hospitalData.specialty_departments || [],
          public_visibility: hospitalData.public_visibility ?? true,
          data_sharing_policy: hospitalData.data_sharing_policy || ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error: updateError } = await supabase
        .from('hospitals')
        .update({
          name: profile.name,
          location: profile.location,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          institution_type: profile.hospital_type,
          contact_email: profile.contact_email,
          contact_phone: profile.contact_phone,
          website: profile.website,
          research_areas: profile.research_areas,
          available_data_types: profile.available_data_types,
          patient_population_size: profile.patient_population_size,
          specialty_departments: profile.specialty_departments,
          public_visibility: profile.public_visibility,
          data_sharing_policy: profile.data_sharing_policy,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hospital_admin');
    supabase.auth.signOut();
    navigate('/hospital-admin/login');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate('/hospital-admin/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hospital Profile
          </Typography>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Hospital Information
          </Typography>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hospital Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Hospital Type"
                value={profile.hospital_type}
                onChange={(e) => setProfile({ ...profile, hospital_type: e.target.value })}
              >
                <MenuItem value="Academic Medical Center">Academic Medical Center</MenuItem>
                <MenuItem value="Community Hospital">Community Hospital</MenuItem>
                <MenuItem value="Specialty Hospital">Specialty Hospital</MenuItem>
                <MenuItem value="Research Institute">Research Institute</MenuItem>
                <MenuItem value="Children's Hospital">Children's Hospital</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Population Size"
                type="number"
                value={profile.patient_population_size}
                onChange={(e) => setProfile({ ...profile, patient_population_size: parseInt(e.target.value) || 0 })}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1, mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={profile.contact_email}
                onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={profile.contact_phone}
                onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://example.com"
              />
            </Grid>

            {/* Data Sharing Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1, mt: 2 }}>
                Data Sharing Settings
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.public_visibility}
                    onChange={(e) => setProfile({ ...profile, public_visibility: e.target.checked })}
                  />
                }
                label="List in Public Hospital Directory"
              />
              <Typography variant="caption" display="block" color="textSecondary">
                Enable this to allow researchers to discover and contact your institution
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Data Sharing Policy"
                value={profile.data_sharing_policy}
                onChange={(e) => setProfile({ ...profile, data_sharing_policy: e.target.value })}
                placeholder="Describe your institution's data sharing policies, requirements, and guidelines..."
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/hospital-admin/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default HospitalProfilePage;
