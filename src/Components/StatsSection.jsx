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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded mb-3"></div>
                <div className="h-8 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-3/4"></div>
              </div>
              <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-2xl mb-3"></i>
          <p className="text-red-300 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200"
          >
            <i className="fas fa-redo mr-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Issues Reported',
      value: stats.totalReports,
      icon: 'fas fa-file-alt',
      gradient: 'from-[#C1FF72] to-[#00D4B2]',
      bgGradient: 'from-[#C1FF72]/20 to-[#00D4B2]/20',
      change: '+12%',
      changeType: 'positive',
      description: 'Total reports submitted'
    },
    {
      title: 'Resolution Rate',
      value: `${stats.resolutionRate}%`,
      icon: 'fas fa-check-circle',
      gradient: 'from-[#00D4B2] to-[#FFD60A]',
      bgGradient: 'from-[#00D4B2]/20 to-[#FFD60A]/20',
      change: '+5%',
      changeType: 'positive',
      description: 'Issues successfully resolved'
    },
    {
      title: 'Urgent Reports',
      value: stats.urgentReports,
      icon: 'fas fa-exclamation-triangle',
      gradient: 'from-[#FFD60A] to-[#FF6B6B]',
      bgGradient: 'from-[#FFD60A]/20 to-[#FF6B6B]/20',
      change: stats.urgentReports > 5 ? 'HIGH' : 'NORMAL',
      changeType: stats.urgentReports > 5 ? 'warning' : 'neutral',
      description: 'High priority issues'
    },
    {
      title: 'Active Incidents',
      value: stats.activeIncidents,
      icon: 'fas fa-clock',
      gradient: 'from-[#FF6B6B] to-[#C1FF72]',
      bgGradient: 'from-[#FF6B6B]/20 to-[#C1FF72]/20',
      change: '-8%',
      changeType: 'positive',
      description: 'Currently being addressed'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-gray-400 text-sm font-medium mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </p>
              <div className="flex items-center space-x-2">
                <span 
                  className={`text-sm px-2 py-1 rounded-full font-medium ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-500/20 text-green-400'
                      : stat.changeType === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {stat.changeType === 'positive' && <i className="fas fa-arrow-up mr-1 text-xs"></i>}
                  {stat.changeType === 'warning' && <i className="fas fa-exclamation mr-1 text-xs"></i>}
                  {stat.change}
                </span>
              </div>
            </div>
            
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <i className={`${stat.icon} text-[#1A1A2E] text-lg`}></i>
            </div>
          </div>
          
          <div className={`mt-4 p-3 bg-gradient-to-r ${stat.bgGradient} rounded-lg border border-gray-600/30`}>
            <p className="text-gray-300 text-xs">{stat.description}</p>
          </div>
          
          {/* Animated background effect */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgGradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;