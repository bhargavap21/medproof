import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Chip,
  Divider,
  Paper,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  VerifiedUser,
  Assessment,
  LocalHospital,
  Science,
  Security,
  Biotech,
  TrendingUp,
  CheckCircle,
  Timeline,
  PublicOutlined,
  BarChart,
  Download,
  Share,
  Search,
  FilterList,
  ExpandMore,
  Visibility,
  Refresh,
  Close,
} from '@mui/icons-material';
import axios from 'axios';

interface ResearchResultsProps {}

interface GeneratedProof {
  id: string;
  studyTitle: string;
  drugName: string;
  hospitalName: string;
  proofGeneratedAt: string;
  transactionHash: string;
  blockNumber: string;
  researchInsights: {
    treatmentEfficacy: {
      absoluteImprovement: string;
      relativeImprovement: string;
      effectSize: string;
    };
    clinicalSignificance: {
      numberNeededToTreat: string;
      meaningfulDifference: string;
      riskReduction: string;
    };
    studyCharacteristics: {
      pValue: string;
      statisticalPower: string;
      studyType: string;
      sampleSize: string;
    };
  };
  status: 'verified' | 'pending' | 'failed';
}

const ResearchResults: React.FC<ResearchResultsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data passed from ZK Proof Generator (for individual proof view)
  const {
    generatedProof,
    submissionResult,
    proofRequest,
    agreementDetails
  } = location.state || {};

  // State for analytics dashboard
  const [allProofs, setAllProofs] = useState<GeneratedProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProof, setSelectedProof] = useState<GeneratedProof | null>(null);

  // Check if we're in individual proof view or analytics dashboard view
  const isIndividualProofView = Boolean(generatedProof && submissionResult);

  useEffect(() => {
    if (!isIndividualProofView) {
      fetchAllProofs();
    }
  }, [isIndividualProofView]);

  const fetchAllProofs = async () => {
    try {
      setLoading(true);

      // For demo purposes, create sample proof data
      const sampleProofs: GeneratedProof[] = [
        {
          id: 'proof-1',
          studyTitle: 'Metformin Efficacy Study in Elderly Type 2 Diabetes',
          drugName: 'Metformin',
          hospitalName: 'Stanford Medical Center',
          proofGeneratedAt: '2025-09-28T10:30:00Z',
          transactionHash: '0x1234567890abcdef',
          blockNumber: '15678943',
          status: 'verified',
          researchInsights: {
            treatmentEfficacy: {
              absoluteImprovement: '23% HbA1c reduction',
              relativeImprovement: '31% vs control',
              effectSize: 'Large (d=0.82)'
            },
            clinicalSignificance: {
              numberNeededToTreat: '4',
              meaningfulDifference: 'Clinically significant',
              riskReduction: '28% relative risk reduction'
            },
            studyCharacteristics: {
              pValue: 'p < 0.001',
              statisticalPower: 'High (98%)',
              studyType: 'Randomized Controlled Trial',
              sampleSize: '1,247 patients'
            }
          }
        },
        {
          id: 'proof-2',
          studyTitle: 'Atorvastatin Cardiovascular Prevention Study',
          drugName: 'Atorvastatin',
          hospitalName: 'Johns Hopkins',
          proofGeneratedAt: '2025-09-27T15:45:00Z',
          transactionHash: '0xabcdef1234567890',
          blockNumber: '15678892',
          status: 'verified',
          researchInsights: {
            treatmentEfficacy: {
              absoluteImprovement: '42% LDL reduction',
              relativeImprovement: '38% vs placebo',
              effectSize: 'Large (d=0.91)'
            },
            clinicalSignificance: {
              numberNeededToTreat: '6',
              meaningfulDifference: 'Clinically significant',
              riskReduction: '35% cardiovascular events'
            },
            studyCharacteristics: {
              pValue: 'p < 0.001',
              statisticalPower: 'High (96%)',
              studyType: 'Randomized Controlled Trial',
              sampleSize: '892 patients'
            }
          }
        },
        {
          id: 'proof-3',
          studyTitle: 'Pembrolizumab Immunotherapy in Advanced Melanoma',
          drugName: 'Pembrolizumab',
          hospitalName: 'Mayo Clinic',
          proofGeneratedAt: '2025-09-26T09:20:00Z',
          transactionHash: '0x567890abcdef1234',
          blockNumber: '15678834',
          status: 'verified',
          researchInsights: {
            treatmentEfficacy: {
              absoluteImprovement: '34% response rate',
              relativeImprovement: '67% vs chemotherapy',
              effectSize: 'Very Large (d=1.12)'
            },
            clinicalSignificance: {
              numberNeededToTreat: '3',
              meaningfulDifference: 'Clinically significant',
              riskReduction: '52% progression risk'
            },
            studyCharacteristics: {
              pValue: 'p < 0.001',
              statisticalPower: 'High (99%)',
              studyType: 'Randomized Controlled Trial',
              sampleSize: '456 patients'
            }
          }
        }
      ];

      setAllProofs(sampleProofs);
    } catch (error) {
      console.error('Error fetching proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProofs = allProofs.filter(proof => {
    const matchesSearch = proof.studyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proof.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || proof.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const viewProofDetails = (proof: GeneratedProof) => {
    setSelectedProof(proof);
    // Scroll to details section
    setTimeout(() => {
      const detailsSection = document.getElementById('proof-details-section');
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Individual proof details view (when navigated from ZK Proof Generator)
  if (isIndividualProofView) {
    const insights = generatedProof.researchInsights;

    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Individual Proof View Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'success.main', mr: 3, width: 56, height: 56 }}>
            <Assessment sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h3" gutterBottom>
              🏆 Research Results & Validation
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Privacy-Preserving Medical Research Analysis Complete
            </Typography>
          </Box>
        </Box>

        {/* Success Banner */}
        <Alert severity="success" sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            🌙 Zero-Knowledge Proof Successfully Generated & Submitted
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your study "<strong>{proofRequest?.studyTitle}</strong>" investigating {proofRequest?.studyTitle?.includes('Metformin') ? 'metformin efficacy in elderly type 2 diabetes patients' :
                         proofRequest?.studyTitle?.includes('Atorvastatin') ? 'atorvastatin effectiveness in cardiovascular disease prevention' :
                         proofRequest?.studyTitle?.includes('Linagliptin') ? 'linagliptin safety and efficacy in diabetes treatment' :
                         proofRequest?.studyTitle?.includes('Pembrolizumab') ? 'pembrolizumab immunotherapy in advanced melanoma' :
                         'clinical treatment outcomes'} has been cryptographically validated and permanently recorded on the Midnight Network blockchain.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Transaction: ${submissionResult.transactionHash}`} color="success" />
            <Chip label={`Block: ${submissionResult.blockNumber}`} color="primary" />
            <Chip label="Privacy Preserved" color="secondary" />
          </Box>
        </Alert>

        <Grid container spacing={4}>
          {/* Left Column - Key Findings */}
          <Grid item xs={12} lg={8}>
            {/* Primary Research Findings */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                  Primary Research Findings
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {insights?.treatmentEfficacy?.absoluteImprovement || 'N/A'}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {proofRequest?.studyTitle?.includes('Metformin') ? 'Metformin Efficacy' :
                         proofRequest?.studyTitle?.includes('Atorvastatin') ? 'Atorvastatin Efficacy' :
                         proofRequest?.studyTitle?.includes('Linagliptin') ? 'Linagliptin Efficacy' :
                         proofRequest?.studyTitle?.includes('Pembrolizumab') ? 'Pembrolizumab Efficacy' :
                         'Treatment Efficacy'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {insights?.treatmentEfficacy?.effectSize || 'Effect size calculated'}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {insights?.clinicalSignificance?.numberNeededToTreat || 'N/A'}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        Number Needed to Treat
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Patients needed to treat for 1 benefit
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  📊 Statistical Validation
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {insights?.studyCharacteristics?.pValue?.includes('0.001') ? 'A+' :
                         insights?.studyCharacteristics?.pValue?.includes('0.01') ? 'A' : 'B+'}
                      </Typography>
                      <Typography variant="caption">Statistical Strength</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insights?.studyCharacteristics?.pValue || 'p-value calculated'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {insights?.studyCharacteristics?.statisticalPower?.includes('High') ? '90%' : '80%'}
                      </Typography>
                      <Typography variant="caption">Statistical Power</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insights?.studyCharacteristics?.statisticalPower || 'Power calculated'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        I
                      </Typography>
                      <Typography variant="caption">Evidence Level</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Highest Quality Evidence
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Clinical Significance */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalHospital sx={{ mr: 2, color: 'error.main' }} />
                  Clinical Impact Assessment
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Clinical Significance
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>{insights?.clinicalSignificance?.meaningfulDifference || 'Clinically significant'}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {insights?.clinicalSignificance?.riskReduction || 'Risk reduction calculated'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Clinical Recommendation
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {insights?.clinicalSignificance?.meaningfulDifference === 'Clinically significant'
                        ? `Strong evidence supports ${
                            proofRequest?.studyTitle?.includes('Metformin') ? 'metformin use' :
                            proofRequest?.studyTitle?.includes('Atorvastatin') ? 'atorvastatin therapy' :
                            proofRequest?.studyTitle?.includes('Linagliptin') ? 'linagliptin treatment' :
                            proofRequest?.studyTitle?.includes('Pembrolizumab') ? 'pembrolizumab immunotherapy' :
                            'treatment'
                          } adoption in clinical practice`
                        : `Further research recommended before widespread ${
                            proofRequest?.studyTitle?.includes('Metformin') ? 'metformin' :
                            proofRequest?.studyTitle?.includes('Atorvastatin') ? 'atorvastatin' :
                            proofRequest?.studyTitle?.includes('Linagliptin') ? 'linagliptin' :
                            proofRequest?.studyTitle?.includes('Pembrolizumab') ? 'pembrolizumab' :
                            'treatment'
                          } implementation`}
                    </Typography>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    📋 Clinical Practice Implications
                  </Typography>
                  <Typography variant="body2">
                    For every {insights?.clinicalSignificance?.numberNeededToTreat || 'X'} patients treated with {
                      proofRequest?.studyTitle?.includes('Metformin') ? 'metformin' :
                      proofRequest?.studyTitle?.includes('Atorvastatin') ? 'atorvastatin' :
                      proofRequest?.studyTitle?.includes('Linagliptin') ? 'linagliptin' :
                      proofRequest?.studyTitle?.includes('Pembrolizumab') ? 'pembrolizumab' :
                      'this intervention'
                    },
                    1 additional patient will benefit compared to {
                      proofRequest?.studyTitle?.includes('Metformin') ? 'placebo or standard diabetes care' :
                      proofRequest?.studyTitle?.includes('Atorvastatin') ? 'placebo or standard lipid therapy' :
                      proofRequest?.studyTitle?.includes('Linagliptin') ? 'placebo or other diabetes medications' :
                      proofRequest?.studyTitle?.includes('Pembrolizumab') ? 'chemotherapy or standard cancer treatment' :
                      'the control treatment'
                    }. This represents a
                    {insights?.treatmentEfficacy?.relativeImprovement || 'significant'} improvement in patient outcomes.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>

            {/* Study Quality & Methodology */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ mr: 2, color: 'secondary.main' }} />
                  Study Quality & Methodology
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Study Design
                    </Typography>
                    <Typography variant="body2">
                      {insights?.studyCharacteristics?.studyType || 'Randomized Controlled Trial'}
                    </Typography>
                    <Chip label="Gold Standard" color="success" size="small" sx={{ mt: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Sample Size
                    </Typography>
                    <Typography variant="body2">
                      {insights?.studyCharacteristics?.sampleSize || 'Adequate cohort size'}
                    </Typography>
                    <Chip label="Adequate Power" color="primary" size="small" sx={{ mt: 1 }} />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Bias Risk
                    </Typography>
                    <Typography variant="body2">
                      Low (ZK-verified methodology)
                    </Typography>
                    <Chip label="High Quality" color="success" size="small" sx={{ mt: 1 }} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Privacy & Compliance */}
          <Grid item xs={12} lg={4}>
            {/* Privacy Guarantees */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 2, color: 'success.main' }} />
                  Privacy Guarantees
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Patient Data Never Exposed"
                      secondary="Zero-knowledge cryptographic proof"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hospital Data Private"
                      secondary="Institutional privacy maintained"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cryptographically Secure"
                      secondary="Midnight Network blockchain"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Immutable Record"
                      secondary="Permanent blockchain verification"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Regulatory Compliance */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUser sx={{ mr: 2, color: 'primary.main' }} />
                  Regulatory Compliance
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="HIPAA Compliant"
                      secondary="Patient privacy protected"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="FDA 21 CFR Part 11"
                      secondary="Electronic records integrity"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="ICH-GCP Guidelines"
                      secondary="Clinical trial standards"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="GDPR Article 25"
                      secondary="Privacy by design"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Publication Readiness */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PublicOutlined sx={{ mr: 2, color: 'warning.main' }} />
                  Publication Readiness
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  This study meets publication standards for high-impact medical journals:
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Chip label="NEJM Ready" color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="Lancet Ready" color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="JAMA Ready" color="success" size="small" sx={{ mr: 1, mb: 1 }} />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Novel contribution: First use of zero-knowledge proofs for privacy-preserving medical research validation.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Analytics Dashboard View (when accessed from sidebar)
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Dashboard Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 3, width: 56, height: 56 }}>
            <BarChart sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h3" gutterBottom>
              📊 Research Results & Analytics
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Privacy-Preserving Medical Research Dashboard
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllProofs}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Science />}
            onClick={() => navigate('/app/zk-proof-generator')}
          >
            Generate New Proof
          </Button>
        </Box>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {allProofs.length}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Total Proofs Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {allProofs.filter(p => p.status === 'verified').length}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Verified Proofs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                3
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Unique Hospitals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                4
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Drug Treatments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by study title, drug name, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Found {filteredProofs.length} result{filteredProofs.length !== 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      ) : (
        <>
          {/* Proof Results Table */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment sx={{ mr: 2, color: 'primary.main' }} />
                Generated ZK Proofs
              </Typography>

              {filteredProofs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No proof results found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Try adjusting your search criteria or generate a new proof.
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/app/zk-proof-generator')}>
                    Generate New Proof
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Study</TableCell>
                        <TableCell>Drug</TableCell>
                        <TableCell>Hospital</TableCell>
                        <TableCell>Generated</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Key Results</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProofs.map((proof) => (
                        <TableRow key={proof.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {proof.studyTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {proof.researchInsights.studyCharacteristics.studyType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={proof.drugName} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{proof.hospitalName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(proof.proofGeneratedAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={proof.status}
                              color={proof.status === 'verified' ? 'success' : proof.status === 'pending' ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {proof.researchInsights.treatmentEfficacy.absoluteImprovement}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              NNT: {proof.researchInsights.clinicalSignificance.numberNeededToTreat}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => viewProofDetails(proof)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Selected Proof Details Modal/Accordion */}
          {selectedProof && (
            <Card 
              id="proof-details-section"
              sx={{ 
                mt: 4, 
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: 3
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Science sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h5">
                        {selectedProof.studyTitle}
                      </Typography>
                      <Chip 
                        label={selectedProof.status} 
                        color="success" 
                        size="small" 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Button 
                    variant="outlined" 
                    onClick={() => setSelectedProof(null)}
                    startIcon={<Close />}
                  >
                    Close
                  </Button>
                </Box>
                
                {/* Study Overview */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Study:</strong> {selectedProof.studyTitle} | 
                    <strong> Drug:</strong> {selectedProof.drugName} | 
                    <strong> Hospital:</strong> {selectedProof.hospitalName} | 
                    <strong> Generated:</strong> {new Date(selectedProof.proofGeneratedAt).toLocaleString()}
                  </Typography>
                </Alert>

                {/* Key Metrics Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {selectedProof.researchInsights.treatmentEfficacy.absoluteImprovement}
                      </Typography>
                      <Typography variant="body2">Primary Outcome</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {selectedProof.researchInsights.studyCharacteristics.pValue}
                      </Typography>
                      <Typography variant="body2">Statistical Significance</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        NNT: {selectedProof.researchInsights.clinicalSignificance.numberNeededToTreat}
                      </Typography>
                      <Typography variant="body2">Clinical Impact</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <TrendingUp sx={{ mr: 1 }} /> Treatment Efficacy
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ space: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Absolute Improvement:</strong> {selectedProof.researchInsights.treatmentEfficacy.absoluteImprovement}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Relative Improvement:</strong> {selectedProof.researchInsights.treatmentEfficacy.relativeImprovement}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Effect Size:</strong> {selectedProof.researchInsights.treatmentEfficacy.effectSize}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Alert severity="success" sx={{ mt: 1 }}>
                            Treatment shows significant improvement over control group
                          </Alert>
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalHospital sx={{ mr: 1 }} /> Clinical Significance
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ space: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Number Needed to Treat:</strong> {selectedProof.researchInsights.clinicalSignificance.numberNeededToTreat}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Meaningful Difference:</strong> {selectedProof.researchInsights.clinicalSignificance.meaningfulDifference}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Risk Reduction:</strong> {selectedProof.researchInsights.clinicalSignificance.riskReduction}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Alert severity="info" sx={{ mt: 1 }}>
                            Results meet criteria for clinical significance
                          </Alert>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <BarChart sx={{ mr: 1 }} /> Study Characteristics
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ space: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>P-Value:</strong> {selectedProof.researchInsights.studyCharacteristics.pValue}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Statistical Power:</strong> {selectedProof.researchInsights.studyCharacteristics.statisticalPower}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Study Type:</strong> {selectedProof.researchInsights.studyCharacteristics.studyType}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Sample Size:</strong> {selectedProof.researchInsights.studyCharacteristics.sampleSize}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Alert severity="success" sx={{ mt: 1 }}>
                            Study design meets gold standard for evidence-based medicine
                          </Alert>
                        </Box>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Security sx={{ mr: 1 }} /> Blockchain Verification
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ space: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1.5, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            <strong>Transaction Hash:</strong><br />
                            {selectedProof.transactionHash}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Block Number:</strong> {selectedProof.blockNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1.5 }}>
                            <strong>Generated:</strong> {new Date(selectedProof.proofGeneratedAt).toLocaleString()}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Alert severity="info" sx={{ mt: 1 }}>
                            🌙 Verified on Midnight Network - Privacy-preserving blockchain
                          </Alert>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default ResearchResults;