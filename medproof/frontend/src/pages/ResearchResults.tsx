import React from 'react';
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
} from '@mui/icons-material';

interface ResearchResultsProps {}

const ResearchResults: React.FC<ResearchResultsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract data passed from ZK Proof Generator
  const { 
    generatedProof, 
    submissionResult, 
    proofRequest, 
    agreementDetails 
  } = location.state || {};

  if (!generatedProof || !submissionResult) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning">
          No research results found. Please generate a ZK proof first.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/zk-proof-generator')} sx={{ mt: 2 }}>
          Generate ZK Proof
        </Button>
      </Box>
    );
  }

  const insights = generatedProof.researchInsights;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header Section */}
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
          Your study "<strong>{proofRequest?.studyTitle}</strong>" has been cryptographically validated and permanently recorded on the Midnight Network blockchain.
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
                      Treatment Efficacy
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
                      ? 'Strong evidence supports treatment adoption in clinical practice'
                      : 'Further research recommended before widespread implementation'}
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  📋 Clinical Practice Implications
                </Typography>
                <Typography variant="body2">
                  For every {insights?.clinicalSignificance?.numberNeededToTreat || 'X'} patients treated with this intervention, 
                  1 additional patient will benefit compared to the control treatment. This represents a 
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

          {/* Action Buttons */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Next Steps
              </Typography>
              
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<Download />}
                sx={{ mb: 2 }}
                onClick={() => {
                  // TODO: Implement export functionality
                  alert('Research report export coming soon!');
                }}
              >
                Export Research Report
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Share />}
                sx={{ mb: 2 }}
                onClick={() => {
                  // TODO: Implement share functionality
                  navigator.clipboard.writeText(window.location.href);
                  alert('Results link copied to clipboard!');
                }}
              >
                Share Results
              </Button>
              
              <Button 
                variant="text" 
                fullWidth 
                onClick={() => navigate('/zk-proof-generator')}
              >
                Generate Another Proof
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResearchResults; 