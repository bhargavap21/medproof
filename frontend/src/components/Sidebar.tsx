import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Science,
  LocalHospital,
  VerifiedUser,
  Assessment,
  Business,
  Settings,
  AdminPanelSettings,
  AccountBalanceWallet,
  TrendingUp,
  ExpandLess,
  ExpandMore,
  PersonAdd,
  Description,
  Security,
  DataUsage,
  Logout,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut, hasRole } = useAuth();
  const { isConnected, account, networkId } = useWeb3();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const navigationSections: NavigationSection[] = [
    {
      title: 'Overview',
      items: [
        {
          path: '',
          label: 'Dashboard',
          icon: <Dashboard />,
          description: 'Platform overview and statistics'
        }
      ]
    },
    {
      title: 'Research',
      items: [
        {
          path: 'research',
          label: 'Research Hub',
          icon: <Science />,
          description: 'Browse and explore studies'
        },
        {
          path: 'research-results',
          label: 'Results & Analytics',
          icon: <TrendingUp />,
          description: 'View research findings'
        },
        {
          path: 'zk-proof-generator',
          label: 'ZK Proof Generator',
          icon: <VerifiedUser />,
          description: 'Generate privacy proofs'
        },
        {
          path: 'study-request',
          label: 'Study Management',
          icon: <Description />,
          description: 'Manage research studies',
          children: [
            {
              path: 'study-request/create',
              label: 'Create Study Request',
              icon: <PersonAdd />,
            },
            {
              path: 'study-requests',
              label: 'Manage Requests',
              icon: <Assessment />,
            }
          ]
        }
      ]
    },
    {
      title: 'Data & Hospitals',
      items: [
        {
          path: 'hospitals',
          label: 'Hospital Network',
          icon: <LocalHospital />,
          description: 'Partner hospitals'
        },
        {
          path: 'hospital-data-request',
          label: 'Data Requests',
          icon: <DataUsage />,
          description: 'Request hospital data access'
        },
        {
          path: 'data-analytics',
          label: 'Data Analytics',
          icon: <Assessment />,
          description: 'Analyze aggregated data'
        }
      ]
    },
    {
      title: 'Organizations',
      items: [
        {
          path: 'organization/register',
          label: 'Register Organization',
          icon: <Business />,
          description: 'Add new research organization'
        },
        {
          path: 'organizations',
          label: 'Browse Organizations',
          icon: <Settings />,
          description: 'View all organizations'
        }
      ]
    },
    ...(hasRole('hospital_admin') || hasRole('super_admin') ? [{
      title: 'Administration',
      items: [
        {
          path: 'admin',
          label: 'Admin Dashboard',
          icon: <AdminPanelSettings />,
          description: 'System administration'
        },
        {
          path: 'admin/organizations',
          label: 'Manage Organizations',
          icon: <Settings />,
          description: 'Organization management'
        },
        {
          path: 'admin/hospital-data',
          label: 'Hospital Data Access',
          icon: <Assessment />,
          description: 'Manage data access requests'
        }
      ]
    }] : [])
  ];

  const isActive = (path: string) => {
    if (path === '') {
      return location.pathname === '/' || location.pathname === '';
    }
    const fullPath = `/${path}`;
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + '/');
  };

  const getNetworkStatus = () => {
    if (networkId === 1337) return { status: 'Connected', color: '#4caf50' };
    if (networkId) return { status: 'Wrong Network', color: '#ff9800' };
    return { status: 'Disconnected', color: '#f44336' };
  };

  const networkStatus = getNetworkStatus();

  const handleSignOut = async () => {
    await signOut();
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.path}>
        <ListItem
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.path);
            } else {
              // Handle empty path for dashboard - navigate to root
              if (item.path === '') {
                navigate('/');
              } else {
                navigate(`/${item.path}`);
              }
            }
          }}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 2,
            cursor: 'pointer',
            pl: 2 + level * 2,
            background: active ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
            border: active ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'rgba(88, 166, 255, 0.1)',
              border: '1px solid rgba(88, 166, 255, 0.2)',
              transform: open ? 'translateX(4px)' : 'none',
            },
          }}
        >
          <ListItemIcon sx={{
            color: active ? 'primary.main' : 'text.secondary',
            minWidth: open ? 40 : 'auto',
            mr: open ? 1 : 0,
            justifyContent: 'center',
          }}>
            {item.icon}
          </ListItemIcon>

          {open && (
            <>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  color: active ? 'primary.main' : 'text.primary',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.9rem',
                }}
                secondaryTypographyProps={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  mt: 0.25,
                }}
              />
              {hasChildren && (
                <IconButton size="small">
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                />
              )}
            </>
          )}
        </ListItem>

        {hasChildren && open && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderNavigationItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          background: '#161b22',
          border: 'none',
          borderRight: '1px solid #30363d',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          overflow: 'visible',
        },
      }}
    >
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Header */}
        <Box sx={{
          p: open ? 2 : 1,
          display: 'flex',
          alignItems: 'center',
          minHeight: 72,
          borderBottom: '1px solid #30363d',
        }}>
          {open ? (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexGrow: 1,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
              onClick={() => navigate('/')}
            >
              <LocalHospital sx={{
                mr: 2,
                fontSize: 28,
                color: 'primary.main',
              }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                MedProof
              </Typography>
            </Box>
          ) : (
            <LocalHospital 
              sx={{
                fontSize: 28,
                color: 'primary.main',
                mx: 'auto',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
              onClick={() => navigate('/')}
            />
          )}
        </Box>

        {/* User Profile */}
        <Box sx={{
          p: open ? 2 : 1,
          borderBottom: '1px solid #e0e0e0',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: open ? 'row' : 'column',
            gap: open ? 2 : 1,
          }}>
            <Avatar sx={{
              width: open ? 48 : 36,
              height: open ? 48 : 36,
              bgcolor: 'primary.main',
              fontSize: open ? '20px' : '16px',
              fontWeight: 600,
            }}>
              {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>

            {open && (
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {profile?.first_name} {profile?.last_name}
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'text.secondary',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.email}
                </Typography>
                <Chip
                  label={profile?.role?.replace('_', ' ')}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, py: 1, overflowY: 'auto' }}>
          {navigationSections.map((section, sectionIndex) => (
            <Box key={section.title} sx={{ mb: 3 }}>
              {/* Section Header */}
              {open && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 1,
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    display: 'block',
                  }}
                >
                  {section.title}
                </Typography>
              )}

              {/* Section Items */}
              <List sx={{ px: 0 }}>
                {section.items.map(item => renderNavigationItem(item))}
              </List>

              {/* Divider between sections (except last) */}
              {open && sectionIndex < navigationSections.length - 1 && (
                <Divider sx={{ mx: 2, mt: 2 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Status & Actions */}
        <Box sx={{
          p: open ? 2 : 1,
          borderTop: '1px solid #30363d',
          background: 'rgba(255, 255, 255, 0.05)',
        }}>
          {/* Network Status */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            justifyContent: open ? 'flex-start' : 'center',
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: networkStatus.color,
              mr: open ? 1 : 0,
            }} />
            {open && (
              <Typography variant="caption" sx={{
                color: 'text.secondary',
                fontWeight: 500,
              }}>
                {networkStatus.status}
              </Typography>
            )}
          </Box>

          {/* Wallet */}
          {isConnected && account && open && (
            <Chip
              icon={<AccountBalanceWallet />}
              label={`${account.slice(0, 6)}...${account.slice(-4)}`}
              size="small"
              variant="outlined"
              color="primary"
              sx={{
                mb: 2,
                width: '100%',
              }}
            />
          )}

          {/* Action Buttons */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            justifyContent: open ? 'space-between' : 'center',
            flexDirection: open ? 'row' : 'column',
          }}>
            <Tooltip title="Settings" placement="right">
              <IconButton size="small" sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}>
                <Settings />
              </IconButton>
            </Tooltip>

            <Tooltip title="Security" placement="right">
              <IconButton size="small" sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}>
                <Security />
              </IconButton>
            </Tooltip>

            <Tooltip title="Sign Out" placement="right">
              <IconButton
                size="small"
                onClick={handleSignOut}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main' },
                }}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;