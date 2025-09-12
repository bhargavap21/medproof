import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Hospital {
  id: string;
  name: string;
  hospital_id: string;
  institution_type: string;
  contact_email?: string | null;
}

interface DataAccessRequest {
  hospital_id: string;
  organization_id: string;
  request_type: string;
  requested_permissions: string[];
  intended_use_case: string;
  data_retention_period: number;
  research_title?: string | null;
  research_description?: string | null;
  research_methodology?: string | null;
  expected_outcomes?: string | null;
  publication_plans?: string | null;
  irb_approval_number?: string | null;
  irb_approval_date?: Date | null;
  ethics_committee?: string | null;
  data_security_plan?: string | null;
  hipaa_compliance_confirmed: boolean;
  gdpr_compliance_confirmed: boolean;
}

const steps = [
  'Basic Information',
  'Research Details',
  'Compliance & Security',
  'Review & Submit'
];

const availablePermissions = [
  'patient_demographics',
  'medical_history',
  'lab_results',
  'imaging_data',
  'treatment_outcomes',
  'medication_records',
  'clinical_notes',
  'genomic_data'
];

const HospitalDataRequestForm: React.FC = () => {
  const { user, getUserOrganizations } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [formData, setFormData] = useState<DataAccessRequest>({
    hospital_id: '',
    organization_id: '',
    request_type: 'data_access',
    requested_permissions: [],
    intended_use_case: '',
    data_retention_period: 24,
    research_title: null,
    research_description: null,
    research_methodology: null,
    expected_outcomes: null,
    publication_plans: null,
    irb_approval_number: null,
    irb_approval_date: null,
    ethics_committee: null,
    data_security_plan: null,
    hipaa_compliance_confirmed: false,
    gdpr_compliance_confirmed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadHospitals();
    loadUserOrganizations();
  }, []);

  const loadHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, hospital_id, institution_type, contact_email')
        .order('name');
      
      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setError('Failed to load hospitals');
    }
  };

  const loadUserOrganizations = async () => {
    try {
      if (!user) return;
      const userOrgs = await getUserOrganizations();
      setOrganizations(userOrgs);
    } catch (error) {
      console.error('Error loading organizations:', error);
      setError('Failed to load your organizations');
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requested_permissions: checked 
        ? [...prev.requested_permissions, permission]
        : prev.requested_permissions.filter(p => p !== permission)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user || !selectedOrganization) {
        throw new Error('User not authenticated or organization not selected');
      }

      const requestData = {
        ...formData,
        organization_id: selectedOrganization,
        requested_by: user.id,
        status: 'documents_required' as const,
        irb_approval_date: formData.irb_approval_date ? formData.irb_approval_date.toISOString().split('T')[0] : null
      };

      const { data, error } = await supabase
        .from('hospital_data_access_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Data access request submitted successfully! The hospital will review your request.');
      console.log('Request submitted:', data);
      
      // Reset form
      setActiveStep(0);
      setFormData({
        hospital_id: '',
        organization_id: '',
        request_type: 'data_access',
        requested_permissions: [],
        intended_use_case: '',
        data_retention_period: 24,
        research_title: null,
        research_description: null,
        research_methodology: null,
        expected_outcomes: null,
        publication_plans: null,
        irb_approval_number: null,
        irb_approval_date: null,
        ethics_committee: null,
        data_security_plan: null,
        hipaa_compliance_confirmed: false,
        gdpr_compliance_confirmed: false,
      });
      
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setError(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Your Organization</InputLabel>
                <Select
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                  label="Your Organization"
                >
                  {organizations.map((orgMembership) => (
                    <MenuItem key={orgMembership.organization_id} value={orgMembership.organization_id}>
                      {orgMembership.research_organizations?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Hospital</InputLabel>
                <Select
                  value={formData.hospital_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, hospital_id: e.target.value }))}
                  label="Hospital"
                >
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name} ({hospital.hospital_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Intended Use Case"
                multiline
                rows={4}
                value={formData.intended_use_case}
                onChange={(e) => setFormData(prev => ({ ...prev, intended_use_case: e.target.value }))}
                helperText="Describe how you intend to use the hospital data"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Data Retention Period (months)</InputLabel>
                <Select
                  value={formData.data_retention_period}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_retention_period: Number(e.target.value) }))}
                  label="Data Retention Period (months)"
                >
                  <MenuItem value={12}>12 months</MenuItem>
                  <MenuItem value={24}>24 months</MenuItem>
                  <MenuItem value={36}>36 months</MenuItem>
                  <MenuItem value={60}>60 months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Title"
                value={formData.research_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, research_title: e.target.value || null }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Research Description"
                value={formData.research_description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, research_description: e.target.value || null }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Research Methodology"
                value={formData.research_methodology || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, research_methodology: e.target.value || null }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Expected Outcomes"
                value={formData.expected_outcomes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_outcomes: e.target.value || null }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Publication Plans"
                value={formData.publication_plans || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, publication_plans: e.target.value || null }))}
                helperText="Describe any plans for publishing research findings"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Requested Data Permissions
              </Typography>
              <FormGroup>
                {availablePermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={formData.requested_permissions.includes(permission)}
                        onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                      />
                    }
                    label={permission.replace('_', ' ').toUpperCase()}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="IRB Approval Number"
                value={formData.irb_approval_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, irb_approval_number: e.target.value || null }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="IRB Approval Date"
                value={formData.irb_approval_date ? formData.irb_approval_date.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, irb_approval_date: e.target.value ? new Date(e.target.value) : null }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ethics Committee"
                value={formData.ethics_committee || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ethics_committee: e.target.value || null }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Data Security Plan"
                value={formData.data_security_plan || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_security_plan: e.target.value || null }))}
                helperText="Describe how you will secure and protect the hospital data"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.hipaa_compliance_confirmed}
                    onChange={(e) => setFormData(prev => ({ ...prev, hipaa_compliance_confirmed: e.target.checked }))}
                  />
                }
                label="I confirm compliance with HIPAA regulations"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.gdpr_compliance_confirmed}
                    onChange={(e) => setFormData(prev => ({ ...prev, gdpr_compliance_confirmed: e.target.checked }))}
                  />
                }
                label="I confirm compliance with GDPR regulations"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Request Summary
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Organization:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {organizations.find(org => org.organization_id === selectedOrganization)?.research_organizations?.name}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Hospital:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {hospitals.find(h => h.id === formData.hospital_id)?.name}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Requested Permissions:</Typography>
                  <Box sx={{ mb: 2 }}>
                    {formData.requested_permissions.map((permission) => (
                      <Chip key={permission} label={permission} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Intended Use Case:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{formData.intended_use_case}</Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>Data Retention Period:</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{formData.data_retention_period} months</Typography>
                  
                  {formData.research_title && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>Research Title:</Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>{formData.research_title}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hospital Data Access Request
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Request access to hospital data for zero-knowledge proof generation
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !selectedOrganization || !formData.hospital_id}
                variant="contained"
              >
                Submit Request
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HospitalDataRequestForm;