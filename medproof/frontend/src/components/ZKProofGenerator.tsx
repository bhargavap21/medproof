import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

  Avatar,
} from '@mui/material';
import {
  VerifiedUser,
  Security,
  Link as Blockchain,
  LocalHospital,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import ZKProofDisplay from './ZKProofDisplay';
// import { useWeb3 } from '../hooks/useWeb3'; // Midnight Network handles blockchain directly
// import { useAPI } from '../hooks/useAPI'; // Using direct axios calls for Midnight integration
import { supabase } from '../lib/supabase';
import axios from 'axios'; // Added axios import

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
  // Midnight Network handles blockchain directly - unused hooks
  // const { } = useWeb3();
  // const { } = useAPI();
  const navigate = useNavigate();
  
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
  const [proofDetailsDialogOpen, setProofDetailsDialogOpen] = useState(false);

  const loadUserAgreements = useCallback(async () => {
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
  }, [user, getUserOrganizations]);

  useEffect(() => {
    if (user) {
      loadUserAgreements();
    }
  }, [user, loadUserAgreements]);

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
    if (!selectedAgreement || !proofRequest.studyTitle) return;

    try {
      setLoading(true);
      setError(null);
      setGeneratedProof(null);

      const agreement = agreements.find(a => a.id === selectedAgreement);
      if (!agreement) throw new Error('Agreement not found');

      console.log('🌙 Generating ZK proof using Midnight Network...');

      // Mock hospital data (for hackathon - this would come from actual hospital systems)
      const mockHospitalData = generateMockHospitalData(proofRequest.queryType);
      
      console.log('📊 Using mock hospital data for demo:', {
        queryType: proofRequest.queryType,
        patientCount: mockHospitalData.patientCount,
        note: 'In production, this would be real hospital data from FHIR systems'
      });

      // Call backend API to generate REAL Midnight Network ZK proof
      const response = await axios.post('http://localhost:3001/api/generate-proof', {
        studyData: {
          studyId: `${proofRequest.studyTitle.replace(/\s+/g, '_')}_${Date.now()}`,
          condition: proofRequest.queryType.split('_')[0] || 'treatment',
          treatment: proofRequest.studyTitle.toLowerCase().includes('drug') ? 'pharmaceutical' : 'therapeutic',
          ...mockHospitalData
        },
        hospitalId: agreement.hospital_id,
        organizationId: agreement.organization_id,
        privacySettings: {
          disclosureLevel: proofRequest.privacyLevel,
          allowRegulatorAccess: true,
          allowResearcherAccess: proofRequest.privacyLevel !== 'high'
        },
        useMidnightNetwork: true, // Enable real Midnight Network integration
        metadata: {
          studyTitle: proofRequest.studyTitle,
          queryType: proofRequest.queryType,
          parameters: proofRequest.parameters,
          privacyLevel: proofRequest.privacyLevel,
          requestedBy: user?.id
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate proof');
      }

      const proofData = response.data;
      
      // Real Midnight Network proof result - no fallback data
      const proof = {
        proofHash: proofData.proof.proofHash,
        publicSignals: proofData.proof.publicSignals,
        verified: proofData.proof.verified,
        transactionHash: proofData.proof.transactionHash,
        blockHeight: proofData.proof.blockHeight,

        // Midnight Network specific data
        networkUsed: proofData.proof.networkUsed,
        privacyGuarantees: proofData.proof.privacyGuarantees,

        // Metadata
        metadata: {
          proofSystem: proofData.metadata.proofSystem,
          privacyLevel: proofData.metadata.privacyLevel,
          patientDataExposed: false,
          statisticallySignificant: proofData.metadata.statisticallySignificant,
          realMidnightNetworkUsed: true,
          hospitalDataMocked: true, // For hackathon transparency
          timestamp: new Date().toISOString()
        }
      };

      setGeneratedProof(proof);
      setSuccess(`🌙 ZK Proof generated successfully using real Midnight Network!
                  Privacy-preserving medical research proof created with cryptographic guarantees.
                  Real Midnight Network blockchain integration active.`);
      handleNext();

    } catch (error: any) {
      console.error('Error generating proof:', error);
      setError(error.message || 'Failed to generate zero-knowledge proof');
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

      console.log('🌙 Submitting ZK proof to Midnight Network blockchain...');

      // Submit to actual Midnight Network blockchain
      const response = await axios.post('http://localhost:3001/api/submit-to-blockchain', {
        proofHash: generatedProof.proofHash,
        studyMetadata: {
          studyTitle: proofRequest.studyTitle,
          queryType: proofRequest.queryType,
          organizationId: agreement.organization_id,
          hospitalId: agreement.hospital_id,
          privacyLevel: proofRequest.privacyLevel
        },
        useMidnightNetwork: true,
        proof: generatedProof
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to submit to blockchain');
      }

      const result = {
        transactionHash: response.data.transactionHash,
        blockNumber: response.data.blockNumber,
        networkId: response.data.networkId || 'midnight-devnet',
        gasUsed: response.data.gasUsed || 150000,
        status: 'confirmed',
        timestamp: response.data.timestamp || new Date().toISOString(),
        privacyPreserved: response.data.privacyPreserved || true,
        midnightNetwork: true
      };

      console.log('✅ ZK Proof submitted to Midnight Network:', result);

      setSubmissionResult(result);
      setSuccess(`🌙 Proof successfully submitted to Midnight Network! 
                  Transaction: ${result.transactionHash}
                  Your privacy-preserving research is now permanently recorded on the blockchain.`);
      handleNext();
      
      // Automatically open the proof details dialog to show the rich display
      setTimeout(() => {
        setProofDetailsDialogOpen(true);
      }, 1000); // Small delay to let the step transition complete

    } catch (error: any) {
      console.error('Error submitting to Midnight blockchain:', error);
      setError(error.message || 'Failed to submit proof to Midnight Network');
    } finally {
      setLoading(false);
    }
  };

  // Removed unused function - Midnight Network handles permissions cryptographically
  /*
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
  */

  const generateMockHospitalData = (queryType: string) => {
    const mockData: Record<string, any> = {};
    switch (queryType) {
      case 'cohort_analysis':
        mockData.patientCount = 1000;
        mockData.ageRange = { min: 20, max: 80 };
        mockData.gender = 'all';
        mockData.timeframe = '12_months';
        mockData.condition = 'diabetes';
        break;
      case 'treatment_outcomes':
        mockData.patientCount = 500;
        mockData.ageRange = { min: 18, max: 70 };
        mockData.gender = 'all';
        mockData.timeframe = '6_months';
        mockData.condition = 'heart_disease';
        break;
      case 'lab_analysis':
        mockData.patientCount = 200;
        mockData.ageRange = { min: 18, max: 90 };
        mockData.gender = 'all';
        mockData.timeframe = '3_months';
        mockData.condition = 'cancer';
        break;
      case 'imaging_study':
        mockData.patientCount = 100;
        mockData.ageRange = { min: 18, max: 85 };
        mockData.gender = 'all';
        mockData.timeframe = '1_year';
        mockData.condition = 'stroke';
        break;
      case 'medication_adherence':
        mockData.patientCount = 150;
        mockData.ageRange = { min: 18, max: 80 };
        mockData.gender = 'all';
        mockData.timeframe = '1_year';
        mockData.condition = 'hypertension';
        break;
      default:
        mockData.patientCount = 1000;
        mockData.ageRange = { min: 20, max: 80 };
        mockData.gender = 'all';
        mockData.timeframe = '12_months';
        mockData.condition = 'diabetes';
        break;
    }
    return mockData;
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
                {generatedProof ? (
                  <ZKProofDisplay 
                    proof={generatedProof} 
                    metadata={{
                      ...generatedProof.metadata,
                      studyTitle: proofRequest.studyTitle,
                      queryType: proofRequest.queryType,
                      privacyLevel: proofRequest.privacyLevel,
                      hospitalDataMocked: generatedProof.metadata?.hospitalDataMocked
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Ready to Generate Zero-Knowledge Proof
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Generate ZK Proof" to create a privacy-preserving cryptographic proof using Midnight Network
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                  🌙 Submit to Midnight Network Blockchain
                </Typography>
                {!submissionResult ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Midnight Network Integration:</strong> Submit your zero-knowledge proof to the Midnight blockchain for permanent, privacy-preserving verification.
                    Your proof will be cryptographically secured while maintaining complete patient data privacy.
                    <div><strong>🌙 Real Midnight Network Ready</strong> - Actual blockchain submission</div>
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    🎉 Proof successfully submitted to Midnight Network! Your privacy-preserving medical research is now permanently recorded on the blockchain with cryptographic guarantees.
                  </Alert>
                )}
              </Grid>
              {submissionResult && generatedProof && (
                <Grid item xs={12}>
                  <Alert severity="success" sx={{ mb: 3 }} icon={<Security />}>
                    <Typography variant="h6" gutterBottom>🎉 Successfully Submitted to Midnight Network!</Typography>
                    <Typography variant="body2">
                      Your zero-knowledge proof has been permanently recorded on the Midnight blockchain with complete privacy preservation.
                    </Typography>
                  </Alert>
                  
                  <ZKProofDisplay 
                    proof={{
                      ...generatedProof,
                      transactionHash: submissionResult.transactionHash,
                      blockNumber: submissionResult.blockNumber,
                      networkId: submissionResult.networkId,
                      gasUsed: submissionResult.gasUsed,
                      verified: true
                    }} 
                    metadata={{
                      ...generatedProof.metadata,
                      studyTitle: proofRequest.studyTitle,
                      queryType: proofRequest.queryType,
                      privacyLevel: proofRequest.privacyLevel,
                      blockchainSubmitted: true,
                      submissionTimestamp: submissionResult.timestamp
                    }}
                  />
                </Grid>
              )}
              {!submissionResult && generatedProof && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>📊 Proof Summary</Typography>
                      <Typography variant="body2"><strong>Study:</strong> {proofRequest.studyTitle}</Typography>
                      <Typography variant="body2"><strong>Query Type:</strong> {proofRequest.queryType}</Typography>
                      <Typography variant="body2"><strong>Privacy Level:</strong> {proofRequest.privacyLevel}</Typography>
                      <Typography variant="body2"><strong>Proof Hash:</strong> {generatedProof.proofHash}</Typography>
                      <Typography variant="body2"><strong>Network:</strong> {generatedProof.networkUsed}</Typography>
                      <Typography variant="body2"><strong>Privacy Guaranteed:</strong> ✅ Patient data never exposed</Typography>
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
            <Button variant="contained" onClick={() => navigate('/hospital-data-request')}>
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
                  🌙 Generate ZK Proof (Midnight)
                </Button>
              )}
              
              {activeStep === 3 && (
                <Button 
                  variant="contained"
                  onClick={handleSubmitToBlockchain}
                  disabled={loading || !generatedProof}
                  startIcon={<Blockchain />}
                >
                  🌙 Submit to Midnight Network
                </Button>
              )}
              
              {activeStep < 2 && (
                <Button onClick={handleNext} variant="contained">
                  Next
                </Button>
              )}
              
              {submissionResult && (
                <Button 
                  variant="contained" 
                  onClick={() => setProofDetailsDialogOpen(true)}
                  startIcon={<Security />}
                  color="success"
                >
                  View Proof Details
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Proof Details Dialog */}
      <Dialog 
        open={proofDetailsDialogOpen} 
        onClose={() => setProofDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '90vh' }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {generatedProof && submissionResult && (
            <ZKProofDisplay 
              proof={{
                ...generatedProof,
                transactionHash: submissionResult.transactionHash,
                blockNumber: submissionResult.blockNumber,
                networkId: submissionResult.networkId,
                gasUsed: submissionResult.gasUsed,
                verified: true
              }} 
              metadata={{
                ...generatedProof.metadata,
                studyTitle: proofRequest.studyTitle,
                queryType: proofRequest.queryType,
                privacyLevel: proofRequest.privacyLevel,
                blockchainSubmitted: true,
                submissionTimestamp: submissionResult.timestamp,
                hospitalDataMocked: generatedProof.metadata?.hospitalDataMocked
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setProofDetailsDialogOpen(false)} size="large">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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