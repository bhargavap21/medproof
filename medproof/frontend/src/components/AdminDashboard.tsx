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
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  PersonAdd,
  PersonOff,
  AdminPanelSettings,
  Security,
  Settings,
} from '@mui/icons-material';

interface Application {
  id: number;
  name: string;
  email: string;
  department: string;
  walletAddress: string;
  credentials: Record<string, string>;
  requestedPermissions: string[];
  applicationDate: string;
  status: string;
}

interface Researcher {
  id: number;
  name: string;
  email: string;
  department: string;
  walletAddress: string;
  permissions: string[];
  authorizedDate: string;
  lastActivity: string;
  studiesSubmitted: number;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([
    {
      id: 1,
      name: "Dr. Sarah Chen",
      email: "s.chen@mayo.edu",
      department: "Cardiology Research",
      walletAddress: "mn_shield-addr_test1hnza2qvpaeqt8zyvwr03rfgtfq7y07vq...",
      credentials: {
        "Medical License": "Verified ✅",
        "Institution Email": "Verified ✅",
        "Ethics Training": "Verified ✅",
        "Supervisor Approval": "Pending ⏳"
      },
      requestedPermissions: ["submit_studies", "view_aggregated_data"],
      applicationDate: "2024-01-15",
      status: "pending"
    },
    {
      id: 2,
      name: "Dr. Michael Rodriguez",
      email: "m.rodriguez@mayo.edu", 
      department: "Oncology Research",
      walletAddress: "mn_shield-addr_test1hxzy3mvpaeqt8zyvwr03rfgtfq7y07vq...",
      credentials: {
        "Medical License": "Verified ✅",
        "Institution Email": "Verified ✅", 
        "Ethics Training": "Verified ✅",
        "Supervisor Approval": "Verified ✅"
      },
      requestedPermissions: ["submit_studies", "authorize_others"],
      applicationDate: "2024-01-12",
      status: "pending"
    }
  ]);

  const [authorizedResearchers, setAuthorizedResearchers] = useState<Researcher[]>([
    {
      id: 3,
      name: "Dr. Emily Watson",
      email: "e.watson@mayo.edu",
      department: "Neurology Research", 
      walletAddress: "mn_shield-addr_test1hpxa2qvpaeqt8zyvwr03rfgtfq7y07vq...",
      permissions: ["submit_studies", "view_aggregated_data"],
      authorizedDate: "2024-01-01",
      lastActivity: "2024-01-14",
      studiesSubmitted: 3,
      status: "active"
    }
  ]);

  const approveApplication = (applicationId: number) => {
    const application = pendingApplications.find(app => app.id === applicationId);
    if (application) {
      // Move to authorized researchers
      setAuthorizedResearchers(prev => [...prev, {
        ...application,
        id: Date.now(), // Generate new ID
        authorizedDate: new Date().toISOString().split('T')[0],
        lastActivity: "Never",
        studiesSubmitted: 0,
        permissions: application.requestedPermissions,
        status: "active"
      }]);
      
      // Remove from pending
      setPendingApplications(prev => prev.filter(app => app.id !== applicationId));
    }
  };

  const rejectApplication = (applicationId: number) => {
    setPendingApplications(prev => prev.filter(app => app.id !== applicationId));
  };

  const revokeAccess = (researcherId: number) => {
    setAuthorizedResearchers(prev => prev.filter(r => r.id !== researcherId));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AdminPanelSettings fontSize="large" />
          Mayo Clinic - Research Admin Dashboard
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {pendingApplications.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {authorizedResearchers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Researchers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {authorizedResearchers.reduce((sum, r) => sum + r.studiesSubmitted, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Studies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Chip 
                  icon={<Security />} 
                  label="Connected" 
                  color="success" 
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Midnight Network
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
            label={`Pending Applications (${pendingApplications.length})`} 
            icon={<PersonAdd />} 
            iconPosition="start"
          />
          <Tab 
            label={`Authorized Researchers (${authorizedResearchers.length})`} 
            icon={<CheckCircle />} 
            iconPosition="start"
          />
          <Tab 
            label="Hospital Settings" 
            icon={<Settings />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Pending Applications Tab */}
      {activeTab === 0 && (
        <Box>
          {pendingApplications.length === 0 ? (
            <Alert severity="info">No pending applications</Alert>
          ) : (
            <Grid container spacing={3}>
              {pendingApplications.map(application => (
                <Grid item xs={12} key={application.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{application.name}</Typography>
                        <Chip label={application.department} color="primary" variant="outlined" />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Email:</strong> {application.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Wallet:</strong> <code>{application.walletAddress.slice(0, 20)}...</code>
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        🔍 Credential Verification
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {Object.entries(application.credentials).map(([key, value]) => (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Typography variant="body2">{key}:</Typography>
                            <Typography variant="body2">{value}</Typography>
                          </Box>
                        ))}
                      </Box>
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        🔐 Requested Permissions
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {application.requestedPermissions.map(permission => (
                          <Chip 
                            key={permission} 
                            label={permission.replace(/_/g, ' ')} 
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button 
                          variant="contained" 
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => approveApplication(application.id)}
                        >
                          Approve Application
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => rejectApplication(application.id)}
                        >
                          Reject Application
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

      {/* Authorized Researchers Tab */}
      {activeTab === 1 && (
        <Box>
          {authorizedResearchers.length === 0 ? (
            <Alert severity="info">No authorized researchers</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Authorized</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Studies</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {authorizedResearchers.map(researcher => (
                    <TableRow key={researcher.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {researcher.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {researcher.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{researcher.department}</TableCell>
                      <TableCell>{researcher.authorizedDate}</TableCell>
                      <TableCell>{researcher.lastActivity}</TableCell>
                      <TableCell>
                        <Chip 
                          label={researcher.studiesSubmitted} 
                          color="primary" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          variant="outlined"
                          color="warning"
                          size="small"
                          startIcon={<PersonOff />}
                          onClick={() => revokeAccess(researcher.id)}
                        >
                          Revoke Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Settings Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🏥 Institution Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <TextField 
                      fullWidth 
                      label="Hospital ID" 
                      value="MAYO_CLINIC_001" 
                      disabled 
                      margin="normal"
                    />
                    <TextField 
                      fullWidth 
                      select 
                      label="Institution Type" 
                      defaultValue="academic_medical_center"
                      margin="normal"
                      SelectProps={{ native: true }}
                    >
                      <option value="academic_medical_center">Academic Medical Center</option>
                      <option value="community_hospital">Community Hospital</option>
                      <option value="research_institute">Research Institute</option>
                    </TextField>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🔐 Authorization Settings
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Require supervisor approval for all applications"
                    />
                    <br />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Automatic approval for verified institutional emails"
                    />
                    <TextField 
                      fullWidth 
                      type="number" 
                      label="Maximum studies per researcher" 
                      defaultValue="10" 
                      margin="normal"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🌐 Midnight Network Integration
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <TextField 
                      fullWidth 
                      label="Contract Address" 
                      value="midnight1medproof..." 
                      disabled 
                      margin="normal"
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Network Status:
                      </Typography>
                      <Chip 
                        icon={<CheckCircle />} 
                        label="Connected to Testnet" 
                        color="success" 
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;