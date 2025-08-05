import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
// Import other pages when you create them
// import Dashboard from './Pages/Dashboard';
// import NotFound from './Pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Dashboard Route (uncomment when ready) */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          
          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;