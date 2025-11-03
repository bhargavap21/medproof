import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { AttachMoney, Schedule, Person } from '@mui/icons-material';

interface BudgetTimelineStepProps {
  data: {
    budget: any;
    timeline: any;
    researcherInfo: any;
  };
  onNext: (data: any) => void;
  onBack: () => void;
}

const BudgetTimelineStep: React.FC<BudgetTimelineStepProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    budget: {
      min: data.budget?.min || 0,
      max: data.budget?.max || 0,
      currency: data.budget?.currency || 'USD',
    },
    timeline: {
      duration: data.timeline?.duration || 0,
      startDate: data.timeline?.startDate || '',
      endDate: data.timeline?.endDate || '',
    },
    researcherInfo: {
      name: data.researcherInfo?.name || '',
      institution: data.researcherInfo?.institution || '',
      credentials: data.researcherInfo?.credentials || '',
      email: data.researcherInfo?.email || '',
      phone: data.researcherInfo?.phone || '',
    },
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get sample size from parent data for budget validation
  const sampleSize = (data as any).sampleSize?.min || 0;

  // Real-time validation as user types
  useEffect(() => {
    const errors = validateForm();
    setValidationErrors(errors);
  }, [formData, sampleSize]);

  const validateForm = () => {
    const errors: string[] = [];

    // Budget per patient validation (matches backend logic)
    if (formData.budget.min && sampleSize && (formData.budget.min / sampleSize) < 500) {
      errors.push(`Budget per patient ($${Math.round(formData.budget.min / sampleSize)}) is too low. Minimum $500 per patient required for quality study conduct.`);
    }

    // Budget range validation
    if (formData.budget.min && formData.budget.max && formData.budget.min > formData.budget.max) {
      errors.push('Maximum budget must be greater than minimum budget.');
    }

    // Timeline validation
    if (formData.timeline.duration > 60) { // 5 years = 60 months
      errors.push('Study duration over 5 years requires special justification.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.researcherInfo.email && !emailRegex.test(formData.researcherInfo.email)) {
      errors.push('Please enter a valid email address.');
    }

    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    setValidationErrors(errors);

    if (errors.length === 0) {
      onNext(formData);
    }
  };

  const calculateEndDate = (startDate: string, duration: number) => {
    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + duration);
      return end.toISOString().split('T')[0];
    }
    return '';
  };

  const handleDurationChange = (duration: number) => {
    const newFormData = {
      ...formData,
      timeline: {
        ...formData.timeline,
        duration,
        endDate: calculateEndDate(formData.timeline.startDate, duration),
      },
    };
    setFormData(newFormData);
  };

  const handleStartDateChange = (startDate: string) => {
    const newFormData = {
      ...formData,
      timeline: {
        ...formData.timeline,
        startDate,
        endDate: calculateEndDate(startDate, formData.timeline.duration),
      },
    };
    setFormData(newFormData);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AttachMoney sx={{ mr: 2, color: 'primary.main' }} />
        Budget, Timeline & Contact
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Set your budget range, timeline, and provide contact information for hospitals to reach you.
      </Typography>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Please fix the following issues:</Typography>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {validationErrors.map((error, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Budget */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1 }} />
                Budget Range
              </Typography>

              {/* Budget Guidance */}
              {sampleSize > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Budget Guidance:</strong> With {sampleSize} participants, minimum budget should be at least ${(sampleSize * 500).toLocaleString()}
                    (${500}/participant) for quality study conduct.
                  </Typography>
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum Budget"
                    type="number"
                    value={formData.budget.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget, min: parseInt(e.target.value) || 0 },
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Maximum Budget"
                    type="number"
                    value={formData.budget.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      budget: { ...formData.budget, max: parseInt(e.target.value) || 0 },
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.budget.currency}
                      label="Currency"
                      onChange={(e) => setFormData({
                        ...formData,
                        budget: { ...formData.budget, currency: e.target.value },
                      })}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1 }} />
                Timeline
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Study Duration"
                    type="number"
                    value={formData.timeline.duration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">months</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Preferred Start Date"
                    type="date"
                    value={formData.timeline.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Expected End Date"
                    type="date"
                    value={formData.timeline.endDate}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Researcher Contact Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Principal Investigator Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.researcherInfo.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      researcherInfo: { ...formData.researcherInfo, name: e.target.value },
                    })}
                    placeholder="Dr. Sarah Johnson"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Institution"
                    value={formData.researcherInfo.institution}
                    onChange={(e) => setFormData({
                      ...formData,
                      researcherInfo: { ...formData.researcherInfo, institution: e.target.value },
                    })}
                    placeholder="University Medical Center"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Credentials"
                    value={formData.researcherInfo.credentials}
                    onChange={(e) => setFormData({
                      ...formData,
                      researcherInfo: { ...formData.researcherInfo, credentials: e.target.value },
                    })}
                    placeholder="MD, PhD"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.researcherInfo.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      researcherInfo: { ...formData.researcherInfo, email: e.target.value },
                    })}
                    placeholder="sarah.johnson@umc.edu"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.researcherInfo.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      researcherInfo: { ...formData.researcherInfo, phone: e.target.value },
                    })}
                    placeholder="+1 (555) 123-4567"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
            formData.budget.min === 0 ||
            formData.timeline.duration === 0 ||
            !formData.researcherInfo.name ||
            !formData.researcherInfo.institution ||
            !formData.researcherInfo.email
          }
        >
          Next: Review & Submit
        </Button>
      </Box>
    </Box>
  );
};

export default BudgetTimelineStep;