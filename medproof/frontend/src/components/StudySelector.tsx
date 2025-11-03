import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle,
  CircularProgress,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import {
  Science as ScienceIcon,
  LocalHospital as HospitalIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Study {
  studyId: string;
  hospitalId: string;
  hospitalName: string;
  status: string;
  metadata: {
    title: string;
    shortTitle: string;
    description: string;
    therapeuticArea: string;
    phase: string;
    condition: {
      code: string;
      display: string;
      system: string;
    };
    treatment: {
      display: string;
      dosing: string;
    };
    comparator?: {
      display: string;
      dosing: string;
    };
  };
  protocol: {
    inclusionCriteria: {
      ageRange: { min: number; max: number };
      gender: string;
      [key: string]: any;
    };
    primaryEndpoint: {
      measure: string;
      timepoint: string;
    };
    duration: string;
    designType: string;
    blinding: string;
  };
  enrollment: {
    actualSize: number;
    completers: number;
  };
  timeline: {
    completed: string;
  };
  qualityMetrics: {
    dataCompleteness: number;
    qualityScore: number;
  };
  efficacySignal: {
    primaryEndpointMet: boolean;
    statisticallySignificant: boolean;
    clinicallyMeaningful: boolean;
  };
}

interface StudySelectorProps {
  onStudySelect: (study: Study | null) => void;
  selectedStudyId?: string;
}

const StudySelector: React.FC<StudySelectorProps> = ({ onStudySelect, selectedStudyId }) => {
  const [availableStudies, setAvailableStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<string>(selectedStudyId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableStudies();
  }, []);

  const fetchAvailableStudies = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📚 Fetching available studies...');
      const response = await axios.get('http://localhost:8000/api/available-studies');

      if (response.data.success) {
        setAvailableStudies(response.data.studies);
        console.log(`✅ Loaded ${response.data.studies.length} available studies`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch studies');
      }
    } catch (err: any) {
      console.error('❌ Error fetching studies:', err);
      setError(err.message || 'Failed to load available studies');
    } finally {
      setLoading(false);
    }
  };

  const handleStudyChange = (studyId: string) => {
    setSelectedStudy(studyId);

    if (studyId) {
      const study = availableStudies.find(s => s.studyId === studyId);
      onStudySelect(study || null);
      console.log('📋 Selected study:', study?.metadata.title);
    } else {
      onStudySelect(null);
    }
  };

  const getTherapeuticAreaColor = (area: string) => {
    const colors: { [key: string]: "primary" | "secondary" | "success" | "warning" | "info" } = {
      'Endocrinology': 'primary',
      'Cardiology': 'secondary',
      'Oncology': 'warning',
      'Cardiovascular': 'info'
    };
    return colors[area] || 'primary';
  };

  const getDesignTypeIcon = (designType: string) => {
    switch (designType) {
      case 'randomized-controlled-trial':
        return '🔬 RCT';
      case 'single-arm-study':
        return '📊 Single-arm';
      default:
        return '🧪 Study';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" p={3}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading available studies...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error Loading Studies</AlertTitle>
        {error}
      </Alert>
    );
  }

  const selectedStudyDetails = availableStudies.find(s => s.studyId === selectedStudy);

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Select Completed Study
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose from real completed clinical studies to generate zero-knowledge proofs.
            Each study has verified protocols and statistical outcomes.
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Available Completed Studies</InputLabel>
            <Select
              value={selectedStudy}
              onChange={(e) => handleStudyChange(e.target.value)}
              label="Available Completed Studies"
            >
              <MenuItem value="">
                <em>Select a study</em>
              </MenuItem>
              {availableStudies.map((study) => (
                <MenuItem key={study.studyId} value={study.studyId}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" noWrap>
                      {study.metadata.shortTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={study.metadata.condition.display}
                        size="small"
                        color={getTherapeuticAreaColor(study.metadata.therapeuticArea)}
                        variant="outlined"
                      />
                      <Chip
                        label={`n=${study.enrollment.actualSize}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={study.hospitalName}
                        size="small"
                        icon={<HospitalIcon />}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedStudyDetails && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Study Details: {selectedStudyDetails.metadata.title}
            </Typography>

            <Grid container spacing={3}>
              {/* Study Overview */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                    Study Overview
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Condition:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.metadata.condition.display}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Phase:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.metadata.phase}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Design:</Typography>
                      <Typography variant="body2">
                        {getDesignTypeIcon(selectedStudyDetails.protocol.designType)} {selectedStudyDetails.protocol.blinding}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Duration:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.protocol.duration}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Treatment Details */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    💊 Treatment Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Treatment:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {selectedStudyDetails.metadata.treatment.display}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedStudyDetails.metadata.treatment.dosing}
                      </Typography>
                    </Box>
                    {selectedStudyDetails.metadata.comparator && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Comparator:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {selectedStudyDetails.metadata.comparator.display}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedStudyDetails.metadata.comparator.dosing}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Grid>

              {/* Patient Population */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    <GroupIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                    Patient Population
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Age Range:</Typography>
                      <Typography variant="body2">
                        {selectedStudyDetails.protocol.inclusionCriteria.ageRange.min}-{selectedStudyDetails.protocol.inclusionCriteria.ageRange.max} years
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Enrolled:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.enrollment.actualSize} patients</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Completed:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.enrollment.completers} patients</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              {/* Study Quality */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    📈 Study Quality & Outcomes
                  </Typography>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Data Completeness:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.qualityMetrics.dataCompleteness}%</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Quality Score:</Typography>
                      <Typography variant="body2">{selectedStudyDetails.qualityMetrics.qualityScore}/100</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Primary Endpoint:</Typography>
                      <Chip
                        label={selectedStudyDetails.efficacySignal.primaryEndpointMet ? "Met" : "Not Met"}
                        size="small"
                        color={selectedStudyDetails.efficacySignal.primaryEndpointMet ? "success" : "default"}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Primary Endpoint
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{selectedStudyDetails.protocol.primaryEndpoint.measure}</strong> at {selectedStudyDetails.protocol.primaryEndpoint.timepoint}
              </Typography>
            </Box>

            {selectedStudyDetails.efficacySignal.statisticallySignificant && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <AlertTitle>Study Results Available</AlertTitle>
                This study has statistically significant results and can be used for ZK proof generation.
                All patient data will remain private while proving study validity.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StudySelector;