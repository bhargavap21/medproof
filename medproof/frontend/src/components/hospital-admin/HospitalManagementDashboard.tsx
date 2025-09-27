import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp,
  CheckCircle,
  Cancel,
  Visibility,
  Policy
} from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DataAccessRequest {
  id: string;
  organization_name: string;
  request_type: string;
  intended_use_case: string;
  status: string;
  requested_permissions: string[];
  created_at: string;
  research_title?: string;
  organization_id: string;
}

interface HospitalStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activePartnerships: number;
}

interface HospitalAdmin {
  id: string;
  role: string;
  hospital_id: string;
  hospitals?: {
    id: string;
    name: string;
    is_active: boolean;
  };
}

export default function HospitalManagementDashboard() {
  const [hospitalAdmin, setHospitalAdmin] = useState<HospitalAdmin | null>(null);
  const [stats, setStats] = useState<HospitalStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    activePartnerships: 0
  });
  const [requests, setRequests] = useState<DataAccessRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DataAccessRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = sessionStorage.getItem('hospital_admin');
    if (!adminData) {
      navigate('/hospital-admin/login');
      return;
    }

    const admin = JSON.parse(adminData);
    setHospitalAdmin(admin);
    loadDashboardData(admin.hospital_id);
  }, [navigate]);

  const loadDashboardData = async (hospitalId: string) => {
    try {
      setLoading(true);
      
      // Load data access requests for this hospital
      const { data: requestsData, error: requestsError } = await supabase
        .from('data_access_requests')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Transform the data
      const transformedRequests = requestsData?.map(req => ({
        ...req,
        organization_name: req.organizations?.name || 'Unknown Organization'
      })) || [];

      setRequests(transformedRequests);

      // Calculate stats
      const totalRequests = transformedRequests.length;
      const pendingRequests = transformedRequests.filter(r => r.status === 'pending').length;
      const approvedRequests = transformedRequests.filter(r => r.status === 'approved').length;
      const rejectedRequests = transformedRequests.filter(r => r.status === 'rejected').length;

      // Get active partnerships (approved agreements)
      const { data: agreementsData, error: agreementsError } = await supabase
        .from('data_sharing_agreements')
        .select('id')
        .eq('hospital_id', hospitalId)
        .eq('status', 'approved');

      if (agreementsError) throw agreementsError;

      setStats({
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        activePartnerships: agreementsData?.length || 0
      });

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('data_access_requests')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, create data sharing agreement
      if (action === 'approve' && selectedRequest) {
        const agreementData = {
          hospital_id: hospitalAdmin?.hospital_id,
          organization_id: selectedRequest.organization_id,
          agreement_type: 'data_access',
          data_scope: selectedRequest.requested_permissions,
          permissions: selectedRequest.requested_permissions,
          status: 'approved',
          effective_date: new Date().toISOString(),
          expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          data_retention_months: 12
        };

        const { error: agreementError } = await supabase
          .from('data_sharing_agreements')
          .insert(agreementData);

        if (agreementError) throw agreementError;
      }

      // Reload data
      if (hospitalAdmin?.hospital_id) {
        loadDashboardData(hospitalAdmin.hospital_id);
      }
      
      setSelectedRequest(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MedProof Hospital Dashboard - {hospitalAdmin?.hospitals?.name}
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/hospital-admin/settings')}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
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

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Requests"
              value={stats.totalRequests}
              icon={<AssessmentIcon fontSize="large" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon={<SecurityIcon fontSize="large" />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Approved Requests"
              value={stats.approvedRequests}
              icon={<CheckCircle fontSize="large" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Partnerships"
              value={stats.activePartnerships}
              icon={<PeopleIcon fontSize="large" />}
              color="secondary"
            />
          </Grid>
        </Grid>

        {/* Recent Data Access Requests */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" component="div">
              Data Access Requests
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell>Request Type</TableCell>
                  <TableCell>Research Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">
                        No data access requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.organization_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.request_type} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {request.research_title || request.intended_use_case}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status}
                          color={getStatusColor(request.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Policy />}
                  onClick={() => navigate('/hospital-admin/data-policies')}
                >
                  Manage Data Policies
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/hospital-admin/partnerships')}
                >
                  View Partnerships
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/hospital-admin/settings')}
                >
                  Hospital Settings
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Data Systems" color="success" size="small" />
                  <Typography variant="body2">Connected</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Compliance" color="success" size="small" />
                  <Typography variant="body2">Up to Date</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label="Security" color="success" size="small" />
                  <Typography variant="body2">All Checks Passed</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Request Details Dialog */}
      <Dialog
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Data Access Request Details
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Organization
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.organization_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Request Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.request_type}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Research Title
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.research_title || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Intended Use Case
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.intended_use_case}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Requested Permissions
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedRequest.requested_permissions.map((permission, index) => (
                      <Chip key={index} label={permission} size="small" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip 
                    label={selectedRequest.status}
                    color={getStatusColor(selectedRequest.status) as any}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Request Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>
            Close
          </Button>
          {selectedRequest?.status === 'pending' && (
            <>
              <Button
                onClick={() => handleRequestAction(selectedRequest.id, 'reject')}
                color="error"
                variant="outlined"
              >
                Reject
              </Button>
              <Button
                onClick={() => handleRequestAction(selectedRequest.id, 'approve')}
                color="success"
                variant="contained"
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}