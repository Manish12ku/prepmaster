import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Error boundary to catch errors
const ErrorFallback = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg size={40} fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        We encountered an unexpected error. Please try refreshing the page.
      </p>
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-2xl text-sm font-mono break-words mb-6 border border-red-100 dark:border-red-800">
        {error?.message || 'Unknown error'}
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98]"
      >
        Refresh Page
      </button>
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
