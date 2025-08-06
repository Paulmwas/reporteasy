import React, { useState, useEffect } from 'react';
import api from '../services/api';

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolutionRate: 0,
    urgentReports: 0,
    activeIncidents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard data and community impact in parallel
        const [dashboardData, communityImpactData] = await Promise.all([
          api.dashboard.getOverview(),
          api.analytics.getCommunityImpact()
        ]);

        setStats({
          totalReports: dashboardData.quickStats?.totalReports || 0,
          resolutionRate: communityImpactData.resolutionRate || 0,
          urgentReports: dashboardData.quickStats?.urgentReports || 0,
          activeIncidents: dashboardData.quickStats?.activeIncidents || 0
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="relative overflow-hidden bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 shadow-lg">
              <div className="p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600/50 rounded-lg mb-3 w-24"></div>
                    <div className="h-8 bg-gray-600/50 rounded-lg mb-3 w-16"></div>
                    <div className="h-6 bg-gray-600/50 rounded-full w-20"></div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00D4B2]/20 to-[#C1FF72]/20 rounded-xl flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-600/50 rounded"></div>
                  </div>
                </div>
                <div className="h-12 bg-gray-600/30 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="relative overflow-hidden bg-red-900/20 backdrop-blur-sm rounded-2xl border border-red-500/30 shadow-lg">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-2xl"></i>
            </div>
            <h3 className="text-red-300 font-semibold text-lg mb-2">Failed to Load Statistics</h3>
            <p className="text-red-300/80 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              <i className="fas fa-redo mr-2"></i>
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Issues Reported',
      value: stats.totalReports.toLocaleString(),
      icon: 'fas fa-file-alt',
      gradient: 'from-[#C1FF72] to-[#00D4B2]',
      bgGradient: 'from-[#C1FF72]/10 to-[#00D4B2]/10',
      change: '+12%',
      changeType: 'positive',
      description: 'Total reports submitted this month',
      accentColor: '#C1FF72'
    },
    {
      title: 'Resolution Rate',
      value: `${stats.resolutionRate}%`,
      icon: 'fas fa-check-circle',
      gradient: 'from-[#00D4B2] to-[#4ECDC4]',
      bgGradient: 'from-[#00D4B2]/10 to-[#4ECDC4]/10',
      change: '+5%',
      changeType: 'positive',
      description: 'Successfully resolved issues',
      accentColor: '#00D4B2'
    },
    {
      title: 'Urgent Reports',
      value: stats.urgentReports.toLocaleString(),
      icon: 'fas fa-exclamation-triangle',
      gradient: 'from-[#FFD60A] to-[#FFA726]',
      bgGradient: 'from-[#FFD60A]/10 to-[#FFA726]/10',
      change: stats.urgentReports > 5 ? 'HIGH' : 'NORMAL',
      changeType: stats.urgentReports > 5 ? 'warning' : 'neutral',
      description: 'Require immediate attention',
      accentColor: '#FFD60A'
    },
    {
      title: 'Active Incidents',
      value: stats.activeIncidents.toLocaleString(),
      icon: 'fas fa-clock',
      gradient: 'from-[#FF6B6B] to-[#FF8A80]',
      bgGradient: 'from-[#FF6B6B]/10 to-[#FF8A80]/10',
      change: '-8%',
      changeType: 'positive',
      description: 'Currently being processed',
      accentColor: '#FF6B6B'
    }
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="group relative overflow-hidden bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 shadow-lg hover:shadow-2xl hover:shadow-[#00D4B2]/20 transition-all duration-500 hover:-translate-y-2 hover:border-[#00D4B2]/40"
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D4B2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Main content */}
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm font-medium mb-3 tracking-wide uppercase">
                    {stat.title}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-[#C1FF72] group-hover:to-[#00D4B2] transition-all duration-500">
                      {stat.value}
                    </span>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="inline-flex items-center">
                    <span 
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                        stat.changeType === 'positive' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : stat.changeType === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {stat.changeType === 'positive' && <i className="fas fa-arrow-up mr-1.5 text-xs"></i>}
                      {stat.changeType === 'warning' && <i className="fas fa-exclamation mr-1.5 text-xs"></i>}
                      {stat.change}
                    </span>
                  </div>
                </div>
                
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <i className={`${stat.icon} text-[#1A1A2E] text-xl`}></i>
                </div>
              </div>
              
              {/* Description card */}
              <div className={`relative overflow-hidden bg-gradient-to-r ${stat.bgGradient} rounded-xl border border-white/10 group-hover:border-[#00D4B2]/30 transition-all duration-300`}>
                <div className="p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {stat.description}
                  </p>
                </div>
                
                {/* Subtle animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </div>
            </div>
            
            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;