import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital, ArrowBack, Email } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface SimpleRegistrationFormProps {
  onToggleMode: () => void;
}

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  title: string;
  institution: string;
  agreedToTerms: boolean;
}

const SimpleRegistrationForm: React.FC<SimpleRegistrationFormProps> = ({ onToggleMode }) => {
  const { signUp, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check localStorage on component mount to restore success state
  const [success, setSuccess] = useState(() => {
    const saved = localStorage.getItem('registration_success');
    return saved === 'true';
  });
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(() => {
    const saved = localStorage.getItem('registration_email_confirmation');
    return saved === 'true';
  });
  
  // Use refs to preserve success state and prevent resets
  const successRef = React.useRef(false);
  const emailConfirmationRef = React.useRef(false);

  // Debug state changes
  React.useEffect(() => {
    console.log('🔄 State changed - success:', success, 'emailConfirmationRequired:', emailConfirmationRequired);
  }, [success, emailConfirmationRequired]);

  // Prevent auth state changes from resetting our success state
  React.useEffect(() => {
    if (success) {
      console.log('🔒 Success state is true, preventing resets');
    }
  }, [loading]); // Monitor loading changes that might reset state

  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    title: '',
    institution: '',
    agreedToTerms: false,
  });

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = (): string | null => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.firstName || !formData.lastName) {
      return 'Please fill in all required fields';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    if (!formData.agreedToTerms) {
      return 'Please agree to the terms and conditions';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Form submission started');
    e.preventDefault();
    setError(null);
    
    console.log('📝 Form data:', formData);
    
    const error = validate();
    if (error) {
      console.error('❌ Validation error:', error);
      setError(error);
      return;
    }

    console.log('✅ Validation passed, calling signUp...');

    try {
      const { data, error: signUpError } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        title: formData.title,
        institution: formData.institution,
      });

      if (signUpError) {
        console.error('❌ Registration error:', signUpError);
        setError(signUpError.message || 'Registration failed. Please try again.');
      } else if (data?.user) {
        console.log('✅ Registration successful:', data);
        
        // Check if email confirmation is required
        if (!data.session && data.user && !data.user.email_confirmed_at) {
          console.log('📧 Email confirmation required - setting states');
          successRef.current = true;
          emailConfirmationRef.current = true;
          localStorage.setItem('registration_success', 'true');
          localStorage.setItem('registration_email_confirmation', 'true');
          localStorage.setItem('registration_email', formData.email);
          setEmailConfirmationRequired(true);
          setSuccess(true);
          console.log('📧 States set - emailConfirmationRequired: true, success: true');
        } else {
          console.log('✅ User authenticated immediately - setting states');
          successRef.current = true;
          emailConfirmationRef.current = false;
          localStorage.setItem('registration_success', 'true');
          localStorage.setItem('registration_email_confirmation', 'false');
          localStorage.setItem('registration_email', formData.email);
          setEmailConfirmationRequired(false);
          setSuccess(true);
          console.log('✅ States set - emailConfirmationRequired: false, success: true');
        }
      } else {
        console.error('❌ Unexpected registration response:', data);
        setError('Registration completed but something went wrong. Please try signing in.');
      }
    } catch (err) {
      console.error('❌ Unexpected registration error:', err);
      console.error('❌ Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      console.error('❌ Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error'
      });
      setError(`Registration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  console.log('🎯 Render check - success:', success, 'emailConfirmationRequired:', emailConfirmationRequired);
  console.log('🔍 Ref check - successRef:', successRef.current, 'emailConfirmationRef:', emailConfirmationRef.current);
  
  // Use refs and localStorage as fallback if state gets reset
  const shouldShowSuccess = success || successRef.current || localStorage.getItem('registration_success') === 'true';
  const shouldShowEmailConfirmation = emailConfirmationRequired || emailConfirmationRef.current || localStorage.getItem('registration_email_confirmation') === 'true';
  
  // Get email from localStorage if needed
  const displayEmail = formData.email || localStorage.getItem('registration_email') || '';
  
  if (shouldShowSuccess) {
    console.log('🎉 Rendering success screen');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {shouldShowEmailConfirmation ? (
                <Email sx={{ fontSize: 60, color: 'warning.main' }} />
              ) : (
                <LocalHospital sx={{ fontSize: 60, color: 'success.main' }} />
              )}
            </Box>
            
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              {shouldShowEmailConfirmation ? 'Check Your Email!' : 'Account Created!'}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              {shouldShowEmailConfirmation 
                ? `We've sent a confirmation email to ${displayEmail}. Please check your inbox and click the verification link to complete your registration.`
                : 'Welcome to MedProof! Your account has been created successfully.'
              }
            </Typography>
            
            <Alert severity={shouldShowEmailConfirmation ? "warning" : "info"} sx={{ mb: 3 }}>
              {shouldShowEmailConfirmation 
                ? 'Please verify your email address before you can sign in and start using MedProof.'
                : 'You can now create or join research organizations to access hospital data and collaborate on studies.'
              }
            </Alert>
            
            <Button
              variant="contained"
              onClick={() => {
                // Clean up localStorage before going to login
                localStorage.removeItem('registration_success');
                localStorage.removeItem('registration_email_confirmation');
                localStorage.removeItem('registration_email');
                onToggleMode();
              }}
              sx={{ mt: 2 }}
              size="large"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospital sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                MedProof
              </Typography>
            </Box>
          </Box>

          <Typography variant="h5" component="h1" align="center" sx={{ mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join the privacy-preserving medical research network
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                margin="normal"
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              margin="normal"
              required
              helperText="Minimum 8 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              margin="normal"
              required
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
              Professional Information (Optional)
            </Typography>

            <TextField
              fullWidth
              label="Title/Position"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              margin="normal"
              placeholder="e.g., Research Fellow, Principal Investigator"
            />

            <TextField
              fullWidth
              label="Institution"
              value={formData.institution}
              onChange={(e) => handleInputChange('institution', e.target.value)}
              margin="normal"
              placeholder="e.g., Stanford University School of Medicine"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    Terms of Service
                  </Typography>
                  {' '}and{' '}
                  <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    Privacy Policy
                  </Typography>
                </Typography>
              }
              sx={{ mt: 2, mb: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onToggleMode}
            >
              Back to Login
            </Button>
          </form>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              What's Next?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Browse public research and studies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Create or join research organizations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Request access to hospital data for approved studies
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleRegistrationForm;