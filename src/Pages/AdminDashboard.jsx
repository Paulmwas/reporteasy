import React from 'react';
import StatsSection from '../Components/StatsSection';
import Charts from '../Components/Charts';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#00D4B2]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-[#C1FF72]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFD60A]/10 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>
      
      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C1FF72] via-[#00D4B2] to-[#4ECDC4] bg-clip-text text-transparent mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 text-lg">
                Monitor and manage community reports in real-time
              </p>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 bg-[#1A1A2E]/60 backdrop-blur-sm border border-[#00D4B2]/30 text-gray-300 rounded-xl hover:bg-[#00D4B2]/20 hover:text-white transition-all duration-300">
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg">
                <i className="fas fa-plus mr-2"></i>
                New Report
              </button>
            </div>
          </div>
          
          {/* Decorative line */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#00D4B2]/50 to-transparent"></div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#1A1A2E]/30 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 shadow-2xl shadow-[#00D4B2]/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D4B2]/5 to-[#C1FF72]/5 opacity-50"></div>
          <div className="relative">
            <StatsSection />
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-[#1A1A2E]/30 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 shadow-2xl shadow-[#00D4B2]/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C1FF72]/5 to-[#FFD60A]/5 opacity-50"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Analytics & Insights
              </h2>
              <div className="flex items-center space-x-2">
                <select className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00D4B2]/50">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
            </div>
            <Charts />
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleString()} • Auto-refresh every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;