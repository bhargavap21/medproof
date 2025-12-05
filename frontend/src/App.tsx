import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from './components/Navigation';
import SidebarLayout from './components/SidebarLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import ResearchAggregator from './pages/ResearchAggregator';
import StudyDetails from './pages/StudyDetails';
import ResearchResults from './pages/ResearchResults';
import AdminDashboard from './components/AdminDashboard';
import OrganizationDashboard from './components/OrganizationDashboard';
import OrganizationRegistration from './components/OrganizationRegistration';
import OrganizationManagement from './components/OrganizationManagement';
import HospitalDataAccessDashboard from './components/HospitalDataAccessDashboard';
import HospitalDataRequestForm from './components/HospitalDataRequestForm';
// import HospitalDataApprovalDashboard from './components/HospitalDataApprovalDashboard';
import ZKProofGenerator from './components/ZKProofGenerator';
import HospitalAdminAuth from './components/hospital-admin/HospitalAdminAuth';
import HospitalRegistrationWizard from './components/hospital-admin/HospitalRegistrationWizard';
import HospitalManagementDashboard from './components/hospital-admin/HospitalManagementDashboard';
import HospitalProfilePage from './components/hospital-admin/HospitalProfilePage';
import StudyMarketplace from './components/hospital-admin/StudyMarketplace';
import HospitalNetwork from './pages/HospitalNetwork';
import AuthWrapper from './components/auth/AuthWrapper';
import { APIProvider } from './hooks/useAPI';
import { MidnightProvider } from './hooks/useMidnight';
import { AuthProvider } from './hooks/useAuth';

// Lazy load study request components to avoid circular dependency issues
const StudyRequestWizard = React.lazy(() => import('./components/study-request/StudyRequestWizard'));
const StudyRequestsList = React.lazy(() => import('./components/study-request/StudyRequestsList'));

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
      <MidnightProvider>
        <APIProvider>
          <Routes>
            {/* Landing Page - No Auth Required */}
            <Route path="/" element={<LandingPage />} />

            {/* Hospital Admin Routes - Completely Separate Portal (No Sidebar) */}
            <Route path="/hospital-admin/login" element={<HospitalAdminAuth />} />
            <Route path="/hospital-admin/register" element={<HospitalRegistrationWizard />} />
            <Route path="/hospital-admin/dashboard" element={<HospitalManagementDashboard />} />
            <Route path="/hospital-admin/profile" element={<HospitalProfilePage />} />
            <Route path="/hospital-admin/study-marketplace" element={<StudyMarketplace />} />

            {/* All Main App Routes with Sidebar */}
            <Route path="/*" element={
              <AuthWrapper>
                <SidebarLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/hospital/:hospitalId" element={<HospitalDashboard />} />
                    <Route path="/research" element={<ResearchAggregator />} />
                    <Route path="/study/:studyId" element={<StudyDetails />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/organizations" element={<OrganizationDashboard />} />
                    <Route path="/admin/hospital-data" element={<HospitalDataAccessDashboard />} />
                    <Route path="/organization/register" element={<OrganizationRegistration />} />
                    <Route path="/organization/:id" element={<OrganizationManagement />} />
                    <Route path="/hospital-data-request" element={<HospitalDataRequestForm />} />
                    <Route path="/zk-proof-generator" element={<ZKProofGenerator />} />
                    <Route path="/study-request/create" element={
                      <React.Suspense fallback={<div>Loading...</div>}>
                        <StudyRequestWizard />
                      </React.Suspense>
                    } />
                    <Route path="/study-requests" element={
                      <React.Suspense fallback={<div>Loading...</div>}>
                        <StudyRequestsList />
                      </React.Suspense>
                    } />
                    <Route path="/research-results" element={<ResearchResults />} />
                    <Route path="/hospitals" element={<HospitalNetwork />} />
                    <Route path="/organizations" element={<OrganizationDashboard />} />
                  </Routes>
                </SidebarLayout>
              </AuthWrapper>
            } />
          </Routes>
        </APIProvider>
      </MidnightProvider>
    </AuthProvider>
  );
}

export default App;