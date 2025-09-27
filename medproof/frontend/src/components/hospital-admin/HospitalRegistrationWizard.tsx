import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  FormGroup,
  TextareaAutosize
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HospitalRegistrationData {
  // Step 1: Basic Information
  hospitalName: string;
  legalName: string;
  hospitalType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    primaryPhone: string;
    secondaryPhone: string;
    primaryEmail: string;
    website: string;
  };
  
  // Step 2: Legal & Compliance
  licenses: {
    hospitalLicense: string;
    accreditationBody: string;
    accreditationNumber: string;
    expirationDate: string;
  };
  complianceStandards: string[];
  dataProtectionOfficer: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Step 3: Technical Infrastructure
  dataManagementSystems: string[];
  securityCertifications: string[];
  dataEncryption: boolean;
  accessControls: boolean;
  auditLogging: boolean;
  backupSystems: boolean;
  technicalContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  
  // Step 4: Data Governance
  dataCategories: string[];
  sharingPolicies: {
    researchPurposes: boolean;
    commercialUse: boolean;
    academicCollaborations: boolean;
    publicHealthInitiatives: boolean;
  };
  consentManagement: {
    hasConsentSystem: boolean;
    consentTypes: string[];
  };
  dataRetentionPolicy: {
    defaultRetentionPeriod: number;
    hasCustomPolicies: boolean;
    policyDescription: string;
  };
}

const steps = [
  'Basic Information',
  'Legal & Compliance',
  'Technical Infrastructure',
  'Data Governance'
];

const hospitalTypes = [
  'General Hospital',
  'Specialty Hospital',
  'Teaching Hospital',
  'Research Hospital',
  'Community Hospital',
  'Critical Access Hospital',
  'Children\'s Hospital',
  'Psychiatric Hospital',
  'Rehabilitation Hospital'
];

const complianceStandardsOptions = [
  'HIPAA',
  'GDPR',
  'ISO 27001',
  'SOC 2',
  'NIST Cybersecurity Framework',
  'HITECH Act',
  'FDA 21 CFR Part 11',
  'Joint Commission Standards'
];

const dataManagementSystemsOptions = [
  'Epic',
  'Cerner',
  'AllScripts',
  'MEDITECH',
  'athenahealth',
  'NextGen',
  'eClinicalWorks',
  'Custom EHR System',
  'Laboratory Information System (LIS)',
  'Picture Archiving System (PACS)',
  'Radiology Information System (RIS)'
];

const dataCategoriesOptions = [
  'Patient Demographics',
  'Clinical Notes',
  'Laboratory Results',
  'Imaging Data',
  'Medication Records',
  'Surgical Records',
  'Vital Signs',
  'Diagnostic Codes (ICD)',
  'Procedure Codes (CPT)',
  'Genomic Data',
  'Mental Health Records',
  'Emergency Department Records'
];

