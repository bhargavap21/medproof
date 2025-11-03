import React, { useState } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Menu, MenuOpen } from '@mui/icons-material';
import Sidebar from './Sidebar';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: isMobile ? 0 : 0, // Sidebar is permanent, no margin needed
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        {/* Top Header Bar */}
        <Box sx={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          px: 3,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          zIndex: 1,
        }}>
          <IconButton
            onClick={handleSidebarToggle}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
              },
            }}
          >
            {sidebarOpen ? <MenuOpen /> : <Menu />}
          </IconButton>
        </Box>

        {/* Content Area */}
        <Box sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout;