import React from 'react';
import Sidebar from '../Components/Sidebar';
import StatsSection from '../Components/StatsSection';
import Charts from '../Components/Charts';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sticky Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64">
        <Sidebar />
      </div>

      {/* Main Content - with left margin to account for fixed sidebar */}
      <div className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>

          {/* Stats Section */}
          <div className="bg-[#1A1A2E]/50 rounded-lg border border-[#00D4B2]/20 backdrop-blur-sm shadow-lg shadow-[#00D4B2]/10 mb-8">
            <StatsSection />
          </div>

          {/* Charts Section */}
          <div className="bg-[#1A1A2E]/50 rounded-lg border border-[#00D4B2]/20 backdrop-blur-sm shadow-lg shadow-[#00D4B2]/10">
            <Charts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
