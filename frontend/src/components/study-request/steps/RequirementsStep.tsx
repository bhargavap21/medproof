import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import { Groups, Science } from '@mui/icons-material';

interface RequirementsStepProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const RequirementsStep: React.FC<RequirementsStepProps> = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    sampleSize: {
      min: data.sampleSize?.min || 0,
      max: data.sampleSize?.max || 0,
      target: data.sampleSize?.target || 0,
    },
    specialRequirements: data.specialRequirements || [],
    equipment: data.equipment || [],
    certifications: data.certifications || [],
  });

  const handleSubmit = () => {
    onNext(formData);
  };

  const handleSampleSizeChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData({
      ...formData,
      sampleSize: {
        ...formData.sampleSize,
        [field]: numValue,
      },
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Groups sx={{ mr: 2, color: 'primary.main' }} />
        Study Requirements
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Define your study requirements including sample size and any special needs.
      </Typography>

      <Grid container spacing={3}>
        {/* Sample Size */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sample Size Requirements</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Minimum Sample Size"
                    type="number"
                    value={formData.sampleSize.min}
                    onChange={(e) => handleSampleSizeChange('min', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">patients</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Target Sample Size"
                    type="number"
                    value={formData.sampleSize.target}
                    onChange={(e) => handleSampleSizeChange('target', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">patients</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Maximum Sample Size"
                    type="number"
                    value={formData.sampleSize.max}
                    onChange={(e) => handleSampleSizeChange('max', e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">patients</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              {formData.sampleSize.target > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.main">
                    <strong>Sample Size Estimate:</strong> Based on your target of {formData.sampleSize.target} patients,
                    you'll likely need hospitals with at least {Math.ceil(formData.sampleSize.target * 1.5)} patients
                    matching your criteria to account for screening failures and dropouts.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Special Requirements */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Special Requirements (Optional)"
            placeholder="e.g., Access to specific medical records, follow-up capabilities, geographic location..."
            value={formData.specialRequirements.join('\n')}
            onChange={(e) => setFormData({
              ...formData,
              specialRequirements: e.target.value.split('\n').filter(req => req.trim()),
            })}
          />
        </Grid>

        {/* Equipment Requirements */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Required Equipment (Optional)"
            placeholder="e.g., MRI, CT Scanner, Laboratory facilities..."
            value={formData.equipment.join('\n')}
            onChange={(e) => setFormData({
              ...formData,
              equipment: e.target.value.split('\n').filter(eq => eq.trim()),
            })}
          />
        </Grid>

        {/* Certification Requirements */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Required Certifications (Optional)"
            placeholder="e.g., GCP, HIPAA, ICH GCP, FDA approval..."
            value={formData.certifications.join('\n')}
            onChange={(e) => setFormData({
              ...formData,
              certifications: e.target.value.split('\n').filter(cert => cert.trim()),
            })}
          />
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
          disabled={formData.sampleSize.min === 0 || formData.sampleSize.target === 0}
        >
          Next: Budget & Timeline
        </Button>
      </Box>
    </Box>
  );
};

export default RequirementsStep;