import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Container,
  LinearProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Business,
  Email,
  Language,
  LocationOn,
  People,
  PersonAdd,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Info,
  ArrowBack,
  School,
  Science,
  Biotech,
  LocalHospital,
  AccountBalance,
  VolunteerActivism,
  DocumentScanner,
  Group,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type OrganizationType = Database['public']['Enums']['organization_type'];
type MembershipRole = 'admin' | 'member' | 'viewer';

interface OrganizationData {
  id: string;
  name: string;
  org_id: string;
  organization_type: OrganizationType;
  description: string | null;
  website: string | null;
  contact_email: string;
  verification_status: string | null;
  verification_level: string | null;
  address: any;
  research_areas: string[] | null;
  primary_contact_name: string | null;
  primary_contact_title: string | null;
}

interface MemberData {
  id: string;
  user_id: string | null;
  role: string | null;
  permissions: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
  user_profiles?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const OrganizationManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isOrganizationAdmin, getOrganizationPermissions } = useAuth();
  
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MembershipRole>('member');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const getOrganizationIcon = (type: OrganizationType) => {
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

  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        
        // Load organization details
        const { data: orgData, error: orgError } = await supabase
          .from('research_organizations')
          .select('*')
          .eq('id', id)
          .single();

        if (orgError) throw orgError;
        setOrganization(orgData);

        // Load organization members
        const { data: membersData, error: membersError } = await supabase
          .from('organization_memberships')
          .select(`
            id,
            user_id,
            role,
            permissions,
            is_active,
            created_at,
            user_profiles!user_id (
              email,
              first_name,
              last_name
            )
          `)
          .eq('organization_id', id)
          .eq('is_active', true);

        if (membersError) throw membersError;
        setMembers(membersData);

        // Check user permissions
        const permissions = await getOrganizationPermissions(id);
        setUserPermissions(permissions);
        
        const adminStatus = await isOrganizationAdmin(id);
        setIsAdmin(adminStatus);

      } catch (err: any) {
        console.error('Error loading organization:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [id, user, getOrganizationPermissions, isOrganizationAdmin]);

  const handleInviteMember = async () => {
    if (!id || !inviteEmail) return;

    try {
      // In a real implementation, this would send an invitation email
      // For now, we'll just show a success message
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      
      // TODO: Implement invitation system
      alert('Invitation feature coming soon! Members will need to be added manually for now.');
    } catch (err: any) {
      console.error('Error inviting member:', err);
      setError(err.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) return;

    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const { error } = await supabase
          .from('organization_memberships')
          .update({ is_active: false })
          .eq('id', memberId);

        if (error) throw error;

        // Refresh members list
        setMembers(members.filter(m => m.id !== memberId));
      } catch (err: any) {
        console.error('Error removing member:', err);
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading organization details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !organization) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Organization not found'}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Dashboard
          </Button>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {getOrganizationIcon(organization.organization_type)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1">
              {organization.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {organization.organization_type.replace('_', ' ').toUpperCase()}
            </Typography>
          </Box>
          <Chip
            label={organization.verification_status}
            color={getVerificationColor(organization.verification_status || 'default') as any}
            variant={organization.verification_status === 'verified' ? 'filled' : 'outlined'}
          />
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Info />} label="Overview" />
            <Tab icon={<Group />} label="Members" />
            <Tab icon={<DocumentScanner />} label="Documents" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Organization Details
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Organization ID
                          </Typography>
                          <Typography variant="body1">
                            {organization.org_id}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Language sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Website
                          </Typography>
                          <Typography variant="body1">
                            {organization.website ? (
                              <a href={organization.website} target="_blank" rel="noopener noreferrer">
                                {organization.website}
                              </a>
                            ) : (
                              'No website specified'
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Email sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Contact Email
                          </Typography>
                          <Typography variant="body1">
                            {organization.contact_email}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Primary Contact
                          </Typography>
                          <Typography variant="body1">
                            {organization.primary_contact_name || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {organization.primary_contact_title || 'No title specified'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {organization.description || 'No description available'}
                  </Typography>

                  {organization.research_areas && organization.research_areas.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Research Areas
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {organization.research_areas.map((area, index) => (
                          <Chip key={index} label={area} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Total Members</Typography>
                    <Typography variant="h6">{members.length}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Active Members</Typography>
                    <Typography variant="h6">{members.filter(m => m.is_active !== false).length}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">Admins</Typography>
                    <Typography variant="h6">{members.filter(m => m.role === 'admin').length}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Verification Status
                  </Typography>
                  <Chip
                    label={organization.verification_status}
                    color={getVerificationColor(organization.verification_status || 'default') as any}
                    icon={organization.verification_status === 'verified' ? <CheckCircle /> : <Warning />}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Members Tab */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Organization Members ({members.length})
                </Typography>
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setInviteDialogOpen(true)}
                  >
                    Invite Member
                  </Button>
                )}
              </Box>

              <List>
                {members.map((member) => (
                  <ListItem key={member.id} divider>
                    <ListItemIcon>
                      <Avatar>
                        {member.user_profiles?.first_name?.[0] || 
                         member.user_profiles?.email[0].toUpperCase()}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        member.user_profiles?.first_name && member.user_profiles?.last_name
                          ? `${member.user_profiles.first_name} ${member.user_profiles.last_name}`
                          : member.user_profiles?.email
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {member.user_profiles?.email}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Chip label={member.role || 'member'} size="small" color="primary" />
                            {(member.permissions || []).map((permission) => (
                              <Chip
                                key={permission}
                                label={permission.replace('_', ' ')}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    {isAdmin && member.user_id && member.user_id !== user?.id && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveMember(member.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>

              {members.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No members yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents Tab */}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verification Documents
              </Typography>
              <Alert severity="info">
                Document management feature coming soon. Contact support to update verification documents.
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Settings
              </Typography>
              <Alert severity="info">
                Settings management feature coming soon. Contact support to update organization settings.
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Invite Member Dialog */}
        <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Role"
              fullWidth
              variant="outlined"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as MembershipRole)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteMember} variant="contained">
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrganizationManagement;