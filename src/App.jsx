import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import NavBar from './Components/NavBar';
import LoadingSpinner from './Components/LoadingSpinner';

// Lazy load pages
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const LoginPage = lazy(() => import('./Pages/LoginPage'));

// Admin Dashboard Components
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./Pages/AdminDashboard'));
const ReportsPage = lazy(() => import('./Pages/Reports'));
const AnalyticsPage = lazy(() => import('./Pages/Analytics'));
const UsersPage = lazy(() => import('./Pages/Hotspots'));
const LeaderboardPage = lazy(() => import('./Pages/Leaderboard'));

// Community Dashboard Components (to be created)
const CommunityDashboardLayout = lazy(() => import('./layouts/CommunityDashboardLayout'));
const CommunityHome = lazy(() => import('./Pages/Community/CommunityHome'));
const CommunityReports = lazy(() => import('./Pages/Community/CommunitySolutions'));
// const MySolutions = lazy(() => import('./Pages/Community/MySolutions'));
// const CommunityProviders = lazy(() => import('./Pages/Community/CommunityProviders'));
// const SolutionMarketplace = lazy(() => import('./Pages/Community/SolutionMarketplace'));
// const CommunityProfile = lazy(() => import('./Pages/Community/CommunityProfile'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Dashboard Routes - Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/hotspots" element={<UsersPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
              </Route>
            </Route>

            {/* Community Dashboard Routes - Public Access */}
            <Route element={<CommunityDashboardLayout />}>
              <Route path="/community" element={<CommunityHome />} />
              <Route path="/community/reports" element={<CommunityReports />} />
              {/* <Route path="/community/solutions" element={<MySolutions />} />
              <Route path="/community/providers" element={<CommunityProviders />} />
              <Route path="/community/marketplace" element={<SolutionMarketplace />} />
              <Route path="/community/profile" element={<CommunityProfile />} /> */}
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