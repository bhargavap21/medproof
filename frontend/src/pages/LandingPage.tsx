import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Security,
  LocalHospital,
  Science,
  VerifiedUser,
  Analytics,
  Shield,
  NetworkCheck,
  Speed,
  Groups,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Security />,
      title: 'Zero-Knowledge Privacy',
      description: 'Cryptographic proofs protect patient data while enabling research collaboration',
      color: '#3b82f6',
    },
    {
      icon: <LocalHospital />,
      title: 'Multi-Hospital Network',
      description: 'Aggregate research findings across healthcare institutions securely',
      color: '#10b981',
    },
    {
      icon: <VerifiedUser />,
      title: 'Verifiable Results',
      description: 'Mathematically guaranteed integrity of research findings and statistics',
      color: '#8b5cf6',
    },
    {
      icon: <NetworkCheck />,
      title: 'FHIR Compatible',
      description: 'Seamless integration with existing healthcare systems and protocols',
      color: '#f59e0b',
    },
    {
      icon: <Shield />,
      title: 'HIPAA Compliant',
      description: 'Full compliance with healthcare privacy regulations and standards',
      color: '#ef4444',
    },
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'Sophisticated research tools for population health insights',
      color: '#06b6d4',
    },
  ];

  const useCases = [
    'Diabetes treatment efficacy across multiple hospitals',
    'Population health research with demographic diversity',
    'Drug safety analysis with statistical significance',
    'Clinical trial coordination without data sharing',
    'Rare disease research collaboration',
    'Public health surveillance and reporting',
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Effects */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Navigation */}
      <Box sx={{
        position: 'relative',
        zIndex: 10,
        py: 3,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <LocalHospital sx={{
                fontSize: 32,
                color: '#3b82f6',
              }} />
              <Typography variant="h5" sx={{
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
              }}>
                MedProof
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate('/app')}
              sx={{
                background: '#ffffff',
                color: '#000000',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: '8px',
                '&:hover': {
                  background: '#f3f4f6',
                },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 16 },
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            textAlign: 'center',
            maxWidth: '800px',
            mx: 'auto',
          }}>
            <Chip
              label="Privacy-Preserving Medical Research"
              sx={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                mb: 4,
              }}
            />

            <Typography variant="h1" sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.1,
              mb: 3,
              letterSpacing: '-0.02em',
            }}>
              Collaborate on Medical Research
              <Box component="span" sx={{ color: '#3b82f6', display: 'block' }}>
                Without Exposing Patient Data
              </Box>
            </Typography>

            <Typography variant="h5" sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 400,
              color: '#D5DBE6',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '600px',
              mx: 'auto',
            }}>
              Zero-knowledge proof platform enabling hospitals to share research insights
              while maintaining complete patient privacy and HIPAA compliance.
            </Typography>

            <Box sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
            }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/app/research')}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                  },
                }}
              >
                Start Research
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Science />}
                onClick={() => navigate('/app/zk-proof-generator')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Generate Proofs
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        py: { xs: 8, md: 12 },
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            textAlign: 'center',
            mb: 8,
          }}>
            <Typography variant="h2" sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
              mb: 3,
              letterSpacing: '-0.02em',
            }}>
              Built for Healthcare Privacy
            </Typography>
            <Typography variant="h6" sx={{
              fontSize: '1.1rem',
              fontWeight: 400,
              color: '#D5DBE6',
              fontFamily: 'Inter, sans-serif',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}>
              Advanced cryptographic technology meets healthcare compliance requirements
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${feature.color}30`,
                    transform: 'translateY(-4px)',
                  },
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '8px',
                      background: `${feature.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      color: feature.color,
                    }}>
                      {feature.icon}
                    </Box>

                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: '#ffffff',
                      fontFamily: 'Inter, sans-serif',
                      mb: 2,
                    }}>
                      {feature.title}
                    </Typography>

                    <Typography variant="body1" sx={{
                      color: '#D5DBE6',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: 1.6,
                    }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Use Cases Section */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        py: { xs: 8, md: 12 },
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                mb: 3,
                letterSpacing: '-0.02em',
              }}>
                Real-World Applications
              </Typography>
              <Typography variant="h6" sx={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#D5DBE6',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
                mb: 4,
              }}>
                From clinical trials to population health studies, MedProof enables breakthrough research
                while maintaining the highest privacy standards.
              </Typography>

              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/app/research')}
                sx={{
                  borderColor: '#3b82f6',
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#2563eb',
                    background: 'rgba(59, 130, 246, 0.1)',
                  },
                }}
              >
                Explore Research
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                p: 4,
              }}>
                {useCases.map((useCase, index) => (
                  <Box key={index} sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: index < useCases.length - 1 ? 3 : 0,
                  }}>
                    <CheckCircle sx={{
                      color: '#10b981',
                      fontSize: 20,
                      mt: 0.5,
                    }} />
                    <Typography variant="body1" sx={{
                      color: '#D5DBE6',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: 1.6,
                    }}>
                      {useCase}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        py: { xs: 8, md: 12 },
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            p: { xs: 6, md: 8 },
            position: 'relative',
            overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h2" sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                mb: 3,
                letterSpacing: '-0.02em',
              }}>
                Ready to Transform Medical Research?
              </Typography>
              <Typography variant="h6" sx={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#D5DBE6',
                fontFamily: 'Inter, sans-serif',
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                mb: 6,
              }}>
                Join leading healthcare institutions using zero-knowledge technology
                to advance medical research while protecting patient privacy.
              </Typography>

              <Box sx={{
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
              }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Groups />}
                  onClick={() => navigate('/app/organization/register')}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
                    },
                  }}
                >
                  Register Organization
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Speed />}
                  onClick={() => navigate('/app')}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  View Dashboard
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        py: 4,
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <LocalHospital sx={{
                fontSize: 24,
                color: '#3b82f6',
              }} />
              <Typography variant="body2" sx={{
                color: '#D5DBE6',
                fontFamily: 'Inter, sans-serif',
              }}>
                © 2024 MedProof. Privacy-preserving medical research.
              </Typography>
            </Box>

            <Typography variant="body2" sx={{
              color: '#9ca3af',
              fontFamily: 'Inter, sans-serif',
            }}>
              Powered by Zero-Knowledge Technology
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;