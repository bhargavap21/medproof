import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Science } from '@mui/icons-material';

const StudyDetails: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Study Details
      </Typography>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Study Details Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Study ID: {studyId}
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Detailed study analysis and visualization features will be available in the next iteration.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudyDetails;