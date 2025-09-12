import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import ResearchAggregator from './pages/ResearchAggregator';
import StudyDetails from './pages/StudyDetails';
import AdminDashboard from './components/AdminDashboard';
import OrganizationDashboard from './components/OrganizationDashboard';
import OrganizationRegistration from './components/OrganizationRegistration';
import OrganizationManagement from './components/OrganizationManagement';
import HospitalDataAccessDashboard from './components/HospitalDataAccessDashboard';
import HospitalDataRequestForm from './components/HospitalDataRequestForm';
import HospitalDataApprovalDashboard from './components/HospitalDataApprovalDashboard';
import ZKProofGenerator from './components/ZKProofGenerator';
import AuthWrapper from './components/auth/AuthWrapper';
import { APIProvider } from './hooks/useAPI';
import { Web3Provider } from './hooks/useWeb3';
import { AuthProvider } from './hooks/useAuth';

function App() {
  useEffect(() => {
    // Global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Uncaught error:', event.error);
      console.error('🚨 Error message:', event.message);
      console.error('🚨 Error filename:', event.filename);
      console.error('🚨 Error line:', event.lineno);
      console.error('🚨 Error stack:', event.error?.stack);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      console.error('🚨 Rejection stack:', event.reason?.stack);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <AuthProvider>
      <Web3Provider>
        <APIProvider>
          <AuthWrapper>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navigation />
              <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/hospital/:hospitalId" element={<HospitalDashboard />} />
                  <Route path="/research" element={<ResearchAggregator />} />
                  <Route path="/study/:studyId" element={<StudyDetails />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/organizations" element={<OrganizationDashboard />} />
                  <Route path="/admin/hospital-data" element={<HospitalDataAccessDashboard />} />
                  <Route path="/organization/register" element={<OrganizationRegistration />} />
                  <Route path="/organization/:id" element={<OrganizationManagement />} />
                  <Route path="/hospital-data-request" element={<HospitalDataRequestForm />} />
                  <Route path="/hospital/data-requests" element={<HospitalDataApprovalDashboard />} />
                  <Route path="/zk-proof-generator" element={<ZKProofGenerator />} />
                </Routes>
              </Container>
            </Box>
          </AuthWrapper>
        </APIProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;