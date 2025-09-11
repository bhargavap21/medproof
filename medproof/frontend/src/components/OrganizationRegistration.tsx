import React, { useState } from 'react';
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
  Divider,
  Paper,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Business,
  Email,
  Upload,
  CheckCircle,
  Warning,
  Delete,
  CloudUpload,
  School,
  Science,
  Biotech,
  AccountBalance,
  Apartment,
} from '@mui/icons-material';

const organizationTypes = [
  { value: 'university', label: 'University', icon: <School /> },
  { value: 'research_institute', label: 'Research Institute', icon: <Science /> },
  { value: 'biotech_company', label: 'Biotech Company', icon: <Biotech /> },
  { value: 'pharmaceutical', label: 'Pharmaceutical', icon: <Biotech /> },
  { value: 'government_agency', label: 'Government Agency', icon: <AccountBalance /> },
  { value: 'ngo', label: 'NGO', icon: <Apartment /> },
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
  organizationType: string;
  description: string;
  website: string;
  contactEmail: string;
  primaryContactName: string;
  primaryContactTitle: string;
  taxId: string;
  registrationNumber: string;
  researchAreas: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface UploadedDocument {
  id: string;
  type: string;
  name: string;
  file: File;
  status: 'uploaded' | 'error';
}

const OrganizationRegistration: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    organizationType: '',
    description: '',
    website: '',
    contactEmail: '',
    primaryContactName: '',
    primaryContactTitle: '',
    taxId: '',
    registrationNumber: '',
    researchAreas: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [researchAreaInput, setResearchAreaInput] = useState('');

  const steps = [
    'Organization Information',
    'Contact & Legal Details', 
    'Document Upload',
    'Review & Submit'
  ];

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
        researchAreas: [...prev.researchAreas, researchAreaInput.trim()]
      }));
      setResearchAreaInput('');
    }
  };

  const removeResearchArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      researchAreas: prev.researchAreas.filter((_, i) => i !== index)
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

  const getRequiredDocuments = () => {
    if (!formData.organizationType) return [];
    return requiredDocumentsByType[formData.organizationType as keyof typeof requiredDocumentsByType] || [];
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.name && formData.organizationType && formData.description && formData.website;
      case 1:
        return formData.contactEmail && formData.primaryContactName && 
               formData.address.city && formData.address.country;
      case 2:
        const requiredDocs = getRequiredDocuments().filter(doc => doc.required);
        const uploadedTypes = uploadedDocuments.map(doc => doc.type);
        return requiredDocs.every(doc => uploadedTypes.includes(doc.type));
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
    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create organization record
    console.log('Submitting organization:', formData);
    console.log('Documents:', uploadedDocuments);
    
    setSubmitting(false);
    // Navigate to success page or dashboard
  };

  const getOrganizationIcon = (type: string) => {
    const orgType = organizationTypes.find(t => t.value === type);
    return orgType?.icon || <Business />;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Register Your Organization
      </Typography>
      
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
                      value={formData.organizationType}
                      onChange={(e) => handleInputChange('organizationType', e.target.value)}
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
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      required
                      placeholder="research@your-organization.edu"
                      helperText="Must use your institution's email domain"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Primary Contact Name"
                      value={formData.primaryContactName}
                      onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                      required
                      placeholder="Dr. Jane Smith"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Primary Contact Title"
                      value={formData.primaryContactTitle}
                      onChange={(e) => handleInputChange('primaryContactTitle', e.target.value)}
                      placeholder="Director of Research"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tax ID / EIN"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
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
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
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
                        onKeyPress={(e) => e.key === 'Enter' && handleAddResearchArea()}
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
                      {formData.researchAreas.map((area, index) => (
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
                  Required Documents for {organizationTypes.find(t => t.value === formData.organizationType)?.label}
                </Typography>
                
                <List>
                  {getRequiredDocuments().map((doc, index) => {
                    const isUploaded = uploadedDocuments.some(uploaded => uploaded.type === doc.type);
                    return (
                      <ListItem key={index} sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                        <ListItemIcon>
                          {isUploaded ? (
                            <CheckCircle color="success" />
                          ) : doc.required ? (
                            <Warning color="warning" />
                          ) : (
                            <Upload />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={doc.name}
                          secondary={doc.required ? 'Required' : 'Optional'}
                        />
                        <input
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          id={`upload-${doc.type}`}
                          type="file"
                          onChange={(e) => handleFileUpload(e, doc.type)}
                        />
                        <label htmlFor={`upload-${doc.type}`}>
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
                      {getOrganizationIcon(formData.organizationType)}
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
                          {organizationTypes.find(t => t.value === formData.organizationType)?.label}
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
                        <Typography variant="body1">{formData.contactEmail}</Typography>
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