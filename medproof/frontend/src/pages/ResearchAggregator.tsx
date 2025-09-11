import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Science,
  VerifiedUser,
  TrendingUp,
  Assessment,
  Security,
  Visibility,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { useAPI } from '../hooks/useAPI';
import apiService from '../services/api';

const ResearchAggregator: React.FC = () => {
  const { studies, loading, error, loadDemoStudies } = useAPI();
  const [selectedStudy, setSelectedStudy] = useState<string>('');
  const [aggregateResults, setAggregateResults] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedProof, setSelectedProof] = useState<any>(null);

  useEffect(() => {
    loadDemoStudies();
  }, [loadDemoStudies]);

  useEffect(() => {
    if (studies.length > 0 && !selectedStudy) {
      setSelectedStudy(studies[0].study.studyId);
    }
  }, [studies, selectedStudy]);

  useEffect(() => {
    if (selectedStudy) {
      handleAggregateResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudy]);

  const handleAggregateResults = async () => {
    if (!selectedStudy) return;

    const study = studies.find(s => s.study.studyId === selectedStudy);
    if (!study) return;

    const proofs = study.study.sites
      .filter(site => site.zkProof)
      .map(site => site.zkProof!)
      .filter(proof => proof !== undefined);

    try {
      const response = await apiService.aggregateResults({
        studyType: 'treatment-efficacy',
        condition: study.study.condition,
        proofs: proofs
      });

      if (response.success) {
        setAggregateResults(response);
      }
    } catch (error) {
      console.error('Failed to aggregate results:', error);
    }
  };

  const handleViewProofDetails = (proof: any) => {
    setSelectedProof(proof);
    setShowDetailsDialog(true);
  };

  const renderEfficacyTrend = () => {
    if (!selectedStudy) return null;

    const study = studies.find(s => s.study.studyId === selectedStudy);
    if (!study) return null;

    const data = study.study.sites.map((site, index) => ({
      hospital: site.hospital.name.split(' ')[0],
      efficacy: Math.round(site.outcomes.statistics.treatmentSuccessRate * 100),
      pValue: site.outcomes.statistics.pValue,
      sampleSize: site.outcomes.statistics.treatmentN + site.outcomes.statistics.controlN
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hospital" />
          <YAxis label={{ value: 'Efficacy (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value, name) => [value + '%', 'Treatment Efficacy']} />
          <Bar dataKey="efficacy" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSampleSizeDistribution = () => {
    if (!selectedStudy) return null;

    const study = studies.find(s => s.study.studyId === selectedStudy);
    if (!study) return null;

    const data = study.study.sites.map((site, index) => ({
      x: site.outcomes.statistics.treatmentN + site.outcomes.statistics.controlN,
      y: Math.round(site.outcomes.statistics.treatmentSuccessRate * 100),
      name: site.hospital.name.split(' ')[0]
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Sample Size"
            label={{ value: 'Sample Size', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Efficacy"
            label={{ value: 'Efficacy (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Hospitals" data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const currentStudy = studies.find(s => s.study.studyId === selectedStudy);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Research Aggregator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Analyze aggregated research findings across multiple hospitals using zero-knowledge proofs
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Study Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Study</InputLabel>
            <Select
              value={selectedStudy}
              label="Select Study"
              onChange={(e) => setSelectedStudy(e.target.value)}
            >
              {studies.map((study) => (
                <MenuItem key={study.study.studyId} value={study.study.studyId}>
                  {study.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {currentStudy && (
        <>
          {/* Study Overview */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Participating Sites
                    </Typography>
                    <Typography variant="h4">
                      {currentStudy.study.sites.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <VerifiedUser sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Verified Proofs
                    </Typography>
                    <Typography variant="h4">
                      {currentStudy.study.sites.filter(site => site.zkProof).length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Patients
                    </Typography>
                    <Typography variant="h4">
                      {currentStudy.study.aggregateStats.totalTreatmentN + currentStudy.study.aggregateStats.totalControlN}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Overall P-Value
                    </Typography>
                    <Typography variant="h4">
                      {currentStudy.study.aggregateStats.pValue.toFixed(4)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Aggregate Results */}
          {aggregateResults && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 1 }} />
                  Privacy-Preserving Aggregate Analysis
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  All statistics computed from zero-knowledge proofs without accessing raw patient data
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Average Efficacy
                      </Typography>
                      <Typography variant="h5" color="primary.main">
                        {Math.round(aggregateResults.aggregateStats.averageEfficacy)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Significant Results
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {aggregateResults.aggregateStats.significantResults}/{aggregateResults.aggregateStats.totalHospitals}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Confidence Level
                      </Typography>
                      <Typography variant="h5" color="secondary.main">
                        {Math.round(aggregateResults.aggregateStats.confidenceLevel * 100)}%
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Min Sample Size
                      </Typography>
                      <Typography variant="h5">
                        {aggregateResults.aggregateStats.totalMinSamples.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Treatment Efficacy by Hospital
                  </Typography>
                  {renderEfficacyTrend()}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Size vs Efficacy
                  </Typography>
                  {renderSampleSizeDistribution()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ZK Proofs Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <VerifiedUser sx={{ mr: 1 }} />
                Zero-Knowledge Proofs
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hospital</TableCell>
                      <TableCell>Condition</TableCell>
                      <TableCell align="center">Sample Size</TableCell>
                      <TableCell align="center">Efficacy</TableCell>
                      <TableCell align="center">P-Value</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentStudy.study.sites.map((site, index) => (
                      <TableRow key={index}>
                        <TableCell>{site.hospital.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={currentStudy.study.condition.replace('-', ' ')} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {site.zkProof ? site.zkProof.metadata.sampleSize : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          {site.zkProof ? `${site.zkProof.metadata.efficacyRate}%` : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          {site.zkProof ? site.zkProof.metadata.pValue.toFixed(4) : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={site.zkProof ? 'Verified' : 'Pending'} 
                            size="small"
                            color={site.zkProof ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {site.zkProof && (
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewProofDetails(site.zkProof)}
                            >
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {studies.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No studies available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate some hospital studies to see aggregated research data.
          </Typography>
        </Box>
      )}

      {/* Proof Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Zero-Knowledge Proof Details</DialogTitle>
        <DialogContent>
          {selectedProof && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                This proof cryptographically verifies study results without revealing patient data
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Study Metadata
                    </Typography>
                    <Typography variant="body2">
                      Hospital: {selectedProof.metadata.hospitalName}
                    </Typography>
                    <Typography variant="body2">
                      Condition: {selectedProof.metadata.condition}
                    </Typography>
                    <Typography variant="body2">
                      Treatment: {selectedProof.metadata.treatment}
                    </Typography>
                    <Typography variant="body2">
                      Generated: {new Date(selectedProof.metadata.timestamp).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Proven Claims
                    </Typography>
                    <Typography variant="body2">
                      ✓ Sample size ≥ {selectedProof.metadata.sampleSize}
                    </Typography>
                    <Typography variant="body2">
                      ✓ Efficacy rate: {selectedProof.metadata.efficacyRate}%
                    </Typography>
                    <Typography variant="body2">
                      ✓ Statistical significance: p = {selectedProof.metadata.pValue}
                    </Typography>
                    <Typography variant="body2">
                      ✓ Study criteria met: {selectedProof.publicSignals[7] === 1 ? 'Yes' : 'No'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cryptographic Proof (Abbreviated)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  {JSON.stringify(selectedProof.proof, null, 2).slice(0, 500)}...
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResearchAggregator;