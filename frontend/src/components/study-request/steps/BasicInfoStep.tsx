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
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Assignment, Science, Biotech } from '@mui/icons-material';

interface BasicInfoStepProps {
  data: {
    title: string;
    description: string;
    studyType: string;
    therapeuticArea: string;
  };
  onNext: (data: any) => void;
  onBack: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const studyTypes = [
    { value: 'observational', label: 'Observational Study', icon: '👁️' },
    { value: 'interventional', label: 'Interventional Trial', icon: '💊' },
    { value: 'survey', label: 'Survey Research', icon: '📋' },
    { value: 'registry', label: 'Patient Registry', icon: '📊' },
    { value: 'diagnostic', label: 'Diagnostic Study', icon: '🔬' },
    { value: 'prevention', label: 'Prevention Study', icon: '🛡️' },
  ];

  const therapeuticAreas = [
    'Cardiology',
    'Oncology',
    'Endocrinology',
    'Neurology',
    'Psychiatry',
    'Infectious Disease',
    'Gastroenterology',
    'Pulmonology',
    'Rheumatology',
    'Dermatology',
    'Ophthalmology',
    'Orthopedics',
    'Urology',
    'Pediatrics',
    'Geriatrics',
    'Emergency Medicine',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Other',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Study title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Study title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Study description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Study description must be at least 50 characters';
    }

    if (!formData.studyType) {
      newErrors.studyType = 'Study type is required';
    }

    if (!formData.therapeuticArea) {
      newErrors.therapeuticArea = 'Therapeutic area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Assignment sx={{ mr: 2, color: 'primary.main' }} />
        Basic Study Information
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Let's start with the basic details of your research study. This information will help hospitals understand your project and determine if they can participate.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Study Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title || 'Enter a clear, descriptive title for your study'}
            placeholder="e.g., Efficacy of Metformin vs Insulin in Elderly Type 2 Diabetes Patients"
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Study Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description || 'Provide a detailed description of your study objectives and methodology'}
            placeholder="Describe your study's purpose, methodology, and expected outcomes..."
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.studyType}>
            <InputLabel>Study Type</InputLabel>
            <Select
              value={formData.studyType}
              label="Study Type"
              onChange={(e) => handleChange('studyType', e.target.value)}
            >
              {studyTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>{type.icon}</span>
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.studyType && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.studyType}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!errors.therapeuticArea}>
            <InputLabel>Therapeutic Area</InputLabel>
            <Select
              value={formData.therapeuticArea}
              label="Therapeutic Area"
              onChange={(e) => handleChange('therapeuticArea', e.target.value)}
            >
              {therapeuticAreas.map((area) => (
                <MenuItem key={area} value={area.toLowerCase()}>
                  {area}
                </MenuItem>
              ))}
            </Select>
            {errors.therapeuticArea && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.therapeuticArea}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Study Type Info Card */}
        {formData.studyType && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ mr: 1, color: 'primary.main' }} />
                  {studyTypes.find(t => t.value === formData.studyType)?.label} Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.studyType === 'interventional' &&
                    'Interventional studies require detailed safety protocols, randomization strategies, and often regulatory approval. Plan for longer timelines and higher costs.'}
                  {formData.studyType === 'observational' &&
                    'Observational studies are typically faster and less expensive to conduct. Focus on clear inclusion criteria and data collection protocols.'}
                  {formData.studyType === 'survey' &&
                    'Survey research requires careful questionnaire design and patient consent protocols. Consider response rates in your sample size calculations.'}
                  {(formData.studyType === 'registry' || formData.studyType === 'diagnostic' || formData.studyType === 'prevention') &&
                    'This study type may require specific regulatory considerations and long-term follow-up protocols.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled
          size="large"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          disabled={!formData.title || !formData.description || !formData.studyType || !formData.therapeuticArea}
        >
          Next: Protocol Design
        </Button>
      </Box>
    </Box>
  );
};

export default BasicInfoStep;