import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Error boundary to catch errors
const ErrorFallback = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-300 mb-4">Something went wrong</h1>
      <pre className="text-sm text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-800 p-4 rounded">
        {error?.message || 'Unknown error'}
      </pre>
    </div>
  </div>
);

import StudentDashboard from './pages/student/Dashboard';
import StudentTests from './pages/student/Tests';
import TestInterface from './pages/student/TestInterface';
import StudentResults from './pages/student/Results';
import ResultDetail from './pages/student/ResultDetail';
import StudentAnalytics from './pages/student/Analytics';

import AdminDashboard from './pages/admin/Dashboard';
import AdminQuestions from './pages/admin/Questions';
import AdminTests from './pages/admin/Tests';
import AdminStudents from './pages/admin/Students';

import SuperAdminDashboard from './pages/superadmin/Dashboard';
import SuperAdminAdmins from './pages/superadmin/Admins';
import SuperAdminUsers from './pages/superadmin/Users';
import SuperAdminContent from './pages/superadmin/Content';
import SuperAdminAnalytics from './pages/superadmin/Analytics';
import Profile from './pages/student/Profile';

const AppRoutes = () => {
  const { isAuthenticated, dbUser, loading, error } = useAuth();
  const [appError, setAppError] = useState(null);

  useEffect(() => {
    // Catch any errors during render
    const handleError = (e) => {
      console.error('App error:', e);
      setAppError(e);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (appError || error) {
    return <ErrorFallback error={appError || error} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/student/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'super_admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="tests" element={<StudentTests />} />
        <Route path="test/:testId" element={<TestInterface />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="results/:resultId" element={<ResultDetail />} />
        <Route path="analytics" element={<StudentAnalytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="students" element={<AdminStudents />} />
      </Route>

      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="admins" element={<SuperAdminAdmins />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="content" element={<SuperAdminContent />} />
        <Route path="analytics" element={<SuperAdminAnalytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
