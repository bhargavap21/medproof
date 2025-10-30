import React from 'react';
import { useNavigate } from 'react-router-dom';
import GradualBlur from '../components/GradualBlur';
import AnimatedWave from '../components/AnimatedWave';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Security,
  LocalHospital,
  VerifiedUser,
  Analytics,
  Shield,
  NetworkCheck,
  ArrowForward,
  CheckCircle,
  Star,
  Biotech,
  HealthAndSafety,
  Psychology,
  KeyboardArrowDown,
  X as XIcon,
  Facebook,
  Instagram,
  ArrowOutward,
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Custom animated icons components
  const RealTimeIcon = () => (
    <Box sx={{ position: 'relative', width: 96, height: 96 }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 48,
        overflow: 'hidden',
      }}>
        <Box sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: '22px solid #1d222a',
        }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Box sx={{
          width: '1.5px',
          height: 34,
          bgcolor: 'rgba(255, 255, 255, 0.3)',
          transformOrigin: 'bottom',
          mt: '14px',
          transform: 'rotate(315deg)',
        }} />
      </Box>
      <Box sx={{
        position: 'absolute',
        top: 48,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: '#1d222a',
      }} />
    </Box>
  );

  const ImpactIcon = () => (
    <Box sx={{ width: 96, height: 96, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1 }}>
      <Box sx={{ width: 12, height: 14, bgcolor: '#30363d', borderRadius: '2px 2px 0 0' }} />
      <Box sx={{ width: 12, height: 40, bgcolor: '#30363d', borderRadius: '2px 2px 0 0' }} />
      <Box sx={{ width: 12, height: 24, bgcolor: '#30363d', borderRadius: '2px 2px 0 0' }} />
      <Box sx={{ width: 12, height: 10, bgcolor: '#30363d', borderRadius: '2px 2px 0 0' }} />
    </Box>
  );

  const IntegrationIcon = () => {
    const NodeAndLine = ({ rotation }: { rotation: number }) => (
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `rotate(${rotation}deg) translateX(28px)`,
      }}>
        <Box sx={{ position: 'relative', width: 32, height: 32 }}>
          <Box sx={{
            width: '100%',
            height: '1px',
            bgcolor: '#30363d',
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
          }} />
          <Box sx={{
            width: 6,
            height: 6,
            bgcolor: '#30363d',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
          }} />
        </Box>
      </Box>
    );
    
    return (
      <Box sx={{ position: 'relative', width: 96, height: 96 }}>
        <Box sx={{ transform: 'scale(0.9)' }}>
          <NodeAndLine rotation={300} />
          <NodeAndLine rotation={240} />
          <NodeAndLine rotation={180} />
          <NodeAndLine rotation={120} />
          <NodeAndLine rotation={60} />
          <NodeAndLine rotation={0} />
        </Box>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Biotech sx={{ fontSize: 56, color: '#58a6ff' }} />
        </Box>
      </Box>
    );
  };

  const features = [
    {
      icon: <Security sx={{ fontSize: 40, color: '#58a6ff' }} />,
      title: 'Zero-Knowledge Privacy',
      description: 'Cryptographic proofs protect patient data while enabling research collaboration',
    },
    {
      icon: <LocalHospital sx={{ fontSize: 40, color: '#58a6ff' }} />,
      title: 'Multi-Hospital Network',
      description: 'Aggregate research findings across healthcare institutions securely',
    },
    {
      icon: <VerifiedUser sx={{ fontSize: 40, color: '#58a6ff' }} />,
      title: 'Verifiable Results',
      description: 'Mathematically guaranteed integrity of research findings and statistics',
    },
    {
      icon: <NetworkCheck sx={{ fontSize: 40, color: '#58a6ff' }} />,
      title: 'FHIR Compatible',
      description: 'Seamless integration with existing healthcare systems and protocols',
    },
    {
      icon: <Shield sx={{ fontSize: 40, color: '#58a6ff' }} />,
      title: 'HIPAA Compliant',
      description: 'Full compliance with healthcare privacy regulations and standards',
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#58a6ff' }} />,
      title: 'Advanced Analytics',
      description: 'Sophisticated research tools for population health insights',
    },
  ];

  const benefits = [
    {
      icon: <RealTimeIcon />,
      title: 'Real-Time Intelligence',
      description: 'Access accurate, real-time medical data to drive smarter research decisions',
    },
    {
      icon: <ImpactIcon />,
      title: 'Measurable Impact',
      description: 'Track research performance, uncover insights, and achieve data-backed medical breakthroughs',
    },
    {
      icon: <IntegrationIcon />,
      title: 'Seamless Integration',
      description: 'Connect hospitals, research teams, and workflows with intelligent automation',
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
      background: '#0d1117',
      color: '#f0f6fc',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Video Effect */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
      }}>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(26,37,111,0.4) 0%, transparent 50%)',
        }} />
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 60%, #0d1117 100%)',
        }} />
      </Box>

      {/* Navigation */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        background: 'rgba(8,9,10,0.75)',
        backdropFilter: 'blur(8px)',
      }}>
        <Container maxWidth="lg" sx={{ height: '100%' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            px: { xs: 2, md: 5 },
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              <LocalHospital sx={{ fontSize: 28, color: '#58a6ff' }} />
              <Typography variant="h6" sx={{
                fontWeight: 700,
                color: '#f0f6fc',
                fontFamily: 'Inter, sans-serif',
              }}>
                MedProof
              </Typography>
            </Box>

            <Box sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              background: 'rgba(22, 27, 34, 0.5)',
              border: '1px solid #30363d',
              borderRadius: '24px',
              p: 0.75,
              backdropFilter: 'blur(8px)',
            }}>
              {[
                { name: 'Research', href: '#research' },
                { name: 'Features', href: '#features' },
                { name: 'Benefits', href: '#benefits' },
                { name: 'Contact', href: '#contact' },
              ].map((item) => (
                <Button
                  key={item.name}
                  href={item.href}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    color: '#8b949e',
                    '&:hover': {
                      color: '#f0f6fc',
                      background: 'transparent',
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
                borderRadius: '8px',
                border: '1px solid #30363d',
                px: 2,
                py: 1,
                fontSize: '0.875rem',
                color: '#f0f6fc',
                textTransform: 'none',
                '&:hover': {
                  background: '#30363d',
                  border: '1px solid #30363d',
                },
              }}
            >
              Get Started
              <ArrowOutward sx={{ fontSize: 16 }} />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        zIndex: 10,
        minHeight: 'calc(100vh - 64px)',
        pt: 12,
        pb: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* 3D Animated Wave Background */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'auto',
        }}>
          <AnimatedWave
            waveColor="#58a6ff"
            opacity={0.15}
            speed={0.02}
            amplitude={40}
            smoothness={400}
            wireframe={true}
            mouseInteraction={true}
            quality="medium"
            waveOffsetY={-200}
            waveRotation={25}
            ease={15}
            mouseDistortionStrength={0.3}
            mouseShrinkScaleStrength={0.5}
          />
        </Box>
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 20 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '5xl',
            mx: 'auto',
            position: 'relative',
            zIndex: 20,
          }}>
            {/* Logo Badge */}
            <Box sx={{
              mb: 4,
              background: 'rgba(22, 27, 34, 0.7)',
              border: '1px solid #30363d',
              borderRadius: '32px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 100px 0 rgba(26, 37, 111, 0.3)',
              p: 2,
            }}>
              <HealthAndSafety sx={{ fontSize: 74, color: '#58a6ff' }} />
            </Box>

            {/* Status Badge */}
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              borderRadius: '24px',
              border: '1px solid #30363d',
              background: 'rgba(22, 27, 34, 0.5)',
              backdropFilter: 'blur(8px)',
              py: 0.5,
              pr: 2,
              pl: 1,
              mb: 4,
            }}>
              <Box sx={{ position: 'relative', display: 'flex', width: 12, height: 12 }}>
                <Box sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: '#58a6ff',
                  opacity: 0.75,
                  animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                  '@keyframes ping': {
                    '75%, 100%': {
                      transform: 'scale(2)',
                      opacity: 0,
                    },
                  },
                }} />
                <Box sx={{
                  position: 'relative',
                  inset: 0,
                  borderRadius: '50%',
                  width: 12,
                  height: 12,
                  background: '#58a6ff',
                }} />
              </Box>
              <Typography sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#f0f6fc',
                letterSpacing: '0.05em',
              }}>
                NEXT-GEN MEDICAL RESEARCH PLATFORM
              </Typography>
            </Box>

            {/* Main Heading */}
            <Typography sx={{
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#f0f6fc',
              mb: 3,
            }}>
              Collaborate Smarter. Research Faster.{' '}
              <Box component="span" sx={{
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                color: '#58a6ff',
              }}>
                With Privacy.
              </Box>
            </Typography>

            {/* Subtitle */}
            <Typography sx={{
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              color: '#8b949e',
              maxWidth: '600px',
              lineHeight: 1.6,
              mb: 6,
            }}>
              Zero-Knowledge Proof Platform for Modern Medical Research Made Simple
            </Typography>

            {/* CTA Button */}
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/dashboard')}
                sx={{
                background: '#58a6ff',
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 4,
                py: 2,
                borderRadius: '24px',
                  fontSize: '1rem',
                boxShadow: '0 5px 30px -5px rgba(88, 166, 255, 0.5)',
                transition: 'all 0.3s ease',
                  '&:hover': {
                  background: '#4c94ff',
                  boxShadow: '0 8px 40px -5px rgba(88, 166, 255, 0.6)',
                  transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Research
              </Button>

            {/* Social Links */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mt: 4,
            }}>
              {[
                { icon: <XIcon />, href: 'https://x.com/medproof' },
                { icon: <Instagram />, href: 'https://instagram.com/medproof' },
                { icon: <Facebook />, href: 'https://facebook.com/medproof' },
              ].map((social, index) => (
                <React.Fragment key={index}>
              <Button
                    href={social.href}
                sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid #30363d',
                      background: 'rgba(22, 27, 34, 0.5)',
                      backdropFilter: 'blur(8px)',
                      color: '#8b949e',
                      minWidth: 'auto',
                      transition: 'all 0.3s ease',
                  '&:hover': {
                        background: 'rgba(48, 54, 61, 0.8)',
                        color: '#f0f6fc',
                  },
                }}
              >
                    {React.cloneElement(social.icon, { sx: { fontSize: 16 } })}
              </Button>
                  {index < 2 && (
                    <Box sx={{ height: 20, width: '1px', background: '#30363d' }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Container>

        {/* Scroll Indicator */}
        <Box sx={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <KeyboardArrowDown sx={{
            fontSize: 24,
            color: '#8b949e',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 53%, 80%, 100%': {
                transform: 'translateY(0)',
              },
              '40%, 43%': {
                transform: 'translateY(-30px)',
              },
              '70%': {
                transform: 'translateY(-15px)',
              },
              '90%': {
                transform: 'translateY(-4px)',
              },
            },
          }} />
        </Box>

        {/* Gradual Blur Effect */}
        <GradualBlur
          position="bottom"
          height="8rem"
          strength={3}
          divCount={8}
          curve="bezier"
          opacity={0.9}
          animated={true}
        />
      </Box>

      {/* Benefits Section */}
      <Box id="benefits" sx={{
        position: 'relative',
        background: '#0d1117',
        py: 12,
        borderTop: '1px solid #30363d',
      }}>
        <Box sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.05,
          background: 'radial-gradient(circle at 60% 80%, #1e3a5f 0%, transparent 40%)',
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '768px',
            mx: 'auto',
            mb: 8,
          }}>
            <Chip
              icon={<Star sx={{ fontSize: 14, color: '#58a6ff' }} />}
              label="BENEFITS"
              sx={{
                background: '#161b22',
                border: '1px solid #30363d',
                color: '#8b949e',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                mb: 2,
              }}
            />
            
            <Typography sx={{
              fontSize: { xs: '2.5rem', md: '3rem' },
              fontWeight: 600,
              color: '#f0f6fc',
              lineHeight: 1.2,
              mb: 3,
            }}>
              Why Choose{' '}
              <Box component="span" sx={{
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                color: '#58a6ff',
                fontWeight: 400,
              }}>
                MedProof?
              </Box>
            </Typography>

            <Typography sx={{
              fontSize: '1.125rem',
              color: '#8b949e',
              lineHeight: 1.6,
            }}>
              Everything you need to automate, optimize, and scale medical research
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '16px',
                  p: 4,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  },
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -48,
                    left: -48,
                    width: 320,
                    height: 250,
                    background: 'radial-gradient(50% 50% at 50% 50%, rgba(43,85,140,0.15) 0%, rgba(43,85,140,0) 100%)',
                  }} />
                  
                  <CardContent sx={{ p: 0, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ height: 96, mb: 2 }}>
                      {benefit.icon}
                    </Box>
                    
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: '#f0f6fc',
                      mb: 2,
                      fontSize: '1.5rem',
                    }}>
                      {benefit.title}
                    </Typography>
                    
                    <Typography sx={{
                      color: '#8b949e',
                      lineHeight: 1.6,
                    }}>
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{
        background: '#0d1117',
        py: 12,
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            mx: 'auto',
            maxWidth: '768px',
            textAlign: 'center',
            mb: 8,
          }}>
            <Chip
              icon={<Psychology sx={{ fontSize: 16, color: '#58a6ff' }} />}
              label="FEATURES"
              sx={{
                background: '#161b22',
                border: '1px solid #30363d',
                color: '#f0f6fc',
                fontSize: '0.875rem',
                fontWeight: 500,
              mb: 3,
              }}
            />
            
            <Typography sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 600,
              color: '#f0f6fc',
              mb: 2,
            }}>
              All features in one place
            </Typography>
            
            <Typography sx={{
              fontSize: '1.125rem',
              color: '#8b949e',
            }}>
              Everything you need to automate medical research operations, boost productivity
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  border: '1px solid #30363d',
                  background: '#161b22',
                  p: 4,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}>
                  <Box sx={{
                    position: 'absolute',
                    zIndex: 0,
                    left: '50%',
                    top: 0,
                    height: 150,
                    width: '150%',
                    transform: 'translateX(-50%)',
                    borderRadius: '50%',
                    background: 'rgba(88, 166, 255, 0.05)',
                    filter: 'blur(48px)',
                  }} />
                  
                  <CardContent sx={{ p: 0, position: 'relative', zIndex: 10 }}>
                    <Box sx={{ height: 148, mb: 2 }}>
                    <Box sx={{
                        position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        width: 88,
                        height: 88,
                        borderRadius: '8px',
                        border: '1px solid #30363d',
                        background: '#0d1117',
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          color: '#58a6ff',
                          opacity: 0.2,
                          filter: 'blur(2px)',
                    }}>
                      {feature.icon}
                        </Box>
                        <Box sx={{ position: 'relative', color: '#f0f6fc' }}>
                          {feature.icon}
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      color: '#f0f6fc',
                      mb: 1,
                    }}>
                      {feature.title}
                    </Typography>

                    <Typography sx={{
                      color: '#8b949e',
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
      <Box id="research" sx={{
        position: 'relative',
        py: 12,
        borderTop: '1px solid #30363d',
        overflow: 'hidden',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: '#f0f6fc',
                mb: 3,
                letterSpacing: '-0.02em',
              }}>
                Real-World Applications
              </Typography>
              
              <Typography sx={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#8b949e',
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
                onClick={() => navigate('/research')}
                sx={{
                  borderColor: '#58a6ff',
                  color: '#58a6ff',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#4c94ff',
                    background: 'rgba(88, 166, 255, 0.1)',
                  },
                }}
              >
                Explore Research
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{
                background: 'rgba(22, 27, 34, 0.02)',
                border: '1px solid #30363d',
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
                      color: '#238636',
                      fontSize: 20,
                      mt: 0.5,
                    }} />
                    <Typography sx={{
                      color: '#8b949e',
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

        {/* Gradual Blur Effect - Top */}
        <GradualBlur
          position="top"
          height="6rem"
          strength={2}
          divCount={6}
          curve="ease-out"
          opacity={0.7}
        />
      </Box>

      {/* CTA Footer */}
      <Box id="contact" sx={{
        position: 'relative',
        width: '100%',
        background: '#0d1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 15,
        pb: 4,
        px: { xs: 2, sm: 3, lg: 4 },
        overflow: 'hidden',
      }}>
        <Container maxWidth="lg" sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          textAlign: 'center',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <Box sx={{ height: '1px', width: 80, background: '#30363d' }} />
            <Typography sx={{
              fontSize: '1.25rem',
              color: '#8b949e',
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
            }}>
              Ready to transform research?
            </Typography>
            <Box sx={{ height: '1px', width: 80, background: '#30363d' }} />
          </Box>

          <Typography sx={{
            maxWidth: '4xl',
            fontSize: { xs: '3rem', md: '3.75rem' },
                fontWeight: 700,
            lineHeight: 1.1,
            color: '#f0f6fc',
          }}>
            Ready to Automate Medical Research?{' '}
            <Box component="span" sx={{
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              color: '#58a6ff',
            }}>
              Let's Build Together
            </Box>
              </Typography>

          <Typography sx={{ color: '#8b949e' }}>
            Schedule a Call and Begin Researching Smarter
              </Typography>

                <Button
                  onClick={() => navigate('/organization/register')}
                  sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: '24px',
              border: '1px solid #30363d',
              background: 'rgba(22, 27, 34, 0.8)',
              py: 1.5,
              px: 3,
                    fontWeight: 600,
              color: '#f0f6fc',
                    textTransform: 'none',
              transition: 'all 0.3s ease',
                    '&:hover': {
                borderColor: '#58a6ff',
                transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Register Organization
            <ArrowOutward sx={{
              fontSize: 16,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translate(2px, -2px)',
              },
            }} />
                </Button>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}>
            {[
              { icon: <XIcon />, href: 'https://x.com/medproof' },
              { icon: <Instagram />, href: 'https://instagram.com/medproof' },
              { icon: <Facebook />, href: 'https://facebook.com/medproof' },
            ].map((social, index) => (
                <Button
                key={index}
                href={social.href}
                  sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '1px solid #30363d',
                  color: '#8b949e',
                  minWidth: 'auto',
                  transition: 'all 0.3s ease',
                    '&:hover': {
                    borderColor: '#58a6ff',
                    color: '#58a6ff',
                    },
                  }}
                >
                {React.cloneElement(social.icon, { sx: { fontSize: 20 } })}
                </Button>
            ))}
          </Box>

          <Typography sx={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#f0f6fc',
          }}>
            medproof@research.com
          </Typography>
        </Container>

        <Container maxWidth="lg" sx={{ mt: 10 }}>
      <Box sx={{
            height: '1px',
            width: '100%',
            background: 'linear-gradient(to right, transparent, #30363d, transparent)',
          }} />
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.25,
            pt: 5,
          }}>
            <Typography sx={{
              fontSize: '0.875rem',
              color: '#8b949e',
              }}>
                © 2024 MedProof. Privacy-preserving medical research.
            </Typography>
          </Box>
        </Container>

        {/* Gradual Blur Effect - Top */}
        <GradualBlur
          position="top"
          height="10rem"
          strength={4}
          divCount={10}
          curve="bezier"
          opacity={0.8}
          exponential={true}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;