export default function HospitalRegistrationWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<HospitalRegistrationData>({
    hospitalName: '',
    legalName: '',
    hospitalType: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    contactInfo: {
      primaryPhone: '',
      secondaryPhone: '',
      primaryEmail: '',
      website: ''
    },
    licenses: {
      hospitalLicense: '',
      accreditationBody: '',
      accreditationNumber: '',
      expirationDate: ''
    },
    complianceStandards: [],
    dataProtectionOfficer: {
      name: '',
      email: '',
      phone: ''
    },
    dataManagementSystems: [],
    securityCertifications: [],
    dataEncryption: false,
    accessControls: false,
    auditLogging: false,
    backupSystems: false,
    technicalContact: {
      name: '',
      title: '',
      email: '',
      phone: ''
    },
    dataCategories: [],
    sharingPolicies: {
      researchPurposes: false,
      commercialUse: false,
      academicCollaborations: false,
      publicHealthInitiatives: false
    },
    consentManagement: {
      hasConsentSystem: false,
      consentTypes: []
    },
    dataRetentionPolicy: {
      defaultRetentionPeriod: 7,
      hasCustomPolicies: false,
      policyDescription: ''
    }
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // No user logged in, redirect to login
          navigate('/hospital-admin/login');
          return;
        }

        // Check if user has hospital admin metadata
        const userMetadata = user.user_metadata;
        if (!userMetadata?.userType || userMetadata.userType !== 'hospital_admin') {
          setError('Access denied: Only hospital administrators can register hospitals. Please create a hospital admin account first.');
          setTimeout(() => navigate('/hospital-admin/login'), 3000);
          return;
        }

        setUser(user);
        setCheckingAuth(false);
      } catch (err: any) {
        setError('Authentication error occurred');
        setTimeout(() => navigate('/hospital-admin/login'), 3000);
      }
    };

    checkAuthentication();
  }, [navigate]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // First create the hospital record
      const hospitalData = {
        name: formData.hospitalName,
        legal_name: formData.legalName,
        type: formData.hospitalType,
        address: formData.address,
        contact_info: formData.contactInfo,
        is_active: false, // Pending approval
        created_at: new Date().toISOString()
      };

      const { data: hospital, error: hospitalError } = await supabase
        .from('hospitals')
        .insert(hospitalData)
        .select()
        .single();

      if (hospitalError) throw hospitalError;

      // Create hospital registration record
      const registrationData = {
        hospital_id: hospital.id,
        registration_status: 'pending',
        registration_data: {
          licenses: formData.licenses,
          complianceStandards: formData.complianceStandards,
          dataProtectionOfficer: formData.dataProtectionOfficer,
          dataManagementSystems: formData.dataManagementSystems,
          securityCertifications: formData.securityCertifications,
          technicalInfrastructure: {
            dataEncryption: formData.dataEncryption,
            accessControls: formData.accessControls,
            auditLogging: formData.auditLogging,
            backupSystems: formData.backupSystems
          },
          technicalContact: formData.technicalContact,
          dataCategories: formData.dataCategories,
          sharingPolicies: formData.sharingPolicies,
          consentManagement: formData.consentManagement,
          dataRetentionPolicy: formData.dataRetentionPolicy
        },
        submitted_at: new Date().toISOString()
      };

      const { error: registrationError } = await supabase
        .from('hospital_registrations')
        .insert(registrationData);

      if (registrationError) throw registrationError;

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Unable to get current user');
      }

      // Create hospital_admins record to link user to hospital
      const { error: adminError } = await supabase
        .from('hospital_admins')
        .insert({
          hospital_id: hospital.id,
          user_id: user.id,
          role: 'super_admin',
          is_active: true
        });

      if (adminError) throw adminError;

      console.log('✅ Hospital registration completed successfully');
      setSuccess(true);
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/hospital-admin/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInformation = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Hospital Information</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Hospital Name"
            value={formData.hospitalName}
            onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Legal Name"
            value={formData.legalName}
            onChange={(e) => setFormData({...formData, legalName: e.target.value})}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Hospital Type</InputLabel>
            <Select
              value={formData.hospitalType}
              onChange={(e) => setFormData({...formData, hospitalType: e.target.value})}
            >
              {hospitalTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Address</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={formData.address.street}
            onChange={(e) => setFormData({
              ...formData,
              address: {...formData.address, street: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            value={formData.address.city}
            onChange={(e) => setFormData({
              ...formData,
              address: {...formData.address, city: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="State"
            value={formData.address.state}
            onChange={(e) => setFormData({
              ...formData,
              address: {...formData.address, state: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="ZIP Code"
            value={formData.address.zipCode}
            onChange={(e) => setFormData({
              ...formData,
              address: {...formData.address, zipCode: e.target.value}
            })}
            required
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Contact Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Primary Phone"
            value={formData.contactInfo.primaryPhone}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: {...formData.contactInfo, primaryPhone: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Primary Email"
            type="email"
            value={formData.contactInfo.primaryEmail}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: {...formData.contactInfo, primaryEmail: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Secondary Phone"
            value={formData.contactInfo.secondaryPhone}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: {...formData.contactInfo, secondaryPhone: e.target.value}
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Website"
            value={formData.contactInfo.website}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: {...formData.contactInfo, website: e.target.value}
            })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderLegalCompliance = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Licensing & Accreditation</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Hospital License Number"
            value={formData.licenses.hospitalLicense}
            onChange={(e) => setFormData({
              ...formData,
              licenses: {...formData.licenses, hospitalLicense: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Accreditation Body"
            value={formData.licenses.accreditationBody}
            onChange={(e) => setFormData({
              ...formData,
              licenses: {...formData.licenses, accreditationBody: e.target.value}
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Accreditation Number"
            value={formData.licenses.accreditationNumber}
            onChange={(e) => setFormData({
              ...formData,
              licenses: {...formData.licenses, accreditationNumber: e.target.value}
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="License Expiration Date"
            type="date"
            value={formData.licenses.expirationDate}
            onChange={(e) => setFormData({
              ...formData,
              licenses: {...formData.licenses, expirationDate: e.target.value}
            })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Compliance Standards</Typography>
      <FormGroup>
        {complianceStandardsOptions.map((standard) => (
          <FormControlLabel
            key={standard}
            control={
              <Checkbox
                checked={formData.complianceStandards.includes(standard)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      complianceStandards: [...formData.complianceStandards, standard]
                    });
                  } else {
                    setFormData({
                      ...formData,
                      complianceStandards: formData.complianceStandards.filter(s => s !== standard)
                    });
                  }
                }}
              />
            }
            label={standard}
          />
        ))}
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Data Protection Officer</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Name"
            value={formData.dataProtectionOfficer.name}
            onChange={(e) => setFormData({
              ...formData,
              dataProtectionOfficer: {...formData.dataProtectionOfficer, name: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.dataProtectionOfficer.email}
            onChange={(e) => setFormData({
              ...formData,
              dataProtectionOfficer: {...formData.dataProtectionOfficer, email: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.dataProtectionOfficer.phone}
            onChange={(e) => setFormData({
              ...formData,
              dataProtectionOfficer: {...formData.dataProtectionOfficer, phone: e.target.value}
            })}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderTechnicalInfrastructure = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Data Management Systems</Typography>
      <FormGroup>
        {dataManagementSystemsOptions.map((system) => (
          <FormControlLabel
            key={system}
            control={
              <Checkbox
                checked={formData.dataManagementSystems.includes(system)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      dataManagementSystems: [...formData.dataManagementSystems, system]
                    });
                  } else {
                    setFormData({
                      ...formData,
                      dataManagementSystems: formData.dataManagementSystems.filter(s => s !== system)
                    });
                  }
                }}
              />
            }
            label={system}
          />
        ))}
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Security Infrastructure</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.dataEncryption}
                onChange={(e) => setFormData({...formData, dataEncryption: e.target.checked})}
              />
            }
            label="Data Encryption at Rest and in Transit"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.accessControls}
                onChange={(e) => setFormData({...formData, accessControls: e.target.checked})}
              />
            }
            label="Role-Based Access Controls"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.auditLogging}
                onChange={(e) => setFormData({...formData, auditLogging: e.target.checked})}
              />
            }
            label="Comprehensive Audit Logging"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.backupSystems}
                onChange={(e) => setFormData({...formData, backupSystems: e.target.checked})}
              />
            }
            label="Automated Backup Systems"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Technical Contact</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Name"
            value={formData.technicalContact.name}
            onChange={(e) => setFormData({
              ...formData,
              technicalContact: {...formData.technicalContact, name: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Title"
            value={formData.technicalContact.title}
            onChange={(e) => setFormData({
              ...formData,
              technicalContact: {...formData.technicalContact, title: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.technicalContact.email}
            onChange={(e) => setFormData({
              ...formData,
              technicalContact: {...formData.technicalContact, email: e.target.value}
            })}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.technicalContact.phone}
            onChange={(e) => setFormData({
              ...formData,
              technicalContact: {...formData.technicalContact, phone: e.target.value}
            })}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderDataGovernance = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Available Data Categories</Typography>
      <FormGroup>
        {dataCategoriesOptions.map((category) => (
          <FormControlLabel
            key={category}
            control={
              <Checkbox
                checked={formData.dataCategories.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      dataCategories: [...formData.dataCategories, category]
                    });
                  } else {
                    setFormData({
                      ...formData,
                      dataCategories: formData.dataCategories.filter(c => c !== category)
                    });
                  }
                }}
              />
            }
            label={category}
          />
        ))}
      </FormGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Data Sharing Policies</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sharingPolicies.researchPurposes}
                onChange={(e) => setFormData({
                  ...formData,
                  sharingPolicies: {...formData.sharingPolicies, researchPurposes: e.target.checked}
                })}
              />
            }
            label="Academic Research Purposes"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sharingPolicies.commercialUse}
                onChange={(e) => setFormData({
                  ...formData,
                  sharingPolicies: {...formData.sharingPolicies, commercialUse: e.target.checked}
                })}
              />
            }
            label="Commercial Use (with restrictions)"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sharingPolicies.academicCollaborations}
                onChange={(e) => setFormData({
                  ...formData,
                  sharingPolicies: {...formData.sharingPolicies, academicCollaborations: e.target.checked}
                })}
              />
            }
            label="Academic Collaborations"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sharingPolicies.publicHealthInitiatives}
                onChange={(e) => setFormData({
                  ...formData,
                  sharingPolicies: {...formData.sharingPolicies, publicHealthInitiatives: e.target.checked}
                })}
              />
            }
            label="Public Health Initiatives"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Data Retention Policy</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Default Retention Period (years)"
            type="number"
            value={formData.dataRetentionPolicy.defaultRetentionPeriod}
            onChange={(e) => setFormData({
              ...formData,
              dataRetentionPolicy: {
                ...formData.dataRetentionPolicy,
                defaultRetentionPeriod: parseInt(e.target.value) || 7
              }
            })}
            inputProps={{ min: 1, max: 50 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.dataRetentionPolicy.hasCustomPolicies}
                onChange={(e) => setFormData({
                  ...formData,
                  dataRetentionPolicy: {
                    ...formData.dataRetentionPolicy,
                    hasCustomPolicies: e.target.checked
                  }
                })}
              />
            }
            label="Has Custom Retention Policies"
          />
        </Grid>
        {formData.dataRetentionPolicy.hasCustomPolicies && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Policy Description"
              value={formData.dataRetentionPolicy.policyDescription}
              onChange={(e) => setFormData({
                ...formData,
                dataRetentionPolicy: {
                  ...formData.dataRetentionPolicy,
                  policyDescription: e.target.value
                }
              })}
              placeholder="Describe your custom data retention policies..."
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderLegalCompliance();
      case 2:
        return renderTechnicalInfrastructure();
      case 3:
        return renderDataGovernance();
      default:
        return 'Unknown step';
    }
  };

  if (checkingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Verifying hospital administrator credentials...</Typography>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Registration Submitted Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Thank you for registering your hospital with MedProof. Your registration is now under review.
            Our team will contact you within 3-5 business days regarding the status of your application.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            You will receive email updates at {formData.contactInfo.primaryEmail} throughout the review process.
          </Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Hospital Registration
      </Typography>
      
      <Paper sx={{ p: 3 }}>
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

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}