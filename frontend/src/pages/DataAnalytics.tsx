import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  BarChart,
  PieChart,
  Timeline,
  Security,
  DataUsage,
  Analytics,
} from '@mui/icons-material';

const DataAnalytics: React.FC = () => {
  const analyticsTools = [
    {
      title: 'Study Performance Analytics',
      description: 'Track the progress and performance of ongoing research studies',
      icon: <TrendingUp />,
      color: 'primary',
      progress: 75,
    },
    {
      title: 'Patient Demographics',
      description: 'Analyze patient population demographics across hospitals',
      icon: <PieChart />,
      color: 'success',
      progress: 60,
    },
    {
      title: 'Research Outcomes',
      description: 'Visualize research findings and statistical significance',
      icon: <BarChart />,
      color: 'info',
      progress: 85,
    },
    {
      title: 'Privacy Metrics',
      description: 'Monitor privacy preservation and data security metrics',
      icon: <Security />,
      color: 'warning',
      progress: 90,
    },
    {
      title: 'Data Flow Analysis',
      description: 'Track data sharing and collaboration patterns',
      icon: <DataUsage />,
      color: 'secondary',
      progress: 45,
    },
    {
      title: 'Trend Analysis',
      description: 'Identify trends and patterns in medical research data',
      icon: <Timeline />,
      color: 'primary',
      progress: 70,
    },
  ];

  const quickStats = [
    { label: 'Active Analyses', value: '12', icon: <Analytics />, color: 'primary.main' },
    { label: 'Data Points', value: '2.4M', icon: <DataUsage />, color: 'success.main' },
    { label: 'Privacy Score', value: '98%', icon: <Security />, color: 'info.main' },
    { label: 'Insights Generated', value: '156', icon: <TrendingUp />, color: 'warning.main' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assessment sx={{ color: 'primary.main' }} />
          Data Analytics
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Advanced analytics and insights for privacy-preserving medical research
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', py: 2 }}>
                <CardContent>
                  <Box sx={{ color: stat.color, mb: 1 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Analytics Tools Grid */}
      <Grid container spacing={3}>
        {analyticsTools.map((tool, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${tool.color}.main`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}>
                    {tool.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {tool.title}
                    </Typography>
                    <Chip
                      label={`${tool.progress}% Ready`}
                      size="small"
                      color={tool.color as any}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {tool.description}
                </Typography>

                {/* Progress */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Implementation Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{tool.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={tool.progress}
                    color={tool.color as any}
                    sx={{ borderRadius: 1, height: 6 }}
                  />
                </Box>

                {/* Actions */}
                <Button
                  variant="contained"
                  color={tool.color as any}
                  fullWidth
                  startIcon={<Analytics />}
                  sx={{ fontWeight: 600 }}
                  disabled={tool.progress < 50}
                >
                  {tool.progress >= 50 ? 'Launch Analytics' : 'Coming Soon'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Coming Soon Section */}
      <Card sx={{ mt: 4, p: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Advanced Analytics Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          We're working on advanced machine learning algorithms and AI-powered insights that will help researchers
          discover patterns and correlations while maintaining complete patient privacy through zero-knowledge proofs.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label="Machine Learning" variant="outlined" />
          <Chip label="Predictive Analytics" variant="outlined" />
          <Chip label="AI Insights" variant="outlined" />
          <Chip label="Pattern Recognition" variant="outlined" />
        </Box>
      </Card>
    </Box>
  );
};

export default DataAnalytics;