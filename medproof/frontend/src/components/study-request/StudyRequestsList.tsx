import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Assignment,
  Add,
  Edit,
  Visibility,
  AttachMoney,
  Schedule,
  Business,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface StudyRequest {
  id: string;
  title: string;
  description: string;
  studyType: string;
  therapeuticArea: string;
  condition: any;
  requirements: any;
  created_at: string;
  status?: string;
}

const StudyRequestsList: React.FC = () => {
  const navigate = useNavigate();
  const [studyRequests, setStudyRequests] = useState<StudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudyRequests();
  }, []);

  const loadStudyRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/study-requests');
      if (response.ok) {
        const data = await response.json();
        setStudyRequests(data.studyRequests || []);
      } else {
        throw new Error('Failed to load study requests');
      }
    } catch (err) {
      setError('Failed to load study requests. Please try again.');
      console.error('Error loading study requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/study-request/create');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading study requests...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              My Study Requests
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your research study requests and track hospital bids
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateNew}
            startIcon={<Add />}
            sx={{ minWidth: 200 }}
          >
            Create New Request
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Study Requests */}
        {studyRequests.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Study Requests Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first study request to start connecting with hospitals and getting competitive bids.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateNew}
              startIcon={<Add />}
            >
              Create Your First Study Request
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {studyRequests.map((request) => (
              <Grid item xs={12} key={request.id}>
                <Card sx={{ '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                          {request.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {request.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={request.studyType}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={request.therapeuticArea}
                            size="small"
                            variant="outlined"
                          />
                          {request.condition?.description && (
                            <Chip
                              label={request.condition.description}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={request.status || 'active'}
                            size="small"
                            color={getStatusColor(request.status)}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ ml: 2, textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(request.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Request Details */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {request.requirements?.sampleSize && (
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Business sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Sample Size
                              </Typography>
                              <Typography variant="body2">
                                {request.requirements.sampleSize.min}-{request.requirements.sampleSize.max} patients
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {request.requirements?.budget && (
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Budget Range
                              </Typography>
                              <Typography variant="body2">
                                ${request.requirements.budget.min?.toLocaleString()} - ${request.requirements.budget.max?.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {request.requirements?.timeline && (
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Duration
                              </Typography>
                              <Typography variant="body2">
                                {request.requirements.timeline.duration} months
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => console.log('View details:', request.id)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => console.log('Edit request:', request.id)}
                      >
                        Edit Request
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default StudyRequestsList;