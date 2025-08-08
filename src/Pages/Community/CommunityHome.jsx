import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const CommunityHome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [communityImpact, setCommunityImpact] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [insights, setInsights] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const isRefresh = refreshing;
      if (!isRefresh) setLoading(true);

      console.log('🏠 Fetching community dashboard data...');

      // Fetch all data in parallel
      const [
        dashboardResponse,
        impactResponse,
        leaderboardResponse,
        hotspotsResponse,
        insightsResponse
      ] = await Promise.allSettled([
        api.dashboard.getOverview(),
        api.analytics.getCommunityImpact(),
        api.analytics.getLeaderboard(5), // Top 5 for overview
        api.analytics.getHotspots(),
        api.analytics.getInsights()
      ]);

      // Process dashboard data
      if (dashboardResponse.status === 'fulfilled') {
        setDashboardData(dashboardResponse.value);
        console.log('✅ Dashboard data loaded:', dashboardResponse.value);
      } else {
        console.warn('⚠️ Dashboard data failed:', dashboardResponse.reason);
      }

      // Process community impact
      if (impactResponse.status === 'fulfilled') {
        setCommunityImpact(impactResponse.value);
        console.log('✅ Community impact loaded:', impactResponse.value);
      } else {
        console.warn('⚠️ Community impact failed:', impactResponse.reason);
      }

      // Process leaderboard
      if (leaderboardResponse.status === 'fulfilled') {
        setLeaderboard(Array.isArray(leaderboardResponse.value) ? leaderboardResponse.value : []);
        console.log('✅ Leaderboard loaded:', leaderboardResponse.value);
      } else {
        console.warn('⚠️ Leaderboard failed:', leaderboardResponse.reason);
      }

      // Process hotspots
      if (hotspotsResponse.status === 'fulfilled') {
        setHotspots(Array.isArray(hotspotsResponse.value) ? hotspotsResponse.value : []);
        console.log('✅ Hotspots loaded:', hotspotsResponse.value);
      } else {
        console.warn('⚠️ Hotspots failed:', hotspotsResponse.reason);
      }

      // Process insights
      if (insightsResponse.status === 'fulfilled') {
        setInsights(insightsResponse.value);
        console.log('✅ Insights loaded:', insightsResponse.value);
      } else {
        console.warn('⚠️ Insights failed:', insightsResponse.reason);
      }

    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Open WhatsApp reporting
  const openWhatsAppReport = () => {
    const phoneNumber = '+14155238886';
    const message = encodeURIComponent('Hi! I want to report an issue in my community.');
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Initialize data on component mount
  useEffect(() => {
    console.log('🚀 Community dashboard mounted');
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Helper functions
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getLevelBadgeColor = (level) => {
    if (level >= 5) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 3) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (level >= 2) return 'bg-gradient-to-r from-[#00D4B2] to-[#4ECDC4]';
    return 'bg-gradient-to-r from-[#C1FF72] to-[#FFD60A]';
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-12 bg-gray-600/30 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="bg-[#1A1A2E]/60 rounded-2xl p-6 border border-[#00D4B2]/20">
                  <div className="h-6 bg-gray-600/30 rounded w-24 mb-4"></div>
                  <div className="h-10 bg-gray-600/30 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-600/30 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4B2]/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C1FF72]/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#FFD60A]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C1FF72] via-[#00D4B2] to-[#FFD60A] bg-clip-text text-transparent mb-2">
                  Community Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                  Welcome to your community portal • Together we make a difference
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center px-6 py-3 bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-[#00D4B2] rounded-xl hover:bg-[#00D4B2]/20 transition-all duration-300 disabled:opacity-50"
                >
                  <i className={`fas fa-sync-alt mr-2 ${refreshing ? 'animate-spin' : ''}`}></i>
                  Refresh
                </button>
                
                <button 
                  onClick={openWhatsAppReport}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#00D4B2]/30"
                >
                  <i className="fab fa-whatsapp mr-3 text-xl"></i>
                  Report an Issue
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl mr-3"></i>
                <span className="text-red-300">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Reports */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6 hover:border-[#00D4B2]/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-file-alt text-[#1A1A2E] text-xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatNumber(communityImpact?.totalReports || dashboardData?.quickStats?.totalReports || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Reports</div>
                </div>
              </div>
              <div className="w-full bg-[#0B1120]/50 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>

            {/* Resolved Issues */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#C1FF72]/20 p-6 hover:border-[#C1FF72]/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#C1FF72] to-[#FFD60A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-check-circle text-[#1A1A2E] text-xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatNumber(communityImpact?.resolvedReports || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Resolved</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-[#C1FF72]">
                <i className="fas fa-arrow-up mr-2"></i>
                {communityImpact?.resolutionRate || 0}% success rate
              </div>
            </div>

            {/* Active Community Members */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#FFD60A]/20 p-6 hover:border-[#FFD60A]/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FFD60A] to-[#C1FF72] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-users text-[#1A1A2E] text-xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatNumber(communityImpact?.activeUsers || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Active Members</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-[#FFD60A]">
                <i className="fas fa-heart mr-2"></i>
                {communityImpact?.communityEngagement || 0}% engagement
              </div>
            </div>

            {/* Active Incidents */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-red-400/20 p-6 hover:border-red-400/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-exclamation-triangle text-white text-xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatNumber(dashboardData?.quickStats?.activeIncidents || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Active Issues</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-red-400">
                <i className="fas fa-clock mr-2"></i>
                Needs attention
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Community Leaderboard */}
            <div className="lg:col-span-1">
              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6 h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent">
                    <i className="fas fa-trophy mr-2"></i>
                    Community Heroes
                  </h2>
                  <button className="text-[#00D4B2] hover:text-[#C1FF72] transition-colors">
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  {leaderboard.length > 0 ? leaderboard.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 bg-[#0B1120]/50 rounded-xl border border-[#00D4B2]/10 hover:border-[#00D4B2]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${getLevelBadgeColor(user.level)}`}>
                          #{user.rank}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{user.title}</div>
                          <div className="text-gray-400 text-sm">{user.userId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#C1FF72] font-bold">{user.totalPoints}</div>
                        <div className="text-gray-400 text-sm">Level {user.level}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="fas fa-medal text-3xl mb-4 opacity-50"></i>
                      <p>No active community members yet</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => window.location.href = '/leaderboard'}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-[#C1FF72]/20 to-[#00D4B2]/20 border border-[#00D4B2]/30 text-[#00D4B2] rounded-xl hover:bg-gradient-to-r hover:from-[#C1FF72]/30 hover:to-[#00D4B2]/30 transition-all duration-300"
                >
                  View Full Leaderboard
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>

            {/* Hotspots & Announcements */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Current Hotspots */}
              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#FFD60A]/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#FFD60A] to-[#C1FF72] bg-clip-text text-transparent">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    Current Hotspots
                  </h2>
                  <button 
                    onClick={() => window.location.href = '/hotspots'}
                    className="text-[#FFD60A] hover:text-[#C1FF72] transition-colors"
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hotspots.slice(0, 4).map((hotspot, index) => (
                    <div key={index} className="bg-[#0B1120]/50 rounded-xl p-4 border border-[#FFD60A]/10 hover:border-[#FFD60A]/30 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">{hotspot.location}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(hotspot.riskLevel)}`}>
                          {hotspot.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{hotspot.incidents} incidents</span>
                        <span className="text-[#FFD60A]">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {hotspots.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <i className="fas fa-map text-3xl mb-4 opacity-50"></i>
                    <p>No current hotspots - Great job community! 🎉</p>
                  </div>
                )}
              </div>

              {/* Quick Actions & Announcements */}
              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#C1FF72]/20 p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent mb-6">
                  <i className="fas fa-bullhorn mr-2"></i>
                  Community Announcements
                </h2>

                <div className="space-y-4">
                  {/* System Status */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-green-300 font-semibold">System Status: All Systems Operational</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Last updated: {new Date().toLocaleString()}
                    </p>
                  </div>

                  {/* WhatsApp Quick Report */}
                  <div className="bg-[#00D4B2]/10 border border-[#00D4B2]/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[#00D4B2] font-semibold mb-1">
                          <i className="fab fa-whatsapp mr-2"></i>
                          Report via WhatsApp
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Send reports directly to +14155238886
                        </p>
                      </div>
                      <button 
                        onClick={openWhatsAppReport}
                        className="px-4 py-2 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-lg font-semibold hover:scale-105 transition-transform"
                      >
                        Report Now
                      </button>
                    </div>
                  </div>

                  {/* Community Solutions */}
                  <div className="bg-[#FFD60A]/10 border border-[#FFD60A]/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[#FFD60A] font-semibold mb-1">
                          <i className="fas fa-lightbulb mr-2"></i>
                          Community Solutions
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Explore trending solutions from community members
                        </p>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/community/marketplace'}
                        className="px-4 py-2 bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/30 rounded-lg hover:bg-[#FFD60A]/30 transition-all"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Summary */}
          {insights && (
            <div className="mt-8 bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent mb-6">
                <i className="fas fa-chart-line mr-2"></i>
                Community Insights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {insights.trendAnalysis && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#C1FF72] mb-2">
                        {formatNumber(insights.trendAnalysis.infrastructureGrowth || 0)}%
                      </div>
                      <div className="text-gray-400 text-sm">Infrastructure Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#00D4B2] mb-2">
                        {formatNumber(insights.trendAnalysis.citizenEngagement || 0)}%
                      </div>
                      <div className="text-gray-400 text-sm">Citizen Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#FFD60A] mb-2">
                        {formatNumber(insights.trendAnalysis.averageResponseTime || 0)}h
                      </div>
                      <div className="text-gray-400 text-sm">Avg Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">
                        {formatNumber(insights.trendAnalysis.environmentalImpact || 0)}
                      </div>
                      <div className="text-gray-400 text-sm">Environmental Impact</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHome;