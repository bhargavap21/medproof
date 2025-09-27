import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MenuItem,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Business,
  Upload,
  CheckCircle,
  Warning,
  Delete,
  CloudUpload,
  School,
  Science,
  Biotech,
  AccountBalance,
  LocalHospital,
  VolunteerActivism,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type OrganizationType = Database['public']['Enums']['organization_type'];
type DocumentType = Database['public']['Enums']['document_type'];

const organizationTypes = [
  { value: 'university' as OrganizationType, label: 'University', icon: <School /> },
  { value: 'research_institute' as OrganizationType, label: 'Research Institute', icon: <Science /> },
  { value: 'biotech_company' as OrganizationType, label: 'Biotech Company', icon: <Biotech /> },
  { value: 'pharmaceutical' as OrganizationType, label: 'Pharmaceutical', icon: <LocalHospital /> },
  { value: 'government_agency' as OrganizationType, label: 'Government Agency', icon: <AccountBalance /> },
  { value: 'ngo' as OrganizationType, label: 'NGO', icon: <VolunteerActivism /> },
];

const requiredDocumentsByType = {
  university: [
    { type: 'institutional_registration', name: 'Official university registration/charter', required: true },
    { type: 'irb_ethics_approval', name: 'Institutional Review Board approval', required: true },
    { type: 'accreditation_certificate', name: 'University accreditation certificate', required: true },
    { type: 'principal_investigator_cv', name: 'Primary research contact CV', required: true },
  ],
  research_institute: [
    { type: 'institutional_registration', name: 'Legal entity registration documents', required: true },
    { type: 'irb_ethics_approval', name: 'Ethics committee approval', required: true },
    { type: 'research_license', name: 'License to conduct research', required: true },
    { type: 'insurance_certificate', name: 'Professional liability insurance', required: true },
    { type: 'financial_audit', name: 'Recent financial audit', required: false },
  ],
  biotech_company: [
    { type: 'institutional_registration', name: 'Corporate registration documents', required: true },
    { type: 'research_license', name: 'License to conduct research', required: true },
    { type: 'insurance_certificate', name: 'Professional liability insurance', required: true },
    { type: 'data_security_certificate', name: 'Data security compliance certificate', required: true },
    { type: 'financial_audit', name: 'Recent financial audit', required: true },
  ],
  pharmaceutical: [
    { type: 'institutional_registration', name: 'Corporate registration documents', required: true },
    { type: 'research_license', name: 'Pharmaceutical research license', required: true },
    { type: 'insurance_certificate', name: 'Professional liability insurance', required: true },
    { type: 'data_security_certificate', name: 'Data security compliance certificate', required: true },
    { type: 'financial_audit', name: 'Recent financial audit', required: true },
  ],
  government_agency: [
    { type: 'institutional_registration', name: 'Government agency authorization', required: true },
    { type: 'research_license', name: 'Special research authorizations if applicable', required: false },
  ],
  ngo: [
    { type: 'institutional_registration', name: 'NGO registration documents', required: true },
    { type: 'tax_exempt_certificate', name: 'Tax-exempt status certificate', required: true },
    { type: 'irb_ethics_approval', name: 'Ethics approval from recognized board', required: true },
    { type: 'insurance_certificate', name: 'Professional liability insurance', required: true },
  ],
};

interface OrganizationFormData {
  name: string;
  org_id: string;
  organization_type: OrganizationType;
  description: string;
  website: string;
  contact_email: string;
  primary_contact_name: string;
  primary_contact_title: string;
  tax_id: string;
  registration_number: string;
  research_areas: string[];
  ethics_board_approval: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface RequiredDocument {
  document_type: DocumentType;
  description: string;
  is_required: boolean;
}

interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  file: File;
  status: 'uploaded' | 'error';
}

