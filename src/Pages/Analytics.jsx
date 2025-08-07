import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Analytics = () => {
  const [insights, setInsights] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [communityImpact, setCommunityImpact] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching analytics data...');
      
      const [insightsData, leaderboardData, communityData, hotspotsData] = await Promise.all([
        api.analytics.getInsights(),
        api.analytics.getLeaderboard(10),
        api.analytics.getCommunityImpact(),
        api.analytics.getHotspots()
      ]);

      console.log('✅ Analytics Data Loaded:', {
        insights: insightsData,
        leaderboard: leaderboardData,
        community: communityData,
        hotspots: hotspotsData
      });

      setInsights(insightsData);
      setLeaderboard(leaderboardData);
      setCommunityImpact(communityData);
      setHotspots(hotspotsData);

    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Helper functions
  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'LOW': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getLevelColor = (level) => {
    if (level >= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (level >= 2) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111b21] via-[#1c1e21] to-[#000000] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600/30 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="bg-[#1c1e21] rounded-2xl p-6 border border-[#43cd66]/20">
                  <div className="h-4 bg-gray-600/30 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-600/30 rounded w-16 mb-2"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-[#111b21] via-[#1c1e21] to-[#000000] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#43cd66] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#25d366] rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#43cd66] via-[#25d366] to-[#e6ffda] bg-clip-text text-transparent mb-2" 
                    style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
                  Analytics Dashboard
                </h1>
                <p className="text-[#5e5e5e] text-lg" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                  Comprehensive insights and community impact metrics
                </p>
              </div>
              
              <button 
                onClick={fetchAnalyticsData}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#43cd66] to-[#25d366] text-[#ffffff] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
                style={{ fontFamily: 'Helvetica Neue, sans-serif' }}
              >
                <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                Refresh Data
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-[#1c1e21] rounded-2xl border border-[#43cd66]/20 p-2 mb-8">
              <div className="flex gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
                  { id: 'trends', label: 'Trends', icon: 'fas fa-chart-line' },
                  { id: 'community', label: 'Community', icon: 'fas fa-users' },
                  { id: 'hotspots', label: 'Hotspots', icon: 'fas fa-map-marker-alt' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#43cd66] to-[#25d366] text-[#ffffff] shadow-lg'
                        : 'text-[#5e5e5e] hover:text-[#ffffff] hover:bg-[#111b2133]'
                    }`}
                    style={{ fontFamily: 'Helvetica Neue, sans-serif' }}
                  >
                    <i className={`${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl mr-3"></i>
                <span className="text-red-300" style={{ fontFamily: 'Segoe UI, sans-serif' }}>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && insights && communityImpact && (
            <>
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6 hover:border-[#43cd66]/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#43cd66] to-[#25d366] rounded-xl flex items-center justify-center">
                      <i className="fas fa-file-alt text-[#ffffff] text-lg"></i>
                    </div>
                    <span className="text-[#43cd66] text-sm font-semibold">Total Reports</span>
                  </div>
                  <div className="text-3xl font-bold text-[#ffffff] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {formatNumber(communityImpact.totalReports)}
                  </div>
                  <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                    Community submissions
                  </p>
                </div>

                <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6 hover:border-[#43cd66]/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#25d366] to-[#43cd66] rounded-xl flex items-center justify-center">
                      <i className="fas fa-check-circle text-[#ffffff] text-lg"></i>
                    </div>
                    <span className="text-[#25d366] text-sm font-semibold">Resolved</span>
                  </div>
                  <div className="text-3xl font-bold text-[#ffffff] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {formatNumber(communityImpact.resolvedReports)}
                  </div>
                  <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                    {communityImpact.resolutionRate}% resolution rate
                  </p>
                </div>

                <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6 hover:border-[#43cd66]/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#e6ffda] to-[#43cd66] rounded-xl flex items-center justify-center">
                      <i className="fas fa-users text-[#111b21] text-lg"></i>
                    </div>
                    <span className="text-[#e6ffda] text-sm font-semibold">Active Users</span>
                  </div>
                  <div className="text-3xl font-bold text-[#ffffff] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {formatNumber(communityImpact.activeUsers)}
                  </div>
                  <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                    Community members
                  </p>
                </div>

                <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6 hover:border-[#43cd66]/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#43cd66] to-[#e6ffda] rounded-xl flex items-center justify-center">
                      <i className="fas fa-heart text-[#111b21] text-lg"></i>
                    </div>
                    <span className="text-[#43cd66] text-sm font-semibold">Engagement</span>
                  </div>
                  <div className="text-3xl font-bold text-[#ffffff] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                    {communityImpact.communityEngagement}%
                  </div>
                  <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                    Community participation
                  </p>
                </div>
              </div>

              {/* Predictions & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                  <h3 className="text-xl font-bold text-[#ffffff] mb-4 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                    <i className="fas fa-crystal-ball text-[#43cd66] mr-3"></i>
                    Predictions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#111b2133] rounded-xl">
                      <div>
                        <p className="text-[#ffffff] font-semibold" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Next Hotspot</p>
                        <p className="text-[#5e5e5e] text-sm">{insights.predictions?.nextHotspot || 'N/A'}</p>
                      </div>
                      <i className="fas fa-map-marker-alt text-[#43cd66] text-xl"></i>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#111b2133] rounded-xl">
                      <div>
                        <p className="text-[#ffffff] font-semibold" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Expected Volume</p>
                        <p className="text-[#5e5e5e] text-sm">{insights.predictions?.expectedVolume || 0} reports</p>
                      </div>
                      <i className="fas fa-chart-line text-[#25d366] text-xl"></i>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#111b2133] rounded-xl">
                      <div>
                        <p className="text-[#ffffff] font-semibold" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Budget Forecast</p>
                        <p className="text-[#5e5e5e] text-sm">KSh {insights.predictions?.budgetForecast?.toLocaleString() || 0}</p>
                      </div>
                      <i className="fas fa-money-bill-wave text-[#e6ffda] text-xl"></i>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                  <h3 className="text-xl font-bold text-[#ffffff] mb-4 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                    <i className="fas fa-lightbulb text-[#25d366] mr-3"></i>
                    Top Recommendations
                  </h3>
                  <div className="space-y-3">
                    {insights.recommendations?.immediateActions?.slice(0, 4).map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#111b2133] rounded-xl">
                        <div className="w-6 h-6 bg-[#43cd66] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="fas fa-check text-[#ffffff] text-xs"></i>
                        </div>
                        <p className="text-[#ffffff] text-sm leading-relaxed" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                          {action}
                        </p>
                      </div>
                    )) || <p className="text-[#5e5e5e]">No immediate actions required</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <h3 className="text-xl font-bold text-[#ffffff] mb-6 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <i className="fas fa-chart-line text-[#43cd66] mr-3"></i>
                  Trend Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[#111b2133] rounded-xl">
                    <div className="text-2xl font-bold text-[#43cd66] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                      {insights.trendAnalysis?.infrastructureGrowth || 0}%
                    </div>
                    <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Infrastructure Growth</p>
                  </div>
                  <div className="text-center p-4 bg-[#111b2133] rounded-xl">
                    <div className="text-2xl font-bold text-[#25d366] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                      {insights.trendAnalysis?.safetyTrends || 0}%
                    </div>
                    <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Safety Trends</p>
                  </div>
                  <div className="text-center p-4 bg-[#111b2133] rounded-xl">
                    <div className="text-2xl font-bold text-[#e6ffda] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                      {insights.trendAnalysis?.environmentalImpact || 0}%
                    </div>
                    <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Environmental Impact</p>
                  </div>
                  <div className="text-center p-4 bg-[#111b2133] rounded-xl">
                    <div className="text-2xl font-bold text-[#ffffff] mb-2" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                      {insights.trendAnalysis?.averageResponseTime || 0}h
                    </div>
                    <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>Avg Response Time</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <h3 className="text-xl font-bold text-[#ffffff] mb-6 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <i className="fas fa-shield-alt text-[#25d366] mr-3"></i>
                  Preventive Measures
                </h3>
                <div className="space-y-3">
                  {insights.recommendations?.preventiveMeasures?.map((measure, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[#111b2133] rounded-xl">
                      <div className="w-6 h-6 bg-[#25d366] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="fas fa-shield-alt text-[#ffffff] text-xs"></i>
                      </div>
                      <p className="text-[#ffffff] text-sm leading-relaxed" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                        {measure}
                      </p>
                    </div>
                  )) || <p className="text-[#5e5e5e]">No preventive measures suggested</p>}
                </div>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && leaderboard && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <h3 className="text-xl font-bold text-[#ffffff] mb-6 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <i className="fas fa-trophy text-[#43cd66] mr-3"></i>
                  Community Leaderboard
                </h3>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={user.userId} className="flex items-center gap-4 p-4 bg-[#111b2133] rounded-xl hover:bg-[#111b2166] transition-all duration-300">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-[#111b21]' :
                        index === 1 ? 'bg-gray-400 text-[#111b21]' :
                        index === 2 ? 'bg-yellow-600 text-[#111b21]' :
                        'bg-[#43cd66] text-[#ffffff]'
                      }`} style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-[#ffffff]" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                            {user.userId?.replace('+254', '') || 'Anonymous'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getLevelColor(user.level)}`}>
                            Level {user.level}
                          </span>
                        </div>
                        <p className="text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>{user.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#43cd66] text-lg" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                          {user.totalPoints}
                        </p>
                        <p className="text-[#5e5e5e] text-xs">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <h3 className="text-xl font-bold text-[#ffffff] mb-6 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <i className="fas fa-heart text-[#25d366] mr-3"></i>
                  Engagement
                </h3>
                <div className="space-y-4">
                  {insights?.recommendations?.communityEngagement?.map((engagement, index) => (
                    <div key={index} className="p-4 bg-[#111b2133] rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-users text-[#25d366]"></i>
                        <p className="text-[#ffffff] font-semibold text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                          Initiative {index + 1}
                        </p>
                      </div>
                      <p className="text-[#5e5e5e] text-sm leading-relaxed" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                        {engagement}
                      </p>
                    </div>
                  )) || <p className="text-[#5e5e5e]">No engagement initiatives</p>}
                </div>
              </div>
            </div>
          )}

          {/* Hotspots Tab */}
          {activeTab === 'hotspots' && hotspots && (
            <div className="space-y-6">
              <div className="bg-[#1c1e21]/80 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <h3 className="text-xl font-bold text-[#ffffff] mb-6 flex items-center" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
                  <i className="fas fa-map-marker-alt text-[#43cd66] mr-3"></i>
                  Incident Hotspots ({hotspots.length})
                </h3>
                <div className="grid gap-4">
                  {hotspots.map((hotspot, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-[#111b2133] rounded-xl hover:bg-[#111b2166] transition-all duration-300 group">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#43cd66] to-[#25d366] rounded-xl flex items-center justify-center">
                        <i className="fas fa-map-marker-alt text-[#ffffff]"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-[#ffffff] text-lg" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                            {hotspot.location}
                          </h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(hotspot.riskLevel)}`}>
                            {hotspot.riskLevel} RISK
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[#5e5e5e] text-sm" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-exclamation-triangle text-[#43cd66]"></i>
                            {hotspot.incidents} incidents
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="fas fa-map text-[#25d366]"></i>
                            {hotspot.coordinates?.[0]?.toFixed(4)}, {hotspot.coordinates?.[1]?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="px-4 py-2 bg-[#43cd66]/20 hover:bg-[#43cd66]/30 text-[#43cd66] rounded-xl transition-all duration-300">
                          <i className="fas fa-eye mr-2"></i>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;