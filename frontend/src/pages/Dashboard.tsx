import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Business,
  Add,
  School,
  Science,
  Biotech,
  LocalHospital,
  AccountBalance,
  VolunteerActivism,
  VerifiedUser,
  Settings,
  Launch,
  TrendingUp,
  People,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, getUserOrganizations } = useAuth();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserOrganizations = async () => {
      if (user) {
        try {
          const userOrgs = await getUserOrganizations();
          setOrganizations(userOrgs);
        } catch (error) {
          console.error('Error loading organizations:', error);
          setError('Failed to load organizations');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserOrganizations();
  }, [user, getUserOrganizations]);

  const handleRegisterOrganization = () => {
    navigate('organization/register');
  };

  const handleViewOrganization = (orgId: string) => {
    navigate(`organization/${orgId}`);
  };

  const getOrganizationIcon = (type: string) => {
    const icons = {
      university: <School />,
      research_institute: <Science />,
      biotech_company: <Biotech />,
      pharmaceutical: <LocalHospital />,
      government_agency: <AccountBalance />,
      ngo: <VolunteerActivism />,
    };
    return icons[type as keyof typeof icons] || <Business />;
  };

  const getVerificationColor = (status: string) => {
    const colors = {
      verified: '#4caf50',
      pending: '#ff9800',
      rejected: '#f44336',
    };
    return colors[status as keyof typeof colors] || '#9e9e9e';
  };

  const getOrganizationTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 3 }}>
          <Business sx={{ fontSize: 60, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Loading Organization Dashboard
          </Typography>
          <LinearProgress sx={{ width: 300, borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Organization Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Manage your research organizations and collaborate with medical institutions through our privacy-preserving platform
        </Typography>

        {/* Welcome User Section */}
        {user && (
          <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
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
          <Alert severity="error" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {organizations.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Organizations
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
                Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {organizations.filter(org => org.research_organizations?.verification_status === 'pending').length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 3, height: '100%' }}>
            <CardContent>
              <People sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {organizations.reduce((total, org) => {
                  const roleLevel = org.role === 'admin' ? 3 : org.role === 'member' ? 2 : 1;
                  return total + roleLevel;
                }, 0)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Access Level
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Organizations Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            My Organizations
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={handleRegisterOrganization}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            Register New Organization
          </Button>
        </Box>

        {organizations.length > 0 ? (
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
                          label={org.verification_status.toUpperCase()}
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
                          label={orgMembership.role.toUpperCase()}
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
          /* Empty State */
          <Card sx={{ textAlign: 'center', py: 8, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
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