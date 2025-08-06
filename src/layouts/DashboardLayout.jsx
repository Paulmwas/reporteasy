import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import TopBar from '../Components/TopBar';

const DashboardLayout = () => {
  return (
    <div className=" min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0">
        <div className="fixed inset-y-0 left-0 w-64 bg-[#1A1A2E]/80 backdrop-blur-xl border-r border-[#00D4B2]/20 shadow-2xl z-30">
          <Sidebar />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Top Navigation - Fixed */}
        <div className="sticky top-0 z-20 bg-[#1A1A2E]/80 backdrop-blur-xl border-b border-[#00D4B2]/20 shadow-lg">
          <TopBar />
        </div>
        
        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Background decorative elements for the layout */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4B2]/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C1FF72]/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
    </div>
  );
};

export default DashboardLayout;