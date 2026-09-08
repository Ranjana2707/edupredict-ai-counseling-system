import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import VerifyOtpPage from '../pages/VerifyOtpPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerificationSuccessPage from '../pages/VerificationSuccessPage';
import DashboardPage from '../pages/DashboardPage';
import StudentsPage from '../pages/StudentsPage';
import RiskAnalyticsPage from '../pages/RiskAnalyticsPage';
import CounselingLogsPage from '../pages/CounselingLogsPage';
import AcademicSupportPage from '../pages/AcademicSupportPage';
import SettingsPage from '../pages/SettingsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import AiHubPage from '../pages/AiHubPage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PublicRoute from '../components/common/PublicRoute';
import { ROLES } from '../constants';

import AttendancePage from '../pages/student/AttendancePage';
import AcademicPerformancePage from '../pages/student/AcademicPerformancePage';
import AssignmentPage from '../pages/student/AssignmentPage';
import RiskAssessmentPage from '../pages/student/RiskAssessmentPage';
import AiRecommendationPage from '../pages/student/AiRecommendationPage';
import CounselingPage from '../pages/student/CounselingPage';
import StudentProfilePage from '../pages/student/StudentProfilePage';
import StudentNotificationsPage from '../pages/student/StudentNotificationsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect to Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Password Recovery & Verification routes under AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verification-success" element={<VerificationSuccessPage />} />
      </Route>

      {/* Modern Split-Screen Register Page */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Modern Split-Screen Login Page */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected system workspace under DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Universal Access */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-hub" element={<AiHubPage />} />

        {/* Role-Restricted Academic indices */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-analytics"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN]}>
              <RiskAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACULTY, ROLES.COUNSELOR, ROLES.ADMIN]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Role-Restricted Intervention registry */}
        <Route
          path="/counseling-logs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.COUNSELOR, ROLES.ADMIN]}>
              <CounselingLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Role-Restricted Student views */}
        <Route
          path="/support"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <AcademicSupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/academic"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <AcademicPerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/risk"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <RiskAssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/recommendations"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <AiRecommendationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/counseling"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <CounselingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentNotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Role-Restricted Admin panel */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Access Restriction Screen */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Global Fallback 404 handler */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
