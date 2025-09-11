import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface RegistrationFormProps {
  onToggleMode: () => void;
}

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  hospitalId: string;
  department: string;
  position: string;
  employeeId: string;
  medicalLicense: string;
  walletAddress: string;
  requestedPermissions: string[];
  agreedToTerms: boolean;
}

const hospitals = [
  { id: 'MAYO_CLINIC_001', name: 'Mayo Clinic' },
  { id: 'JOHNS_HOPKINS_001', name: 'Johns Hopkins Hospital' },
  { id: 'CLEVELAND_CLINIC_001', name: 'Cleveland Clinic' },
];

const availablePermissions = [
  { id: 'submit_studies', label: 'Submit Medical Studies' },
  { id: 'view_aggregated_data', label: 'View Aggregated Research Data' },
  { id: 'collaborate_studies', label: 'Collaborate on Multi-Hospital Studies' },
];

const departments = [
  'Cardiology Research',
  'Oncology Research',
  'Neurology Research',
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Emergency Medicine',
  'Radiology',
  'Pathology',
  'Other',
];

const steps = ['Account Details', 'Professional Information', 'Permissions & Review'];

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onToggleMode }) => {
  const { signUp, loading } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    hospitalId: '',
    department: '',
    position: '',
    employeeId: '',
    medicalLicense: '',
    walletAddress: '',
    requestedPermissions: [],
    agreedToTerms: false,
  });

  const handleInputChange = (field: keyof RegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 0:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          return 'Please fill in all account fields';
        }
        if (formData.password !== formData.confirmPassword) {
          return 'Passwords do not match';
        }
        if (formData.password.length < 8) {
          return 'Password must be at least 8 characters';
        }
        break;
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.hospitalId || 
            !formData.department || !formData.position || !formData.employeeId) {
          return 'Please fill in all professional information';
        }
        break;
      case 2:
        if (formData.requestedPermissions.length === 0) {
          return 'Please select at least one permission';
        }
        if (!formData.agreedToTerms) {
          return 'Please agree to the terms and conditions';
        }
        break;
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(activeStep);
    if (error) {
      setError(error);
      return;
    }
    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    const error = validateStep(activeStep);
    if (error) {
      setError(error);
      return;
    }

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      hospital_id: formData.hospitalId,
      department: formData.department,
      position: formData.position,
      employee_id: formData.employeeId,
      medical_license: formData.medicalLicense,
      wallet_address: formData.walletAddress,
      requested_permissions: formData.requestedPermissions,
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <LocalHospital sx={{ fontSize: 60, color: 'success.main' }} />
            </Box>
            
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              Application Submitted!
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Thank you for applying to join the MedProof network. Your application has been sent to{' '}
              <strong>{hospitals.find(h => h.id === formData.hospitalId)?.name}</strong> for review.
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              You will receive an email notification once your application is reviewed. 
              Please check your email and follow any additional instructions.
            </Alert>
            
            <Button
              variant="outlined"
              onClick={onToggleMode}
              sx={{ mt: 2 }}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              margin="normal"
              required
              helperText="Use your institutional email address"
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
          </>
        );

      case 1:
        return (
          <>
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
              select
              label="Hospital/Institution"
              value={formData.hospitalId}
              onChange={(e) => handleInputChange('hospitalId', e.target.value)}
              margin="normal"
              required
            >
              {hospitals.map((hospital) => (
                <MenuItem key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              margin="normal"
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Position/Title"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              margin="normal"
              required
              placeholder="e.g., Research Fellow, Principal Investigator"
            />

            <TextField
              fullWidth
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Medical License Number (Optional)"
              value={formData.medicalLicense}
              onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Midnight Network Wallet Address (Optional)"
              value={formData.walletAddress}
              onChange={(e) => handleInputChange('walletAddress', e.target.value)}
              margin="normal"
              helperText="You can add this later after account creation"
            />
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Select the permissions you're requesting:
            </Typography>

            <Box sx={{ mb: 3 }}>
              {availablePermissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={formData.requestedPermissions.includes(permission.id)}
                      onChange={(e) => {
                        const permissions = e.target.checked
                          ? [...formData.requestedPermissions, permission.id]
                          : formData.requestedPermissions.filter(p => p !== permission.id);
                        handleInputChange('requestedPermissions', permissions);
                      }}
                    />
                  }
                  label={permission.label}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>

            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Application Summary:</Typography>
              <Typography variant="body2">Name: {formData.firstName} {formData.lastName}</Typography>
              <Typography variant="body2">Email: {formData.email}</Typography>
              <Typography variant="body2">Hospital: {hospitals.find(h => h.id === formData.hospitalId)?.name}</Typography>
              <Typography variant="body2">Department: {formData.department}</Typography>
              <Typography variant="body2">Position: {formData.position}</Typography>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the terms and conditions and understand that my application 
                  will be reviewed by the hospital administration before access is granted.
                </Typography>
              }
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
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
            Apply for Research Access
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join the privacy-preserving medical research network
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ mb: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={activeStep === 0 ? onToggleMode : handleBack}
              startIcon={<ArrowBack />}
              variant="outlined"
            >
              {activeStep === 0 ? 'Back to Login' : 'Previous'}
            </Button>

            <Button
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              endIcon={activeStep === steps.length - 1 ? undefined : <ArrowForward />}
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Submit Application'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegistrationForm;