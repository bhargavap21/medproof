import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Grid,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Science, Add } from '@mui/icons-material';

interface ProtocolDesignStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const ProtocolDesignStep: React.FC<ProtocolDesignStepProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    condition: {
      icd10Code: data.condition?.icd10Code || '',
      description: data.condition?.description || '',
      severity: data.condition?.severity || 'moderate',
    },
    primaryEndpoint: {
      metric: data.primaryEndpoint?.metric || '',
      measurementMethod: data.primaryEndpoint?.measurementMethod || '',
      timeframe: data.primaryEndpoint?.timeframe || '',
    },
    inclusionCriteria: data.inclusionCriteria || [],
    exclusionCriteria: data.exclusionCriteria || [],
    intervention: {
      type: data.intervention?.type || 'none',
      description: data.intervention?.description || '',
    },
  });

  const [newInclusionCriterion, setNewInclusionCriterion] = useState('');
  const [newExclusionCriterion, setNewExclusionCriterion] = useState('');

  const commonConditions = [
    { code: 'E11', description: 'Type 2 Diabetes Mellitus' },
    { code: 'C78', description: 'Lung Cancer' },
    { code: 'I25', description: 'Chronic Ischemic Heart Disease' },
    { code: 'M79', description: 'Other and Unspecified Soft Tissue Disorders' },
    { code: 'K59', description: 'Other Functional Intestinal Disorders' },
  ];

  const handleSubmit = () => {
    onNext(formData);
  };

  const addInclusionCriterion = () => {
    if (newInclusionCriterion.trim()) {
      setFormData({
        ...formData,
        inclusionCriteria: [...formData.inclusionCriteria, newInclusionCriterion.trim()],
      });
      setNewInclusionCriterion('');
    }
  };

  const addExclusionCriterion = () => {
    if (newExclusionCriterion.trim()) {
      setFormData({
        ...formData,
        exclusionCriteria: [...formData.exclusionCriteria, newExclusionCriterion.trim()],
      });
      setNewExclusionCriterion('');
    }
  };

  const removeInclusionCriterion = (index: number) => {
    setFormData({
      ...formData,
      inclusionCriteria: formData.inclusionCriteria.filter((_: string, i: number) => i !== index),
    });
  };

  const removeExclusionCriterion = (index: number) => {
    setFormData({
      ...formData,
      exclusionCriteria: formData.exclusionCriteria.filter((_: string, i: number) => i !== index),
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Science sx={{ mr: 2, color: 'primary.main' }} />
        Protocol Design
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Define your study protocol including the medical condition, endpoints, and participant criteria.
      </Typography>

      <Grid container spacing={3}>
        {/* Medical Condition */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Medical Condition</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={commonConditions}
            getOptionLabel={(option) => typeof option === 'string' ? option : `${option.code} - ${option.description}`}
            value={commonConditions.find(c => c.code === formData.condition.icd10Code) || null}
            onChange={(_, value) => {
              if (value) {
                setFormData({
                  ...formData,
                  condition: {
                    ...formData.condition,
                    icd10Code: value.code,
                    description: value.description,
                  },
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="ICD-10 Condition"
                placeholder="Search for condition..."
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Severity</InputLabel>
            <Select
              value={formData.condition.severity}
              label="Severity"
              onChange={(e) => setFormData({
                ...formData,
                condition: { ...formData.condition, severity: e.target.value },
              })}
            >
              <MenuItem value="mild">Mild</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="severe">Severe</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Primary Endpoint */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Primary Endpoint</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Primary Metric"
            value={formData.primaryEndpoint.metric}
            onChange={(e) => setFormData({
              ...formData,
              primaryEndpoint: { ...formData.primaryEndpoint, metric: e.target.value },
            })}
            placeholder="e.g., HbA1c reduction"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Measurement Method"
            value={formData.primaryEndpoint.measurementMethod}
            onChange={(e) => setFormData({
              ...formData,
              primaryEndpoint: { ...formData.primaryEndpoint, measurementMethod: e.target.value },
            })}
            placeholder="e.g., Laboratory analysis"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Timeframe"
            value={formData.primaryEndpoint.timeframe}
            onChange={(e) => setFormData({
              ...formData,
              primaryEndpoint: { ...formData.primaryEndpoint, timeframe: e.target.value },
            })}
            placeholder="e.g., 6 months"
          />
        </Grid>

        {/* Inclusion Criteria */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Inclusion Criteria</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Add inclusion criterion"
              value={newInclusionCriterion}
              onChange={(e) => setNewInclusionCriterion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addInclusionCriterion()}
              placeholder="e.g., Age 65-85 years"
            />
            <Button variant="outlined" onClick={addInclusionCriterion} startIcon={<Add />}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {formData.inclusionCriteria.map((criterion: string, index: number) => (
              <Chip
                key={index}
                label={criterion}
                onDelete={() => removeInclusionCriterion(index)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>

        {/* Exclusion Criteria */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Exclusion Criteria</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Add exclusion criterion"
              value={newExclusionCriterion}
              onChange={(e) => setNewExclusionCriterion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExclusionCriterion()}
              placeholder="e.g., Pregnancy"
            />
            <Button variant="outlined" onClick={addExclusionCriterion} startIcon={<Add />}>
              Add
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {formData.exclusionCriteria.map((criterion: string, index: number) => (
              <Chip
                key={index}
                label={criterion}
                onDelete={() => removeExclusionCriterion(index)}
                color="error"
                variant="outlined"
              />
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
        <Button variant="outlined" onClick={onBack} size="large">
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          disabled={
            !formData.condition.icd10Code ||
            !formData.primaryEndpoint.metric ||
            !formData.primaryEndpoint.timeframe ||
            formData.inclusionCriteria.length === 0
          }
        >
          Next: Requirements
        </Button>
      </Box>
    </Box>
  );
};

export default ProtocolDesignStep;