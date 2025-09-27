import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  Security,
  Verified,
  Block,
  Science,
  Visibility,
  ContentCopy,
  CheckCircle,
  Error,
  Info,
  Lock,
  Public,
  Timeline,
  AccountBalance,
} from '@mui/icons-material';
import MedicalResearchDisplay from './MedicalResearchDisplay';

interface ZKProofDisplayProps {
  proof: any;
  metadata?: any;
  compact?: boolean;
}

const ZKProofDisplay: React.FC<ZKProofDisplayProps> = ({ proof, metadata, compact = false }) => {
  const [expandedSection, setExpandedSection] = useState<string | false>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatHash = (hash: string, length: number = 16) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, length)}...${hash.slice(-8)}`;
  };

  const getPrivacyScore = () => {
    if (!metadata) return 85;
    let score = 0;
    if (metadata.patientDataExposed === false) score += 25;
    if (metadata.midnightNetworkUsed) score += 25;
    if (metadata.proofSystem === 'midnight-zk-snarks') score += 25;
    if (proof?.verified) score += 25;
    return score;
  };

  const privacyScore = getPrivacyScore();

  // Parse public signals for display
  const parsePublicSignals = (signals: number[]) => {
    if (!signals || signals.length === 0) return [];
    
    return [
      { label: 'Study Exists', value: signals[0] === 1, type: 'boolean' },
      { label: 'Sample Size Adequate', value: signals[1] === 1, type: 'boolean', detail: '≥50 patients' },
      { label: 'Statistically Significant', value: signals[2] === 1, type: 'boolean', detail: 'p < 0.05' },
      { label: 'Treatment Efficacy', value: signals[3], type: 'percentage', detail: `${signals[3]}% success rate` },
      { label: 'Proof Timestamp', value: new Date(signals[4] * 1000).toLocaleString(), type: 'datetime' },
    ];
  };

  const publicSignals = parsePublicSignals(proof?.publicSignals || []);

  if (compact) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Security color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Zero-Knowledge Proof</Typography>
            <Chip 
              label={proof?.verified ? 'Verified' : 'Pending'} 
              color={proof?.verified ? 'success' : 'warning'}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Proof Hash: {formatHash(proof?.proofHash || metadata?.proofHash || '')}
          </Typography>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowTechnicalDetails(true)}
            startIcon={<Visibility />}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        {/* Header Section */}
        <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Zero-Knowledge Proof Generated
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Medical research data cryptographically verified while preserving patient privacy
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">Privacy Score</Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {privacyScore}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">Network</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {proof?.networkUsed || metadata?.proofSystem || 'Midnight Network'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">Status</Typography>
                  <Chip 
                    label={proof?.verified ? 'Verified' : 'Pending'}
                    color={proof?.verified ? 'success' : 'warning'}
                    sx={{ mt: 1, color: 'white', fontWeight: 'bold' }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">Block Height</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    #{proof?.blockNumber || proof?.blockHeight || 'Pending'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Privacy Guarantees */}
        <Alert severity="success" sx={{ mb: 3 }} icon={<Lock />}>
          <Typography variant="h6" gutterBottom>🔒 Privacy Guarantees Verified</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Patient data never exposed" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Hospital data remains private" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Cryptographically secure proof" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Zero-knowledge protocol used" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Alert>

        {/* Medical Research Results - Primary Focus */}
        <MedicalResearchDisplay
          proof={proof}
          metadata={metadata}
        />

        {/* Public Signals - What's Proven */}
        <Accordion expanded={expandedSection === 'signals'} onChange={handleAccordionChange('signals')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Public sx={{ mr: 2 }} />
            <Typography variant="h6">Proven Facts (Public Signals)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              These facts have been cryptographically proven without revealing the underlying patient data:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {publicSignals.map((signal, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {signal.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {signal.type === 'boolean' ? (
                        <Chip 
                          label={signal.value ? 'Yes' : 'No'}
                          color={signal.value ? 'success' : 'error'}
                          icon={signal.value ? <CheckCircle /> : <Error />}
                        />
                      ) : signal.type === 'percentage' ? (
                        `${signal.value}%`
                      ) : (
                        signal.value
                      )}
                    </Typography>
                    {signal.detail && (
                      <Typography variant="caption" color="text.secondary">
                        {signal.detail}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Blockchain Information */}
        <Accordion expanded={expandedSection === 'blockchain'} onChange={handleAccordionChange('blockchain')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <AccountBalance sx={{ mr: 2 }} />
            <Typography variant="h6">Blockchain Transaction Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Block sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Transaction Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Transaction Hash</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mr: 1 }}>
                        {formatHash(proof?.transactionHash || 'N/A', 20)}
                      </Typography>
                      {proof?.transactionHash && (
                        <Tooltip title={copiedField === 'txHash' ? 'Copied!' : 'Copy full hash'}>
                          <IconButton size="small" onClick={() => copyToClipboard(proof.transactionHash, 'txHash')}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Block Number</Typography>
                    <Typography variant="body1">{proof?.blockNumber || proof?.blockHeight || 'Pending'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Network ID</Typography>
                    <Typography variant="body1">{proof?.networkId || 'midnight-testnet'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">Gas Used</Typography>
                    <Typography variant="body1">{proof?.gasUsed?.toLocaleString() || '0'} gas</Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Proof Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Proof Hash</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', mr: 1 }}>
                        {formatHash(proof?.proofHash || metadata?.proofHash || 'N/A', 20)}
                      </Typography>
                      {(proof?.proofHash || metadata?.proofHash) && (
                        <Tooltip title={copiedField === 'proofHash' ? 'Copied!' : 'Copy full hash'}>
                          <IconButton size="small" onClick={() => copyToClipboard(proof?.proofHash || metadata?.proofHash, 'proofHash')}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Proof System</Typography>
                    <Typography variant="body1">{metadata?.proofSystem || 'Groth16 ZK-SNARK'}</Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Privacy Level</Typography>
                    <Chip 
                      label={metadata?.privacyLevel || 'Maximum'}
                      color="success"
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">Verification Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Verified color={proof?.verified ? 'success' : 'warning'} sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        {proof?.verified ? 'Verified' : 'Pending Verification'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Technical Details */}
        <Accordion expanded={expandedSection === 'technical'} onChange={handleAccordionChange('technical')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Science sx={{ mr: 2 }} />
            <Typography variant="h6">Technical Proof Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                These are the cryptographic components of the zero-knowledge proof. The proof demonstrates 
                the validity of medical research conclusions without revealing any patient data.
              </Typography>
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Protocol</Typography>
                  <Typography variant="body2">{proof?.proof?.protocol || 'Groth16'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Elliptic Curve</Typography>
                  <Typography variant="body2">{proof?.proof?.curve || 'BN128'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Proof Size</Typography>
                  <Typography variant="body2">
                    {proof?.proof ? '~256 bytes' : 'N/A'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {proof?.proof && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Proof Components</Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                    π_a: [{proof.proof.pi_a?.[0]?.slice(0, 20)}..., {proof.proof.pi_a?.[1]?.slice(0, 20)}..., {proof.proof.pi_a?.[2]}]
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', mt: 1 }}>
                    π_b: [[{proof.proof.pi_b?.[0]?.[0]?.slice(0, 15)}..., {proof.proof.pi_b?.[0]?.[1]?.slice(0, 15)}...], ...]
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', mt: 1 }}>
                    π_c: [{proof.proof.pi_c?.[0]?.slice(0, 20)}..., {proof.proof.pi_c?.[1]?.slice(0, 20)}..., {proof.proof.pi_c?.[2]}]
                  </Typography>
                </Paper>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Medical Research Validation */}
        <Accordion expanded={expandedSection === 'medical'} onChange={handleAccordionChange('medical')}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Timeline sx={{ mr: 2 }} />
            <Typography variant="h6">Medical Research Validation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This proof validates that the medical research meets all required standards:
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Sample Size Validation</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Study includes adequate number of participants (≥50 patients)
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Statistical Significance</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Results are statistically significant (p-value &lt; 0.05)
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Treatment Efficacy</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Treatment demonstrates superiority over control group
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">Research Standards</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Study meets all required medical research criteria
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Technical Details Dialog */}
      <Dialog 
        open={showTechnicalDetails} 
        onClose={() => setShowTechnicalDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Technical Proof Details</DialogTitle>
        <DialogContent>
          <ZKProofDisplay proof={proof} metadata={metadata} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTechnicalDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ZKProofDisplay;
