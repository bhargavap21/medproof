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
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  ArrowBack,
  Science,
  LocationOn,
  People,
  AccessTime,
  AttachMoney,
  Send,
  FilterList,
} from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface StudyRequest {
  id: string;
  study_title: string;
  principal_investigator: string;
  organization_id: string;
  organization_name?: string;
  study_type: string;
  required_patient_count: number;
  inclusion_criteria: string;
  exclusion_criteria: string;
  timeline_months: number;
  compensation_available: boolean;
  funding_amount?: number;
  irb_approved: boolean;
  privacy_level: string;
  created_at: string;
  status: string;
}

const StudyMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const [studies, setStudies] = useState<StudyRequest[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<StudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedStudy, setSelectedStudy] = useState<StudyRequest | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hospitalAdmin, setHospitalAdmin] = useState<any>(null);

  useEffect(() => {
    loadHospitalAdmin();
    loadStudies();
  }, []);

  const loadHospitalAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/hospital-admin/login');
      return;
    }

    // Get hospital admin record to find associated hospital
    const { data: adminData } = await supabase
      .from('hospital_admins')
      .select('hospital_id')
      .eq('user_id', user.id)
      .single();

    if (adminData?.hospital_id) {
      // Get hospital details
      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('id, name')
        .eq('id', adminData.hospital_id)
        .single();

      if (hospitalData) {
        setHospitalAdmin({
          ...user,
          hospital_id: hospitalData.id,
          hospital_name: hospitalData.name,
        });
      }
    }
  };

  const loadStudies = async () => {
    try {
      setLoading(true);
      // Load study requests from researchers
      const { data, error: fetchError } = await supabase
        .from('study_requests')
        .select(`
          *,
          research_organizations (
            name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const studiesWithOrgNames = data?.map(study => ({
        ...study,
        organization_name: study.research_organizations?.name || 'Unknown Organization'
      })) || [];

      setStudies(studiesWithOrgNames);
      setFilteredStudies(studiesWithOrgNames);
    } catch (err: any) {
      setError(err.message || 'Failed to load studies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...studies];

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.study_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.principal_investigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.study_type === filterType);
    }

    setFilteredStudies(filtered);
  }, [searchTerm, filterType, studies]);

  const handleExpressInterest = async () => {
    if (!selectedStudy || !hospitalAdmin) return;

    try {
      setError(null);

      // Create study participation interest record
      const { error: interestError } = await supabase
        .from('hospital_study_interest')
        .insert({
          hospital_id: hospitalAdmin.hospital_id,
          study_request_id: selectedStudy.id,
          organization_id: selectedStudy.organization_id,
          estimated_patient_match: 50, // Can be made dynamic
          status: 'interested',
          message: `${hospitalAdmin.hospital_name} is interested in participating in this study.`
        });

      if (interestError) throw interestError;

      setSuccess(`Interest expressed in "${selectedStudy.study_title}"!`);
      setSelectedStudy(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to express interest');
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

  const uniqueTypes = Array.from(new Set(studies.map(s => s.study_type).filter(Boolean)));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 8 }}>
        <Science sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Loading Study Marketplace</Typography>
        <LinearProgress sx={{ width: 300, borderRadius: 2 }} />
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
            Study Request Marketplace - {hospitalAdmin?.hospital_name}
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

      <Box sx={{ p: 3 }}>
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

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Science sx={{ color: 'primary.main' }} />
            Available Research Studies
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Browse research opportunities and express interest in participating
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search studies"
                placeholder="Search by title, PI, or organization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Study Type</InputLabel>
                <Select
                  value={filterType}
                  label="Study Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {uniqueTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Science sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {filteredStudies.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Studies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {filteredStudies.reduce((sum, s) => sum + s.required_patient_count, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients Needed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {filteredStudies.filter(s => s.compensation_available).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Funding
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Studies Grid */}
        <Grid container spacing={3}>
          {filteredStudies.map((study) => (
            <Grid item xs={12} md={6} key={study.id}>
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {study.study_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    PI: {study.principal_investigator} • {study.organization_name}
                  </Typography>

                  {/* Badges */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={study.study_type}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    {study.irb_approved && (
                      <Chip label="IRB Approved" size="small" color="success" sx={{ fontWeight: 600 }} />
                    )}
                    {study.compensation_available && (
                      <Chip label="Funding Available" size="small" color="warning" sx={{ fontWeight: 600 }} />
                    )}
                  </Box>

                  {/* Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {study.required_patient_count.toLocaleString()} patients needed
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {study.timeline_months} months duration
                      </Typography>
                    </Box>
                    {study.funding_amount && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          ${study.funding_amount.toLocaleString()} funding
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Action */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Send />}
                    onClick={() => setSelectedStudy(study)}
                    sx={{ mt: 'auto', fontWeight: 600 }}
                  >
                    Express Interest
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredStudies.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Science sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
              No Studies Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back later for new research opportunities'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Express Interest Dialog */}
      <Dialog
        open={Boolean(selectedStudy)}
        onClose={() => setSelectedStudy(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Express Interest in Study</DialogTitle>
        <DialogContent>
          {selectedStudy && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" gutterBottom>
                {selectedStudy.study_title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedStudy.organization_name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Inclusion Criteria:
                </Typography>
                <Typography variant="body2">
                  {selectedStudy.inclusion_criteria}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Exclusion Criteria:
                </Typography>
                <Typography variant="body2">
                  {selectedStudy.exclusion_criteria}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                By expressing interest, you're indicating that your hospital may have eligible patients
                and would like to discuss participation further.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStudy(null)}>Cancel</Button>
          <Button onClick={handleExpressInterest} variant="contained" color="primary">
            Confirm Interest
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyMarketplace;
