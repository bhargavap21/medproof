import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Assignment, Science, Groups, AttachMoney, Schedule, Person, Send } from '@mui/icons-material';

interface ReviewSubmitStepProps {
  data: any;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ data, onSubmit, onBack, loading }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
        Review & Submit
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please review your study request details before submitting. Once submitted, hospitals will be able to view and bid on your study.
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                Basic Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Study Title</Typography>
                <Typography variant="body1">{data.basicInfo?.title}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Study Type</Typography>
                <Chip label={data.basicInfo?.studyType} color="primary" size="small" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Therapeutic Area</Typography>
                <Typography variant="body1">{data.basicInfo?.therapeuticArea}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.basicInfo?.description?.substring(0, 150)}...
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Protocol */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Science sx={{ mr: 1, color: 'secondary.main' }} />
                Protocol
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Condition</Typography>
                <Typography variant="body1">
                  {data.protocol?.condition?.icd10Code} - {data.protocol?.condition?.description}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Primary Endpoint</Typography>
                <Typography variant="body1">{data.protocol?.primaryEndpoint?.metric}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Inclusion Criteria</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {data.protocol?.inclusionCriteria?.slice(0, 3).map((criterion: string, index: number) => (
                    <Chip key={index} label={criterion} size="small" variant="outlined" />
                  ))}
                  {data.protocol?.inclusionCriteria?.length > 3 && (
                    <Chip label={`+${data.protocol.inclusionCriteria.length - 3} more`} size="small" />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Requirements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Groups sx={{ mr: 1, color: 'info.main' }} />
                Requirements
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Sample Size</Typography>
                <Typography variant="body1">
                  {data.requirements?.sampleSize?.min} - {data.requirements?.sampleSize?.max} patients
                  (target: {data.requirements?.sampleSize?.target})
                </Typography>
              </Box>
              {data.requirements?.equipment?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Required Equipment</Typography>
                  <Typography variant="body2">{data.requirements.equipment.join(', ')}</Typography>
                </Box>
              )}
              {data.requirements?.certifications?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Required Certifications</Typography>
                  <Typography variant="body2">{data.requirements.certifications.join(', ')}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Budget & Timeline */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ mr: 1, color: 'success.main' }} />
                Budget & Timeline
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Budget Range</Typography>
                <Typography variant="body1">
                  ${data.budget?.min?.toLocaleString()} - ${data.budget?.max?.toLocaleString()} {data.budget?.currency}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                <Typography variant="body1">{data.timeline?.duration} months</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                <Typography variant="body1">{data.timeline?.startDate || 'Flexible'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1, color: 'warning.main' }} />
                Principal Investigator
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{data.researcherInfo?.name}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Institution</Typography>
                  <Typography variant="body1">{data.researcherInfo?.institution}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{data.researcherInfo?.email}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Credentials</Typography>
                  <Typography variant="body1">{data.researcherInfo?.credentials}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* What happens next */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>What happens next?</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Your study request will be submitted to our marketplace" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Our AI will automatically match you with eligible hospitals" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Hospitals will generate ZK proofs to verify their patient capacity" />
              </ListItem>
              <ListItem>
                <ListItemText primary="You'll receive competitive bids with transparent pricing" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Choose the best hospital partner and start your study" />
              </ListItem>
            </List>
          </Alert>
        </Grid>
      </Grid>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
        <Button variant="outlined" onClick={onBack} size="large" disabled={loading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Creating Study Request...' : 'Submit Study Request'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewSubmitStep;