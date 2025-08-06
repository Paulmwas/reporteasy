import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';
import NavBar from './Components/NavBar';
import LandingPage from './Pages/LandingPage';
import LoginPage from './Pages/LoginPage';
import AdminDashboard from './Pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            
            {/* Add other protected routes here */}
            {/* <Route path="/dashboard/reports" element={<ReportsPage />} /> */}
            {/* <Route path="/dashboard/analytics" element={<AnalyticsPage />} /> */}
          </Route>
          
          {/* 404 Handling */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;