const OrganizationRegistration: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    org_id: '',
    organization_type: 'university',
    description: '',
    website: '',
    contact_email: user?.email || '',
    primary_contact_name: '',
    primary_contact_title: '',
    tax_id: '',
    registration_number: '',
    research_areas: [],
    ethics_board_approval: false,
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [researchAreaInput, setResearchAreaInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = [
    'Organization Information',
    'Contact & Legal Details', 
    'Document Upload',
    'Review & Submit'
  ];

  // Fetch required documents when organization type changes
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      try {
        const { data, error } = await supabase.rpc('get_required_documents', {
          org_type: formData.organization_type
        });

        if (error) throw error;
        setRequiredDocuments(data || []);
      } catch (err) {
        console.error('Error fetching required documents:', err);
        // Fallback to hardcoded documents if function doesn't exist
        const docs = requiredDocumentsByType[formData.organization_type]?.map(doc => ({
          document_type: doc.type as DocumentType,
          description: doc.name,
          is_required: doc.required
        })) || [];
        setRequiredDocuments(docs);
      }
    };

    if (formData.organization_type) {
      fetchRequiredDocuments();
    }
  }, [formData.organization_type]);

  // Generate org_id from name
  useEffect(() => {
    if (formData.name) {
      const orgId = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      setFormData(prev => ({ ...prev, org_id: orgId }));
    }
  }, [formData.name]);

  const handleInputChange = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: keyof OrganizationFormData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleAddResearchArea = () => {
    if (researchAreaInput.trim()) {
      setFormData(prev => ({
        ...prev,
        research_areas: [...prev.research_areas, researchAreaInput.trim()]
      }));
      setResearchAreaInput('');
    }
  };

  const removeResearchArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      research_areas: prev.research_areas.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const newDoc: UploadedDocument = {
        id: Date.now().toString(),
        type: docType,
        name: file.name,
        file: file,
        status: 'uploaded'
      };
      setUploadedDocuments(prev => [...prev, newDoc]);
    }
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name && formData.organization_type && formData.description && formData.website;
      case 1:
        return formData.contact_email && formData.primary_contact_name && 
               formData.address.city && formData.address.country;
      case 2:
        const requiredDocs = requiredDocuments.filter(doc => doc.is_required);
        const uploadedTypes = uploadedDocuments.map(doc => doc.type);
        return requiredDocs.every(doc => uploadedTypes.includes(doc.document_type));
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to register an organization.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('🏢 Submitting organization:', formData.name);
      
      // Create organization with auto-approval
      const { data: orgData, error: orgError } = await supabase
        .from('research_organizations')
        .insert({
          name: formData.name,
          org_id: formData.org_id,
          organization_type: formData.organization_type,
          description: formData.description,
          website: formData.website,
          contact_email: formData.contact_email,
          address: formData.address,
          tax_id: formData.tax_id,
          registration_number: formData.registration_number,
          primary_contact_name: formData.primary_contact_name,
          primary_contact_title: formData.primary_contact_title,
          research_areas: formData.research_areas,
          ethics_board_approval: formData.ethics_board_approval,
          verification_status: 'verified', // Auto-approve for now
          verification_level: 'premium',
        })
        .select()
        .single();

      if (orgError) {
        console.error('🏢 Organization creation error:', orgError);
        throw orgError;
      }

      console.log('🏢 Organization created:', orgData);

      // Create organization membership for the user
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          role: 'admin',
          permissions: ['view_data', 'submit_studies', 'manage_members', 'manage_documents'],
          is_active: true,
        });

      if (membershipError) {
        console.error('🏢 Membership creation error:', membershipError);
        throw membershipError;
      }

      console.log('🏢 Membership created successfully');

      // Success! Organization is auto-approved
      console.log('🏢 Organization registration complete - auto-approved!');
      
      // Show success message and redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Organization registration error:', err);
      setError(err.message || 'Failed to register organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getOrganizationIcon = (type: string) => {
    const orgType = organizationTypes.find(t => t.value === type);
    return orgType?.icon || <Business />;
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Organization Registered Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your organization has been automatically approved and is now ready to use. 
              You will be redirected to the dashboard shortly.
            </Typography>
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>✅ Your organization is now active!</strong>
                <br />
                You can now access all organization features including:
                <br />
                • Manage organization members
                <br />
                • Submit research studies
                <br />
                • Access hospital data (with permissions)
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Register Your Organization
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Organization Information */}
          <Step>
            <StepLabel>Organization Information</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Organization Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="e.g., Stanford University School of Medicine"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Organization Type"
                      value={formData.organization_type}
                      onChange={(e) => handleInputChange('organization_type', e.target.value)}
                      required
                    >
                      {organizationTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {type.icon}
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      required
                      placeholder="https://your-organization.edu"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      placeholder="Brief description of your organization and research focus"
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(0)}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Contact & Legal Details */}
          <Step>
            <StepLabel>Contact & Legal Details</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      required
                      placeholder="research@your-organization.edu"
                      helperText="Must use your institution's email domain"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Primary Contact Name"
                      value={formData.primary_contact_name}
                      onChange={(e) => handleInputChange('primary_contact_name', e.target.value)}
                      required
                      placeholder="Dr. Jane Smith"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Primary Contact Title"
                      value={formData.primary_contact_title}
                      onChange={(e) => handleInputChange('primary_contact_title', e.target.value)}
                      placeholder="Director of Research"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tax ID / EIN"
                      value={formData.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      placeholder="XX-XXXXXXX"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Address Information</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ZIP/Postal Code"
                      value={formData.address.postal_code}
                      onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Research Areas</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add Research Area"
                        value={researchAreaInput}
                        onChange={(e) => setResearchAreaInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddResearchArea()}
                        placeholder="e.g., cardiology, oncology, AI in medicine"
                      />
                      <Button 
                        variant="outlined" 
                        onClick={handleAddResearchArea}
                        disabled={!researchAreaInput.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {formData.research_areas.map((area: string, index: number) => (
                        <Chip
                          key={index}
                          label={area}
                          onDelete={() => removeResearchArea(index)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(1)}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Document Upload */}
          <Step>
            <StepLabel>Document Upload</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please upload the required documents for verification. All documents should be in PDF format and clearly legible.
                </Alert>
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Required Documents for {organizationTypes.find(t => t.value === formData.organization_type)?.label}
                </Typography>
                
                <List>
                  {requiredDocuments.map((doc, index) => {
                    const isUploaded = uploadedDocuments.some(uploaded => uploaded.type === doc.document_type);
                    return (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                        <ListItemIcon>
                          {isUploaded ? (
                            <CheckCircle color="success" />
                          ) : doc.is_required ? (
                            <Warning color="warning" />
                          ) : (
                            <Upload />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.description}
                          secondary={doc.is_required ? 'Required' : 'Optional'}
                        />
                        <input
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          id={`upload-${doc.document_type}`}
                          type="file"
                          onChange={(e) => handleFileUpload(e, doc.document_type)}
                        />
                        <label htmlFor={`upload-${doc.document_type}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            disabled={isUploaded}
                          >
                            {isUploaded ? 'Uploaded' : 'Upload'}
                          </Button>
                        </label>
                      </ListItem>
                    );
                  })}
                </List>
                
                {uploadedDocuments.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Uploaded Documents</Typography>
                    <List>
                      {uploadedDocuments.map((doc) => (
                        <ListItem key={doc.id} sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                          <ListItemIcon>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={doc.name}
                            secondary={`Type: ${doc.type.replace('_', ' ')}`}
                          />
                          <IconButton 
                            edge="end" 
                            onClick={() => removeDocument(doc.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(2)}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Review & Submit */}
          <Step>
            <StepLabel>Review & Submit</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please review your information before submitting. Once submitted, your organization will enter the verification process.
                </Alert>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getOrganizationIcon(formData.organization_type)}
                      Organization Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Name</Typography>
                        <Typography variant="body1">{formData.name}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Type</Typography>
                        <Typography variant="body1">
                          {organizationTypes.find(t => t.value === formData.organization_type)?.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Description</Typography>
                        <Typography variant="body1">{formData.description}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Website</Typography>
                        <Typography variant="body1">{formData.website}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="text.secondary">Contact Email</Typography>
                        <Typography variant="body1">{formData.contact_email}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Documents ({uploadedDocuments.length} uploaded)
                    </Typography>
                    
                    {uploadedDocuments.map((doc) => (
                      <Chip
                        key={doc.id}
                        icon={<CheckCircle />}
                        label={doc.name}
                        color="success"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </CardContent>
                </Card>
                
                {submitting && (
                  <Box sx={{ mb: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Submitting your organization for verification...
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleBack} disabled={submitting}>Back</Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="large"
                >
                  {submitting ? 'Submitting...' : 'Submit Organization'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </Box>
  );
};

export default OrganizationRegistration;