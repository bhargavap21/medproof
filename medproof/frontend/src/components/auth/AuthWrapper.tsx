import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from './LoginForm';
import SimpleRegistrationForm from './SimpleRegistrationForm';
import { Box, CircularProgress } from '@mui/material';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  console.log('🔒 AuthWrapper render - loading:', loading, 'user:', user ? 'exists' : 'null');

  if (loading) {
    console.log('🔒 AuthWrapper showing loading screen');
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!user) {
    console.log('🔒 AuthWrapper showing auth forms');
    return isRegistering ? (
      <SimpleRegistrationForm onToggleMode={() => setIsRegistering(false)} />
    ) : (
      <LoginForm onToggleMode={() => setIsRegistering(true)} />
    );
  }

  console.log('🔒 AuthWrapper showing main app');
  return <>{children}</>;
};

export default AuthWrapper;