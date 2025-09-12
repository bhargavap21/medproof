import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
} from '@mui/material';
import {
  VerifiedUser,
  Security,
  Assessment,
  Link as Blockchain,
  LocalHospital,
  Business,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useWeb3 } from '../hooks/useWeb3';
import { useAPI } from '../hooks/useAPI';
import { supabase } from '../lib/supabase';

interface Agreement {
  id: string;
  hospital_id: string | null;
  organization_id: string | null;
  permissions?: string[] | null;
  data_scope?: string[] | null;
  status: string | null;
  effective_date: string | null;
  expiration_date: string | null;
  hospitals?: {
    name: string;
    hospital_id: string;
  } | null;
  research_organizations?: {
    name: string;
    org_id: string;
  } | null;
}

interface ProofRequest {
  agreementId: string;
  studyTitle: string;
  queryType: string;
  parameters: Record<string, any>;
  privacyLevel: 'high' | 'medium' | 'low';
}

const steps = [
  'Select Data Access Agreement',
  'Configure Proof Parameters',
  'Generate ZK Proof',
  'Submit to Blockchain'
];

const ZKProofGenerator: React.FC = () => {
  const { user, getUserOrganizations } = useAuth();
  const { isConnected, submitProof, connectWallet } = useWeb3();
  const { generateProof } = useAPI();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedProof, setGeneratedProof] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  
  const [proofRequest, setProofRequest] = useState<ProofRequest>({
    agreementId: '',
    studyTitle: '',
    queryType: 'cohort_analysis',
    parameters: {
      condition: '',
      ageRange: { min: 18, max: 80 },
      gender: 'all',
      timeframe: '12_months'
    },
    privacyLevel: 'high'
  });

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAgreementDetails, setSelectedAgreementDetails] = useState<Agreement | null>(null);

  useEffect(() => {
    loadUserAgreements();
  }, [user]);

  const loadUserAgreements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user's organizations
      const userOrgs = await getUserOrganizations();
      const orgIds = userOrgs.map(org => org.organization_id);

      if (orgIds.length === 0) {
        setError('You are not a member of any organizations. Please join an organization to access hospital data.');
        return;
      }

      // Get active agreements for user's organizations
      const { data, error } = await supabase
        .from('hospital_organization_agreements')
        .select(`
          *,
          hospitals!inner(
            name,
            hospital_id
          ),
          research_organizations!inner(
            name,
            org_id
          )
        `)
        .in('organization_id', orgIds)
        .eq('status', 'approved')
        .eq('is_active', true)
        .gte('expiration_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      console.log('Loaded agreements:', data);
      // @ts-ignore - Database schema mismatch with interface types
      setAgreements(data || []);
      
      if ((data || []).length === 0) {
        setError('No active data access agreements found. Please request access to hospital data first.');
      }
    } catch (error: any) {
      console.error('Error loading agreements:', error);
      setError(error.message || 'Failed to load data access agreements');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgreementDetails = (agreement: Agreement) => {
    setSelectedAgreementDetails(agreement);
    setDetailsDialogOpen(true);
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedAgreement) {
      setError('Please select a data access agreement to continue');
      return;
    }
    setActiveStep(prev => prev + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleGenerateProof = async () => {
    if (!selectedAgreement) return;

    try {
      setLoading(true);
      setError(null);

      const agreement = agreements.find(a => a.id === selectedAgreement);
      if (!agreement) throw new Error('Agreement not found');

      // Check if user has required permissions for the query type
      const requiredPermissions = getRequiredPermissions(proofRequest.queryType);
      const availablePermissions = agreement.data_scope || agreement.permissions || [];
      const hasPermissions = requiredPermissions.every(perm => 
        availablePermissions.includes(perm)
      );

      if (!hasPermissions) {
        throw new Error('Insufficient permissions for this type of query');
      }

      console.log('Generating ZK proof with parameters:', proofRequest);
      
      // Generate the ZK proof using the API
      const studyData = {
        studyType: proofRequest.queryType,
        parameters: proofRequest.parameters,
        organizationId: agreement.organization_id || '',
        userId: user?.id
      };
      const proofData = await generateProof(studyData, agreement.hospital_id || '');

      setGeneratedProof(proofData);
      setSuccess('ZK proof generated successfully!');
      handleNext();
    } catch (error: any) {
      console.error('Error generating proof:', error);
      setError(error.message || 'Failed to generate ZK proof');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToBlockchain = async () => {
    if (!generatedProof || !selectedAgreement) return;

    try {
      setLoading(true);
      setError(null);

      const agreement = agreements.find(a => a.id === selectedAgreement);
      if (!agreement) throw new Error('Agreement not found');

      const submissionData = {
        proofHash: generatedProof.proofHash,
        studyType: proofRequest.queryType,
        condition: proofRequest.parameters.condition,
        sampleSize: generatedProof.sampleSize || 0,
        effectiveness: generatedProof.effectiveness || 0,
        zkProof: generatedProof
      };

      const result = await submitProof(submissionData);
      
      // Store submission result in database (using hospital_data_access_requests for now)
      console.log('ZK Proof submitted to blockchain:', {
        user_id: user?.id,
        organization_id: agreement.organization_id,
        hospital_id: agreement.hospital_id,
        agreement_id: agreement.id,
        proof_hash: generatedProof.proofHash,
        study_title: proofRequest.studyTitle,
        query_type: proofRequest.queryType,
        parameters: proofRequest.parameters,
        transaction_hash: result.transactionHash,
        block_number: result.blockNumber,
        status: 'submitted',
        privacy_level: proofRequest.privacyLevel
      });

      setSubmissionResult(result);
      setSuccess(`Proof submitted to blockchain! Transaction hash: ${result.transactionHash}`);
      handleNext();
    } catch (error: any) {
      console.error('Error submitting to blockchain:', error);
      setError(error.message || 'Failed to submit proof to blockchain');
    } finally {
      setLoading(false);
    }
  };

  const getRequiredPermissions = (queryType: string): string[] => {
    switch (queryType) {
      case 'cohort_analysis':
        return ['patient_demographics', 'medical_history'];
      case 'treatment_outcomes':
        return ['treatment_outcomes', 'medical_history'];
      case 'lab_analysis':
        return ['lab_results'];
      case 'imaging_study':
        return ['imaging_data'];
      case 'medication_adherence':
        return ['medication_records'];
      default:
        return ['patient_demographics'];
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Data Access Agreement
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose an active data access agreement to generate ZK proofs from
              </Typography>
            </Grid>
            
            {agreements.map((agreement) => (
              <Grid item xs={12} key={agreement.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedAgreement === agreement.id ? 2 : 1,
                    borderColor: selectedAgreement === agreement.id ? 'primary.main' : 'divider'
                  }}
                  onClick={() => setSelectedAgreement(agreement.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <LocalHospital />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {agreement.hospitals?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Agreement with {agreement.research_organizations?.name}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAgreementDetails(agreement);
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={agreement.status} color="success" size="small" />
                      <Chip 
                        label={`${(agreement.data_scope || agreement.permissions || []).length} permissions`} 
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2">
                      <strong>Valid until:</strong> {agreement.expiration_date ? new Date(agreement.expiration_date).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Configure Proof Parameters
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Study Title"
                value={proofRequest.studyTitle}
                onChange={(e) => setProofRequest(prev => ({ ...prev, studyTitle: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Query Type</InputLabel>
                <Select
                  value={proofRequest.queryType}
                  onChange={(e) => setProofRequest(prev => ({ ...prev, queryType: e.target.value }))}
                  label="Query Type"
                >
                  <MenuItem value="cohort_analysis">Cohort Analysis</MenuItem>
                  <MenuItem value="treatment_outcomes">Treatment Outcomes</MenuItem>
                  <MenuItem value="lab_analysis">Lab Analysis</MenuItem>
                  <MenuItem value="imaging_study">Imaging Study</MenuItem>
                  <MenuItem value="medication_adherence">Medication Adherence</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Privacy Level</InputLabel>
                <Select
                  value={proofRequest.privacyLevel}
                  onChange={(e) => setProofRequest(prev => ({ ...prev, privacyLevel: e.target.value as any }))}
                  label="Privacy Level"
                >
                  <MenuItem value="high">High (Maximum Privacy)</MenuItem>
                  <MenuItem value="medium">Medium (Balanced)</MenuItem>
                  <MenuItem value="low">Low (More Detail)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Condition"
                value={proofRequest.parameters.condition}
                onChange={(e) => setProofRequest(prev => ({ 
                  ...prev, 
                  parameters: { ...prev.parameters, condition: e.target.value }
                }))}
                placeholder="e.g., diabetes, hypertension, heart disease"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Min Age"
                value={proofRequest.parameters.ageRange.min}
                onChange={(e) => setProofRequest(prev => ({ 
                  ...prev, 
                  parameters: { 
                    ...prev.parameters, 
                    ageRange: { ...prev.parameters.ageRange, min: parseInt(e.target.value) }
                  }
                }))}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Age"
                value={proofRequest.parameters.ageRange.max}
                onChange={(e) => setProofRequest(prev => ({ 
                  ...prev, 
                  parameters: { 
                    ...prev.parameters, 
                    ageRange: { ...prev.parameters.ageRange, max: parseInt(e.target.value) }
                  }
                }))}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Generate ZK Proof
              </Typography>
              {!generatedProof ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Click "Generate Proof" to create a zero-knowledge proof for your study parameters.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ZK proof generated successfully! You can now submit it to the blockchain.
                </Alert>
              )}
            </Grid>
            
            {generatedProof && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Proof Details</Typography>
                    <Typography variant="body2"><strong>Proof Hash:</strong> {generatedProof.proofHash}</Typography>
                    <Typography variant="body2"><strong>Sample Size:</strong> {generatedProof.sampleSize}</Typography>
                    <Typography variant="body2"><strong>Effectiveness:</strong> {generatedProof.effectiveness}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Submit to Blockchain
              </Typography>
              {!isConnected ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Connect your wallet to submit the proof to the blockchain.
                </Alert>
              ) : !submissionResult ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Submit your ZK proof to the blockchain for permanent verification.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Proof successfully submitted to blockchain!
                </Alert>
              )}
            </Grid>
            
            {submissionResult && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <CheckCircle color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Submission Successful
                    </Typography>
                    <Typography variant="body2"><strong>Transaction Hash:</strong> {submissionResult.transactionHash}</Typography>
                    <Typography variant="body2"><strong>Block Number:</strong> {submissionResult.blockNumber}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  if (loading && agreements.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Loading...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <VerifiedUser sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            ZK Proof Generator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate zero-knowledge proofs from authorized hospital data access
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {agreements.length === 0 && !loading ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <ErrorIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Active Data Access Agreements
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need approved hospital data access agreements to generate ZK proofs.
            </Typography>
            <Button variant="contained" onClick={() => window.location.href = '/hospital-data-request'}>
              Request Hospital Data Access
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              
              {activeStep === 2 && !generatedProof && (
                <Button 
                  variant="contained"
                  onClick={handleGenerateProof}
                  disabled={loading}
                  startIcon={<Security />}
                >
                  Generate Proof
                </Button>
              )}
              
              {activeStep === 3 && !isConnected && (
                <Button 
                  variant="contained"
                  onClick={connectWallet}
                  disabled={loading}
                  startIcon={<Blockchain />}
                >
                  Connect Wallet
                </Button>
              )}
              
              {activeStep === 3 && isConnected && !submissionResult && (
                <Button 
                  variant="contained"
                  onClick={handleSubmitToBlockchain}
                  disabled={loading || !generatedProof}
                  startIcon={<Blockchain />}
                >
                  Submit to Blockchain
                </Button>
              )}
              
              {activeStep < 2 && (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              )}
              
              {submissionResult && (
                <Button variant="outlined" disabled>
                  Process Complete
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Agreement Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Agreement Details</DialogTitle>
        <DialogContent>
          {selectedAgreementDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Hospital</Typography>
                <Typography variant="body2">{selectedAgreementDetails.hospitals?.name}</Typography>
                <Typography variant="body2">ID: {selectedAgreementDetails.hospitals?.hospital_id}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Organization</Typography>
                <Typography variant="body2">{selectedAgreementDetails.research_organizations?.name}</Typography>
                <Typography variant="body2">ID: {selectedAgreementDetails.research_organizations?.org_id}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Permissions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(selectedAgreementDetails.data_scope || selectedAgreementDetails.permissions || []).map((permission) => (
                    <Chip key={permission} label={permission} size="small" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Effective Date:</strong> {selectedAgreementDetails.effective_date ? new Date(selectedAgreementDetails.effective_date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2">
                  <strong>Expiration Date:</strong> {selectedAgreementDetails.expiration_date ? new Date(selectedAgreementDetails.expiration_date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ZKProofGenerator;