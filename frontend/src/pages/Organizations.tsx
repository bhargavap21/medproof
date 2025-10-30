import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Business,
  School,
  Science,
  Biotech,
  LocalHospital,
  AccountBalance,
  VolunteerActivism,
  Search,
  Add,
  VerifiedUser,
} from '@mui/icons-material';

const Organizations: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterOrganization = () => {
    navigate('organization/register');
  };

  // Mock data for demonstration
  const organizations = [
    {
      id: 1,
      name: 'Stanford Medical Research Institute',
      type: 'university',
      status: 'verified',
      description: 'Leading research in cardiovascular medicine and AI-driven diagnostics',
      members: 156,
      studies: 23,
    },
    {
      id: 2,
      name: 'BioTech Innovations LLC',
      type: 'biotech_company',
      status: 'pending',
      description: 'Developing novel therapeutic solutions for rare diseases',
      members: 89,
      studies: 12,
    },
    {
      id: 3,
      name: 'National Health Research Center',
      type: 'government_agency',
      status: 'verified',
      description: 'Government-led research initiatives in public health',
      members: 234,
      studies: 45,
    },
    {
      id: 4,
      name: 'Global Health Alliance',
      type: 'ngo',
      status: 'verified',
      description: 'Non-profit organization focused on global health equity',
      members: 67,
      studies: 18,
    },
    {
      id: 5,
      name: 'PharmaCorpe Research Division',
      type: 'pharmaceutical',
      status: 'pending',
      description: 'Pharmaceutical research and clinical trial management',
      members: 312,
      studies: 56,
    },
    {
      id: 6,
      name: 'Independent Medical Research',
      type: 'research_institute',
      status: 'verified',
      description: 'Independent research institute specializing in precision medicine',
      members: 134,
      studies: 29,
    },
  ];

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

  const getOrganizationTypeLabel = (type: string | undefined | null) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Business sx={{ color: 'primary.main' }} />
          Research Organizations
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Browse and connect with research organizations in the MedProof network
        </Typography>

        {/* Search and Actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          <TextField
            placeholder="Search organizations..."
            variant="outlined"
            size="medium"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleRegisterOrganization}
            sx={{ px: 3, py: 1.5, fontWeight: 600 }}
          >
            Register Organization
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Business sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {organizations.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Organizations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <VerifiedUser sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {organizations.filter(org => org.status === 'verified').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 2 }}>
              <CardContent>
                <Science sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {organizations.reduce((sum, org) => sum + org.studies, 0)}
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
                <Business sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {organizations.reduce((sum, org) => sum + org.members, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Organizations Grid */}
      <Grid container spacing={3}>
        {organizations.map((org) => (
          <Grid item xs={12} md={6} lg={4} key={org.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mr: 2,
                      bgcolor: 'primary.main',
                    }}
                  >
                    {getOrganizationIcon(org.type)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {org.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {getOrganizationTypeLabel(org.type)}
                    </Typography>
                  </Box>
                </Box>

                {/* Status Badge */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={org.status.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getVerificationColor(org.status) + '20',
                      color: getVerificationColor(org.status),
                      border: `1px solid ${getVerificationColor(org.status)}40`,
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
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
                  {org.description}
                </Typography>

                {/* Stats */}
                <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Members:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{org.members}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Studies:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{org.studies}</Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2, fontWeight: 600 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Organizations;