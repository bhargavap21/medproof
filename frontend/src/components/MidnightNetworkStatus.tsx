import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Link
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

interface MidnightStatus {
  midnightNetworkReady: boolean;
  networkId: string;
  mode: string;
  contractAddress: string;
  rpcEndpoint: string;
}

interface MidnightNetworkStatusProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const MidnightNetworkStatus: React.FC<MidnightNetworkStatusProps> = ({
  autoRefresh = true,
  refreshInterval = 10000 // 10 seconds
}) => {
  const [status, setStatus] = useState<MidnightStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/midnight-status');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Midnight status: ${response.statusText}`);
      }

      const data = await response.json();
      const networkStatus = data.networkStatus || data;

      setStatus(networkStatus);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching Midnight status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    fetchStatus();
  };

  const getStatusColor = () => {
    if (error) return 'error';
    if (!status?.midnightNetworkReady) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (error) return <ErrorIcon />;
    if (!status?.midnightNetworkReady) return <ErrorIcon />;
    return <CheckCircleIcon />;
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (!status?.midnightNetworkReady) return 'Not Ready';
    return 'Connected';
  };

  if (loading && !status) {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 3
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 3 }}>
            <CircularProgress sx={{ color: 'white' }} />
            <Typography sx={{ ml: 2 }}>Connecting to Midnight Network...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          mb: 3
        }}
      >
        <CardContent>
          <Alert severity="error" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              🌙 Midnight Network Connection Error
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        mb: 3,
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'rgba(255,255,255,0.5)'
            }
          }}
        />
      )}

      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography variant="h4">🌙</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Midnight Network
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Privacy-Preserving Blockchain
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor()}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            <Tooltip title="Refresh Status">
              <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Network Information */}
        <Grid container spacing={2}>
          {/* Network ID */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                p: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Network
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {status?.networkId || 'Unknown'}
              </Typography>
              <Chip
                label={status?.mode || 'Unknown'}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Grid>

          {/* Contract Address */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                p: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Compact Contract
                </Typography>
              </Box>
              <Tooltip title={status?.contractAddress || 'Not deployed'}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {status?.contractAddress
                    ? `${status.contractAddress.slice(0, 12)}...${status.contractAddress.slice(-8)}`
                    : 'Not deployed'}
                </Typography>
              </Tooltip>
              {status?.contractAddress && (
                <Link
                  href={`https://explorer.midnight.network/contract/${status.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    mt: 1,
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  View on Explorer
                  <OpenInNewIcon sx={{ ml: 0.5, fontSize: 14 }} />
                </Link>
              )}
            </Box>
          </Grid>

          {/* RPC Endpoint */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                p: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  RPC Endpoint
                </Typography>
              </Box>
              <Tooltip title={status?.rpcEndpoint || 'Not configured'}>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {status?.rpcEndpoint
                    ? status.rpcEndpoint.replace('https://', '').replace('http://', '')
                    : 'Not configured'}
                </Typography>
              </Tooltip>
              <Chip
                label="Connected"
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: 'rgba(76, 175, 80, 0.3)',
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : 'Connecting...'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Powered by
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Midnight Network
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MidnightNetworkStatus;


