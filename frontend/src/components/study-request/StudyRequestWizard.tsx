import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BasicInfoStep from './steps/BasicInfoStep';
import ProtocolDesignStep from './steps/ProtocolDesignStep';
import RequirementsStep from './steps/RequirementsStep';
import BudgetTimelineStep from './steps/BudgetTimelineStep';
import ReviewSubmitStep from './steps/ReviewSubmitStep';
import { StudyRequestForm } from '../../types/StudyRequest';

const steps = [
  'Basic Information',
  'Protocol Design',
  'Requirements',
  'Budget & Timeline',
  'Review & Submit'
];

const StudyRequestWizard: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState<{studyId: string; hospitalCount: number} | null>(null);
  const [formData, setFormData] = useState<StudyRequestForm>({
    basicInfo: {
      title: '',
      description: '',
      studyType: 'observational',
      therapeuticArea: '',
    },
    protocol: {
      condition: {
        icd10Code: '',
        description: '',
        severity: 'moderate',
      },
      primaryEndpoint: {
        metric: '',
        measurementMethod: '',
        timeframe: '',
      },
      inclusionCriteria: [],
      exclusionCriteria: [],
      intervention: {
        type: 'none',
        description: '',
      },
    },
    requirements: {
      sampleSize: {
        min: 0,
        max: 0,
        target: 0,
      },
      specialRequirements: [],
      equipment: [],
      certifications: [],
    },
    budget: {
      min: 0,
      max: 0,
      currency: 'USD',
    },
    timeline: {
      duration: 0,
      startDate: '',
      endDate: '',
    },
    researcherInfo: {
      name: '',
      institution: '',
      credentials: '',
      email: '',
      phone: '',
      previousStudies: [],
    },
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepComplete = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
    handleNext();
  };

  const handleSubmit = async () => {
    console.log('🚀 STARTING SUBMISSION PROCESS...');
    setLoading(true);
    setError(null);

    try {
      // Convert form data to API format
      const studyRequestData = {
        title: formData.basicInfo.title,
        description: formData.basicInfo.description,
        studyType: formData.basicInfo.studyType,
        therapeuticArea: formData.basicInfo.therapeuticArea,
        conditionData: formData.protocol.condition,
        protocolData: {
          primaryEndpoint: formData.protocol.primaryEndpoint,
          inclusionCriteria: formData.protocol.inclusionCriteria,
          exclusionCriteria: formData.protocol.exclusionCriteria,
          intervention: formData.protocol.intervention,
        },
        requirements: {
          ...formData.requirements,
          budget: formData.budget,
          timeline: formData.timeline,
        },
        researcherInfo: formData.researcherInfo,
      };

      console.log('📤 Submitting study request:', studyRequestData);

      const response = await fetch('http://localhost:3001/api/study-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studyRequestData }),
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📋 FULL Backend response:', JSON.stringify(result, null, 2));

      // FIXED: Robust success check with detailed logging
      if (result && result.success === true) {
        const studyId = result.studyRequest?.id || 'unknown';
        console.log('✅ SUCCESS! Study request created:', studyId);
        console.log('🏥 Hospital matches:', result.hospitalMatches?.length || 0);

        const message = `Study request created successfully! ID: ${studyId}. ${result.hospitalMatches?.length || 0} hospitals found.`;

        // Show success dialog and store data
        setSuccessData({
          studyId,
          hospitalCount: result.hospitalMatches?.length || 0
        });
        setShowSuccessDialog(true);

        // Store success message
        sessionStorage.setItem('successMessage', message);
        console.log('💾 Success message stored in sessionStorage');

        return; // Exit immediately
      } else {
        console.error('❌ Backend responded with failure:', result);
        setError(result.error || result.message || 'Study request creation failed - unknown error');
      }
    } catch (err) {
      console.error('💥 CRITICAL ERROR during submission:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorStack = err instanceof Error ? err.stack : '';
      console.error('💥 Error details:', errorMessage, errorStack);
      setError(`Network/Server error: ${errorMessage}`);
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const handleDialogConfirm = () => {
    console.log('🚀 User confirmed - redirecting to dashboard...');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current pathname:', window.location.pathname);

    setShowSuccessDialog(false);

    // IMMEDIATE redirect - no delays
    console.log('🔄 Redirecting to dashboard...');

    // Try the root path first (since dashboard might be at /)
    const dashboardPath = '/';  // or '/dashboard' depending on your routing

    // Method 1: Use React Router navigate
    try {
      navigate(dashboardPath, { replace: true });
      console.log('✅ React Router navigate called for:', dashboardPath);
    } catch (err) {
      console.error('❌ React Router navigate failed:', err);
    }

    // Method 2: Force page navigation as backup
    setTimeout(() => {
      console.log('🔄 Forcing navigation to:', dashboardPath);
      window.location.href = dashboardPath;
    }, 200);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoStep
            data={formData.basicInfo}
            onNext={(data) => handleStepComplete({ basicInfo: data })}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <ProtocolDesignStep
            data={formData.protocol}
            onNext={(data) => handleStepComplete({ protocol: data })}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <RequirementsStep
            data={formData.requirements}
            onNext={(data) => handleStepComplete({ requirements: data })}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <BudgetTimelineStep
            data={{ budget: formData.budget, timeline: formData.timeline, researcherInfo: formData.researcherInfo }}
            onNext={(data) => handleStepComplete(data)}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ReviewSubmitStep
            data={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            loading={loading}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Create Study Request
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Connect with hospitals and get competitive bids for your medical research
          </Typography>
        </Box>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Paper sx={{ p: 4, minHeight: 600 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Creating your study request...
              </Typography>
            </Box>
          ) : (
            getStepContent(activeStep)
          )}
        </Paper>

        {/* Navigation Buttons */}
        {!loading && activeStep < steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
              size="large"
            >
              Back
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <Box /> {/* Spacer */}
          </Box>
        )}

        {/* Success Confirmation Dialog */}
        <Dialog
          open={showSuccessDialog}
          onClose={() => {}} // Prevent closing by clicking outside
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', color: 'success.main', fontSize: '1.5rem' }}>
            🎉 Study Request Created Successfully!
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your study request has been submitted and is now live in the marketplace.
              </Typography>
              {successData && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Study ID:</strong> {successData.studyId}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Hospitals Found:</strong> {successData.hospitalCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    You'll receive notifications when hospitals submit bids for your study.
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={handleDialogConfirm}
              variant="contained"
              size="large"
              sx={{ minWidth: 200 }}
            >
              Go to Dashboard
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default StudyRequestWizard;