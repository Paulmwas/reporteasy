import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import NavBar from './Components/NavBar';
import LoadingSpinner from './Components/LoadingSpinner';

// Lazy load pages
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const LoginPage = lazy(() => import('./Pages/LoginPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./Pages/AdminDashboard'));
const ReportsPage = lazy(() => import('./Pages/Reports'));
// const AnalyticsPage = lazy(() => import('./pages/dashboard/Analytics'));
// const UsersPage = lazy(() => import('./pages/dashboard/Users'));
// const CategoriesPage = lazy(() => import('./pages/dashboard/Categories'));
const LeaderboardPage = lazy(() => import('./Pages/Leaderboard'));
// const SettingsPage = lazy(() => import('./Pages/Settings'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/reports" element={<ReportsPage />} />
                {/* <Route path="/dashboard/analytics" element={<AnalyticsPage />} /> */}
                {/* <Route path="/dashboard/users" element={<UsersPage />} /> */}
                {/* <Route path="/dashboard/categories" element={<CategoriesPage />} /> */}
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                {/* <Route path="/dashboard/settings" element={<SettingsPage />} /> */}
              </Route>
            </Route>
            
            {/* 404 Handling */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;