import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Features from './pages/Features';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EmployeeDashboard from './pages/dashboards/EmployeeDashboard';
import HRDashboard from './pages/dashboards/HRDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import MeetingRoom from './components/meetings/MeetingRoom';
import Chatbot from './components/Chatbot';
// Performance Review Components
import EmployeeSelfAssessment from './components/performance/EmployeeSelfAssessment';
import ApplyForReview from './components/performance/ApplyForReview';
import ViewMyReviews from './components/performance/ViewMyReviews';
import ReviewCycleManager from './components/performance/ReviewCycleManager';
import HRReviewDashboard from './components/performance/HRReviewDashboard';
import HRReviewForm from './components/performance/HRReviewForm';
import AdminReviewSettings from './components/performance/AdminReviewSettings';
// Payroll Components
import EmployeePayslips from './components/payroll/EmployeePayslips';
import HRPayrollDashboard from './components/payroll/HRPayrollDashboard';
import AdminPayrollApproval from './components/payroll/AdminPayrollApproval';
import SalaryStructureManager from './components/payroll/SalaryStructureManager';
// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/employee') ||
    location.pathname.startsWith('/hr') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/meeting');

  return (
    <div className="app">
      {!isDashboardRoute && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          <Route
            path="/dashboard/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/hr"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meeting/:meetingId"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                <MeetingRoom />
              </ProtectedRoute>
            }
          />

          {/* Performance Review Routes - Employee */}
          <Route
            path="/employee/apply-review"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                <DashboardLayout title="Apply for Performance Review">
                  <ApplyForReview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/my-reviews"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                <DashboardLayout title="View My Reviews">
                  <ViewMyReviews />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          {/* Keep old route for backward compatibility */}
          <Route
            path="/employee/performance"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                <DashboardLayout title="Performance Self-Assessment">
                  <EmployeeSelfAssessment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Performance Review Routes - HR */}
          <Route
            path="/hr/cycles"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <DashboardLayout title="Review Cycle Management">
                  <ReviewCycleManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/reviews"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <DashboardLayout title="Performance Review Dashboard">
                  <HRReviewDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/reviews/:reviewId/evaluate"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <DashboardLayout title="Evaluate Performance Review">
                  <HRReviewForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Performance Review Routes - Admin */}
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Performance Review Administration">
                  <AdminReviewSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Payroll Routes - Employee */}
          <Route
            path="/employee/payslips"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                <DashboardLayout title="My Payslips">
                  <EmployeePayslips />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Payroll Routes - HR */}
          <Route
            path="/hr/payroll"
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <DashboardLayout title="Payroll Management">
                  <HRPayrollDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Payroll Routes - Admin */}
          <Route
            path="/admin/payroll"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Payroll Approval">
                  <AdminPayrollApproval />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Salary Structure Management - Admin */}
          <Route
            path="/admin/salary-structures"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout title="Salary Structure Management">
                  <SalaryStructureManager />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
      {!isDashboardRoute && <Chatbot />}
    </div>
  );
}

function AppRoutes() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
