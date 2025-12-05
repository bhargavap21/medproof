/**
 * Lace Wallet Connection Button
 * 
 * Displays wallet connection status and allows users to connect/disconnect
 * their Lace wallet for Midnight Network interactions.
 */

import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ExpandMore,
  ContentCopy,
  OpenInNew,
  Logout,
  CheckCircle,
  Error as ErrorIcon,
  Download,
} from '@mui/icons-material';
import { useMidnight } from '../../hooks/useMidnight';
import { getAddressUrl } from '../../config/midnight';

const LaceWalletButton: React.FC = () => {
  const {
    isConnected,
    walletAddress,
    balance,
    isLaceInstalled,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    error,
    loading,
  } = useMidnight();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleConnect = async () => {
    try {
      setShowError(false);
      await connectWallet();
    } catch (err) {
      setShowError(true);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    handleCloseMenu();
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleViewOnExplorer = () => {
    if (walletAddress) {
      window.open(getAddressUrl(walletAddress), '_blank');
    }
  };

  // If Lace is not installed
  if (!isLaceInstalled) {
    return (
      <Box>
        <Tooltip title="Install Lace Wallet to connect">
          <Button
            variant="outlined"
            color="warning"
            startIcon={<Download />}
            onClick={() => window.open('https://chromewebstore.google.com/detail/lace-beta/hgeekaiplokcnmakghbdfbgnlfheichg', '_blank')}
            sx={{
              borderRadius: 2,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Install Lace Wallet
          </Button>
        </Tooltip>
      </Box>
    );
  }

  // If not connected
  if (!isConnected) {
    return (
      <Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <AccountBalanceWallet />}
          onClick={handleConnect}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          {loading ? 'Connecting...' : 'Connect Lace Wallet'}
        </Button>
        
        {showError && error && (
          <Alert
            severity="error"
            onClose={() => setShowError(false)}
            sx={{ mt: 2, maxWidth: 400 }}
          >
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // If connected
  return (
    <Box>
      <Button
        variant="contained"
        onClick={handleOpenMenu}
        endIcon={<ExpandMore />}
        sx={{
          borderRadius: 2,
          px: 2,
          py: 1,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet sx={{ fontSize: 20 }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {getShortAddress()}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              {balance !== null ? `${balance.toLocaleString()} tDUST` : 'Loading...'}
            </Typography>
          </Box>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 300,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      >
        {/* Wallet Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Connected Wallet
            </Typography>
            <Chip
              icon={<CheckCircle />}
              label="Connected"
              size="small"
              color="success"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          
          {/* Wallet Address */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'rgba(0,0,0,0.05)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem',
              }}
            >
              {getShortAddress()}
            </Typography>
            <Tooltip title={copySuccess ? 'Copied!' : 'Copy address'}>
              <IconButton size="small" onClick={handleCopyAddress}>
                {copySuccess ? <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Balance */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Balance:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {balance !== null ? `${balance.toLocaleString()} tDUST` : 'Loading...'}
            </Typography>
          </Box>
        </Box>

        {/* Menu Actions */}
        <MenuItem onClick={handleViewOnExplorer}>
          <OpenInNew sx={{ mr: 1, fontSize: 18 }} />
          View on Explorer
        </MenuItem>

        <MenuItem
          onClick={handleDisconnect}
          sx={{
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.dark',
            },
          }}
        >
          <Logout sx={{ mr: 1, fontSize: 18 }} />
          Disconnect
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LaceWalletButton;

