import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LocalHospital,
  Science,
  VerifiedUser,
  CloudUpload,
  Assessment,
  Security,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAPI } from '../hooks/useAPI';
import { useWeb3 } from '../hooks/useWeb3';

const HospitalDashboard: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  const { hospitals, error, generateCohort, generateProof, connectToFHIR } = useAPI();
  const { isConnected, submitProof, isHospitalAuthorized } = useWeb3();
  
  const [hospital, setHospital] = useState<any>(null);
  const [studyData, setStudyData] = useState<any>(null);
  const [zkProof, setZKProof] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  
  // Form state
  const [cohortSize, setCohortSize] = useState(500);
  const [condition, setCondition] = useState('type-2-diabetes');
  const [isGenerating, setIsGenerating] = useState(false);

  const conditions = [
    { value: 'type-2-diabetes', label: 'Type 2 Diabetes' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'cardiovascular-disease', label: 'Cardiovascular Disease' },
    { value: 'depression', label: 'Depression' },
  ];

  const steps = [
    'Connect to FHIR',
    'Generate Cohort',
    'Create ZK Proof',
    'Submit to Blockchain'
  ];

  useEffect(() => {
    if (hospitalId && hospitals.length > 0) {
      const foundHospital = hospitals.find(h => h.id === hospitalId);
      setHospital(foundHospital);
    }
  }, [hospitalId, hospitals]);

  const handleConnectFHIR = async () => {
    if (!hospitalId) return;
    
    setIsGenerating(true);
    try {
      const connection = await connectToFHIR(hospitalId);
      if (connection) {
        setActiveStep(1);
      }
    } catch (error) {
      console.error('FHIR connection failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCohort = async () => {
    if (!hospitalId) return;
    
    setIsGenerating(true);
    try {
      const result = await generateCohort(hospitalId, cohortSize, condition);
      if (result) {
        setStudyData(result);
        setActiveStep(2);
      }
    } catch (error) {
      console.error('Cohort generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProof = async () => {
    if (!studyData) return;
    
    setIsGenerating(true);
    try {
      const proofData = {
        patientCount: studyData.outcomes.statistics.treatmentN + studyData.outcomes.statistics.controlN,
        treatmentSuccess: Math.round(studyData.outcomes.statistics.treatmentSuccessRate * studyData.outcomes.statistics.treatmentN),
        controlSuccess: Math.round(studyData.outcomes.statistics.controlSuccessRate * studyData.outcomes.statistics.controlN),
        controlCount: studyData.outcomes.statistics.controlN,
        pValue: studyData.outcomes.statistics.pValue
      };

      const proof = await generateProof(proofData, hospitalId!);
      if (proof) {
        setZKProof(proof);
        setActiveStep(3);
        setShowProofDialog(true);
      }
    } catch (error) {
      console.error('Proof generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitToBlockchain = async () => {
    if (!zkProof || !studyData || !hospitalId) return;

    setIsGenerating(true);
    try {
      const proofData = {
        proofHash: zkProof.metadata.proofHash || `proof_${Date.now()}`,
        studyType: 'treatment-efficacy',
        condition: condition,
        sampleSize: zkProof.metadata.sampleSize,
        effectiveness: zkProof.metadata.efficacyRate,
        zkProof: zkProof
      };

      const result = await submitProof(proofData);
      setSubmissionResult(result);
      setActiveStep(4);
    } catch (error) {
      console.error('Blockchain submission failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderOutcomeChart = () => {
    if (!studyData) return null;

    const data = [
      {
        name: 'Treatment Group',
        success: Math.round(studyData.outcomes.statistics.treatmentSuccessRate * 100),
        total: studyData.outcomes.statistics.treatmentN
      },
      {
        name: 'Control Group', 
        success: Math.round(studyData.outcomes.statistics.controlSuccessRate * 100),
        total: studyData.outcomes.statistics.controlN
      }
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="success" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderDemographicsChart = () => {
    if (!studyData) return null;

    const genderData = Object.entries(studyData.cohort.metadata.genderDistribution).map(([key, value]: [string, any]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={genderData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  if (!hospital) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Hospital not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hospital Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalHospital sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1">
                {hospital.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {hospital.location} • {hospital.type} • {hospital.size}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {hospital.specialties.map((specialty: string) => (
              <Chip key={specialty} label={specialty} size="small" />
            ))}
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2">Active Studies</Typography>
              <Typography variant="h6">{hospital.activeStudies || 0}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2">Total Patients</Typography>
              <Typography variant="h6">{hospital.totalPatients?.toLocaleString() || '0'}</Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/hospital/data-requests')}
              startIcon={<Assessment />}
            >
              Review Data Requests
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Study Generation Process</Typography>
          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Study Configuration */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Science sx={{ mr: 1 }} />
                Study Configuration
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Medical Condition</InputLabel>
                <Select
                  value={condition}
                  label="Medical Condition"
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {conditions.map((cond) => (
                    <MenuItem key={cond.value} value={cond.value}>
                      {cond.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Cohort Size"
                type="number"
                value={cohortSize}
                onChange={(e) => setCohortSize(parseInt(e.target.value))}
                sx={{ mb: 2 }}
                inputProps={{ min: 100, max: 2000 }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleConnectFHIR}
                  disabled={isGenerating || activeStep > 0}
                  startIcon={<CloudUpload />}
                >
                  {activeStep > 0 ? 'FHIR Connected' : 'Connect to FHIR'}
                </Button>

                <Button
                  variant="contained"
                  onClick={handleGenerateCohort}
                  disabled={isGenerating || activeStep < 1 || activeStep > 1}
                  startIcon={<Assessment />}
                >
                  {activeStep > 1 ? 'Cohort Generated' : 'Generate Cohort'}
                </Button>

                <Button
                  variant="contained"
                  onClick={handleGenerateProof}
                  disabled={isGenerating || activeStep < 2 || activeStep > 2}
                  startIcon={<Security />}
                >
                  Generate ZK Proof
                </Button>
              </Box>

              {isGenerating && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    Processing...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Study Results */}
        <Grid item xs={12} md={8}>
          {studyData && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Study Statistics
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Patients</TableCell>
                            <TableCell align="right">
                              {studyData.outcomes.statistics.treatmentN + studyData.outcomes.statistics.controlN}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Treatment Success Rate</TableCell>
                            <TableCell align="right">
                              {(studyData.outcomes.statistics.treatmentSuccessRate * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Control Success Rate</TableCell>
                            <TableCell align="right">
                              {(studyData.outcomes.statistics.controlSuccessRate * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>P-Value</TableCell>
                            <TableCell align="right">
                              {studyData.outcomes.statistics.pValue.toFixed(4)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Effect Size</TableCell>
                            <TableCell align="right">
                              {studyData.outcomes.statistics.effectSize.toFixed(3)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Treatment Outcomes
                    </Typography>
                    {renderOutcomeChart()}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Demographics
                    </Typography>
                    {renderDemographicsChart()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {!studyData && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Study Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate a cohort to see study results and statistics.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* ZK Proof Dialog */}
      <Dialog 
        open={showProofDialog} 
        onClose={() => setShowProofDialog(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <VerifiedUser sx={{ mr: 1 }} />
          Zero-Knowledge Proof Generated
        </DialogTitle>
        <DialogContent>
          {zkProof && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Proof generated successfully! This proof verifies your study results without revealing patient data.
              </Alert>

              {submissionResult && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Proof successfully submitted to blockchain! Transaction hash: {submissionResult.transactionHash.slice(0, 16)}...
                </Alert>
              )}

              {!isConnected && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Connect your wallet to submit this proof to the blockchain.
                </Alert>
              )}

              {isConnected && !isHospitalAuthorized(hospitalId || '') && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Your wallet address is not authorized for this hospital. Please connect with an authorized address.
                </Alert>
              )}
              
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  Proof Hash: {zkProof.metadata.proofHash?.slice(0, 32)}...
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>Proven Facts:</Typography>
              <ul>
                <li>Sample size: {zkProof.metadata.sampleSize} patients</li>
                <li>Treatment efficacy: {zkProof.metadata.efficacyRate}%</li>
                <li>Statistical significance: p = {zkProof.metadata.pValue}</li>
                <li>Study meets research criteria: {zkProof.publicSignals[7] === 1 ? 'Yes' : 'No'}</li>
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProofDialog(false)}>Close</Button>
          {!submissionResult ? (
            <Button 
              variant="contained"
              onClick={handleSubmitToBlockchain}
              disabled={!isConnected || isGenerating || !isHospitalAuthorized(hospitalId || '')}
              startIcon={<Security />}
            >
              {isGenerating ? 'Submitting...' : 'Submit to Blockchain'}
            </Button>
          ) : (
            <Button variant="outlined" disabled>
              Submitted Successfully
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalDashboard;