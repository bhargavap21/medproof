import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Tab,
  Tabs,
  Grid,
  Link,
  Divider
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HospitalAdminAuth() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear any existing research account session when accessing hospital admin
  useEffect(() => {
    const clearExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('🔄 Clearing existing session for hospital admin portal');
          console.log('🔄 Found existing session for user:', session.user.email);
          await supabase.auth.signOut();
          console.log('✅ Session cleared successfully');
          // Force page reload to ensure clean state
          window.location.reload();
        }
      } catch (err) {
        console.log('⚠️ Error clearing session:', err);
      }
    };

    clearExistingSession();
  }, []);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Sign up form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    hospitalName: '',
    firstName: '',
    lastName: '',
    title: '',
    phone: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log('✅ Login successful, checking hospital admin status for user:', authData.user.id);
        
        // Check if user is a hospital admin
        let { data: adminData, error: adminError } = await supabase
          .from('hospital_admins')
          .select(`
            *,
            hospitals (
              id,
              name,
              is_active
            )
          `)
          .eq('user_id', authData.user.id)
          .single();

        console.log('🔍 Hospital admin lookup result:', { adminData, adminError });

        if (adminError && adminError.code !== 'PGRST116') {
          console.error('❌ Database error during admin lookup:', adminError);
          throw new Error('Access denied: You are not registered as a hospital administrator');
        }

        if (!adminData) {
          console.log('❌ No hospital admin record found for user:', authData.user.id);
          console.log('🔄 Attempting to create missing hospital admin record...');

          // Try to find a hospital associated with this user's email
          let { data: hospitalData, error: hospitalFindError } = await supabase
            .from('hospitals')
            .select('*')
            .eq('contact_email', authData.user.email)
            .single();

          // If no hospital exists, create one from user metadata
          if (hospitalFindError || !hospitalData) {
            console.log('❌ No hospital found for email:', authData.user.email);
            console.log('🔄 Creating hospital from user signup data...');

            // Get hospital name from user metadata (stored during signup)
            const userMetadata = authData.user.user_metadata || {};
            const hospitalName = userMetadata.hospitalName || 'New Hospital';

            console.log('📋 User metadata:', userMetadata);
            console.log('🏥 Creating hospital:', hospitalName);

            // Create the hospital record
            const { data: newHospitalData, error: createHospitalError } = await supabase
              .from('hospitals')
              .insert({
                hospital_id: `hosp_${Date.now()}`,
                name: hospitalName,
                institution_type: 'hospital',
                contact_email: authData.user.email,
                settings: {
                  max_studies_per_org: 50,
                  data_retention_months: 24,
                  auto_approve_known_orgs: false,
                  allowed_organization_types: ["university", "research_institute"]
                }
              })
              .select()
              .single();

            if (createHospitalError) {
              console.error('❌ Failed to create hospital:', createHospitalError);
              throw new Error('Access denied: Unable to create hospital record. Please contact support.');
            }

            console.log('✅ Hospital created successfully:', newHospitalData);
            hospitalData = newHospitalData;
          }

          // Now create hospital_admins record
          const { data: newAdminData, error: createAdminError } = await supabase
            .from('hospital_admins')
            .insert({
              hospital_id: hospitalData.id,
              user_id: authData.user.id,
              role: 'super_admin',
              permissions: {
                manage_data_requests: true,
                approve_requests: true,
                manage_policies: true
              },
              is_active: true
            })
            .select(`
              *,
              hospitals (
                id,
                name,
                is_active
              )
            `)
            .single();

          if (createAdminError) {
            console.error('❌ Failed to create hospital admin record:', createAdminError);
            throw new Error('Access denied: Unable to create hospital administrator record. Please contact support.');
          }

          console.log('✅ Hospital admin record created successfully:', newAdminData);
          adminData = newAdminData;
        }

        console.log('✅ Hospital admin verified, storing session data');
        
        // Store hospital admin info in session storage
        sessionStorage.setItem('hospital_admin', JSON.stringify(adminData));
        
        // Redirect to hospital admin dashboard
        console.log('🏥 Redirecting to hospital admin dashboard');
        navigate('/hospital-admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    console.log('🚀 Hospital Admin Signup started');
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    console.log('📋 Form data:', signupData);

    try {
      // Validate passwords match
      if (signupData.password !== signupData.confirmPassword) {
        console.log('❌ Password mismatch');
        throw new Error('Passwords do not match');
      }

      if (signupData.password.length < 6) {
        console.log('❌ Password too short');
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('✅ Validation passed, calling Supabase signUp...');

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          // Let Supabase use default email confirmation flow (no custom redirect)
          data: {
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            title: signupData.title,
            phone: signupData.phone,
            hospitalName: signupData.hospitalName,
            userType: 'hospital_admin'
          }
        }
      });

      console.log('🔍 Supabase response:', { authData, authError });
      console.log('🔍 Auth data details:', {
        user: authData?.user,
        session: authData?.session,
        userExists: !!authData?.user,
        userId: authData?.user?.id,
        userEmail: authData?.user?.email,
        emailConfirmed: authData?.user?.email_confirmed_at
      });

      if (authError) {
        console.log('❌ Auth error details:', {
          message: authError.message,
          status: authError.status
        });
        throw authError;
      }

      if (authData.user) {
        console.log('✅ User created successfully:', authData.user);
        console.log('📧 Email confirmation required:', !authData.session && !authData.user.email_confirmed_at);

        // Check if this is a case where the user already exists
        if (authData.user.email_confirmed_at) {
          console.log('⚠️ User already exists and is confirmed');
          setError('This email is already registered. Please use the Sign In tab to log in.');
          return;
        }

        // Check if email confirmation is required
        const emailConfirmationRequired = !authData.session && !authData.user.email_confirmed_at;

        if (emailConfirmationRequired) {
          // Show email confirmation message
          console.log('✅ Account created - email confirmation required');
          setSuccess(
            `Account created successfully! We've sent a verification email to ${signupData.email}. ` +
            'Please check your inbox and click the confirmation link to activate your hospital administrator account. ' +
            'Once confirmed, you can sign in using the Sign In tab.'
          );
        } else {
          // Email confirmation not required (immediate login)
          console.log('✅ Account created - no email confirmation required');
          setSuccess(
            'Account created successfully! You can now sign in using the Sign In tab.'
          );
        }

        // Hospital and admin records will be created during first login (in handleLogin function)
        // This ensures records are only created after email is confirmed

        // Clear form
        setSignupData({
          email: '',
          password: '',
          confirmPassword: '',
          hospitalName: '',
          firstName: '',
          lastName: '',
          title: '',
          phone: ''
        });
      } else {
        console.log('⚠️ No user returned in response');
        setError('Registration failed: No user data returned. Please try again.');
      }
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      console.error('❌ Error details:', {
        name: err.name,
        message: err.message,
        status: err.status,
        stack: err.stack
      });
      
      // Handle specific error cases
      if (err.message?.includes('User already registered')) {
        setError('This email is already registered. Please use the Sign In tab to log in.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else if (err.message?.includes('Password')) {
        setError(err.message);
      } else {
        setError(err.message || 'Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('🏁 Signup process completed');
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Box sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
        <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
          {/* Dynamic Header based on tab */}
          {tabValue === 0 ? (
            // Sign In Header - Green themed
            <Box sx={{ bgcolor: '#2e7d32', color: 'white', p: 3, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                MedProof
              </Typography>
              <Typography variant="subtitle1">
                Hospital Administrator Portal
              </Typography>
            </Box>
          ) : (
            // Create Account Header - Identical to research portal but with green
            <Box sx={{ bgcolor: 'white', p: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                <Box sx={{ 
                  bgcolor: '#2e7d32', 
                  color: 'white', 
                  borderRadius: '4px', 
                  p: '6px 8px', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '20px' }}>+</Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  MedProof
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 'normal', mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Sign in to your hospital administrator account
              </Typography>
            </Box>
          )}

          {/* Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>

          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
                
                {error && <Alert severity="error">{error}</Alert>}
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#2e7d32', 
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    py: '12px',
                    boxShadow: 'none',
                    '&:hover': { 
                      bgcolor: '#1b5e20',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>
            </form>
          </TabPanel>

          {/* Sign Up Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSignup}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Create an account to register your hospital and manage data access requests
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({...signupData, firstName: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({...signupData, lastName: e.target.value})}
                      required
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="Job Title"
                  value={signupData.title}
                  onChange={(e) => setSignupData({...signupData, title: e.target.value})}
                  placeholder="e.g., Chief Medical Officer, IT Director"
                  required
                />

                <TextField
                  fullWidth
                  label="Hospital/Organization Name"
                  value={signupData.hospitalName}
                  onChange={(e) => setSignupData({...signupData, hospitalName: e.target.value})}
                  required
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                  required
                />

                <Divider />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  helperText="Minimum 6 characters"
                  required
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  required
                />
                
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#2e7d32', 
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 'normal',
                    py: '12px',
                    boxShadow: 'none',
                    '&:hover': { 
                      bgcolor: '#1b5e20',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>
            </form>
          </TabPanel>

          {/* Footer */}
          <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              Need help? Contact our support team
            </Typography>
            <Link href="#" sx={{ color: '#2e7d32' }}>
              support@medproof.com
            </Link>
          </Box>
        </Paper>

        {/* Cross-link to Research Portal */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Not a hospital administrator?
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/'}
            sx={{ 
              color: '#2e7d32', 
              borderColor: '#2e7d32',
              '&:hover': {
                borderColor: '#1b5e20',
                bgcolor: 'rgba(46, 125, 50, 0.04)'
              }
            }}
          >
            Create Research Account
          </Button>
        </Box>
      </Box>
    </Box>
  );
}