import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  LocalHospital,
  Science,
  Dashboard,
  MoreVert,
  AccountBalanceWallet,
  Link as LinkIcon,
  AdminPanelSettings,
  Logout,
} from '@mui/icons-material';
import { useMidnight } from '../hooks/useMidnight';
import { useAuth } from '../hooks/useAuth';
import LaceWalletButton from './wallet/LaceWalletButton';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, walletAddress, networkId } = useMidnight();
  const { user, profile, signOut, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleProfileMenuClose();
  };

  // Filter navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      { path: '/', label: 'Dashboard', icon: <Dashboard /> },
      { path: '/research', label: 'Research', icon: <Science /> },
    ];

    // Only show admin panel for hospital admins and super admins
    if (hasRole('hospital_admin') || hasRole('super_admin')) {
      items.push({ path: '/admin', label: 'Hospital Admin', icon: <AdminPanelSettings /> });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and Title */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mr: 4 
            }}
            onClick={() => navigate('/')}
          >
            <LocalHospital sx={{ mr: 1, fontSize: 32 }} />
            <Typography
              variant="h5"
              noWrap
              sx={{
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              MedProof
            </Typography>
          </Box>

          {/* Navigation Items - Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  mx: 1,
                  color: 'white',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Midnight Network Status */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: networkId === 'testnet' ? '#4caf50' : networkId ? '#ff9800' : '#9e9e9e',
                borderRadius: '50%',
                mr: 1,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                🌙
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {networkId === 'testnet' || networkId === 'testnet-02' ? 'Midnight Testnet' : networkId ? 'Wrong Network' : 'Midnight Offline'}
              </Typography>
            </Box>
          </Box>

          {/* User Profile Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {/* Lace Wallet Connection */}
            <LaceWalletButton />

            {/* User Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ color: 'white' }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '14px'
                  }}
                >
                  {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2">
                      {profile?.first_name} {profile?.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                    <Chip 
                      label={profile?.role?.replace('_', ' ')} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Logout sx={{ mr: 2 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: '45px' }}
            >
              {navigationItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={() => {
                    navigate(item.path);
                    handleMenuClose();
                  }}
                  sx={{
                    bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                    <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;