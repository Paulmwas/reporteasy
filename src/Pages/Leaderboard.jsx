import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Leaderboards = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [communityImpact, setCommunityImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('leaderboard');
  const [limit, setLimit] = useState(20);

  // Fetch leaderboard data with useCallback to fix ESLint warning
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏆 Fetching leaderboard data...');
      
      const [leaderboardResponse, impactResponse] = await Promise.all([
        api.analytics.getLeaderboard(limit),
        api.analytics.getCommunityImpact()
      ]);
      
      console.log('✅ Leaderboard Response:', leaderboardResponse);
      console.log('✅ Community Impact Response:', impactResponse);
      
      setLeaderboard(leaderboardResponse || []);
      setCommunityImpact(impactResponse);
      
    } catch (err) {
      console.error('❌ Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    console.log('🚀 Leaderboard component mounted');
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Helper functions
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return 'fas fa-trophy';
      case 2: return 'fas fa-medal';
      case 3: return 'fas fa-award';
      default: return 'fas fa-user';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600'; // Gold
      case 2: return 'from-gray-300 to-gray-500'; // Silver
      case 3: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-[#25d366] to-[#43cd66]'; // Green
    }
  };

  const getTitleBadgeColor = (title) => {
    switch (title) {
      case 'Community Champion':
      case 'Active Citizen': 
        return 'bg-[#25d366] text-white';
      case 'Safety Guardian':
      case 'Eco Warrior':
        return 'bg-[#43cd66] text-white';
      case 'New Reporter':
      case 'Rising Star':
        return 'bg-[#e6ffda] text-[#111b21]';
      default:
        return 'bg-[#5e5e5e] text-white';
    }
  };

  const getPointsColor = (points) => {
    if (points >= 100) return 'text-[#25d366]';
    if (points >= 50) return 'text-[#43cd66]';
    return 'text-[#5e5e5e]';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Debug function to test API directly
  const testAPIConnection = async () => {
    try {
      console.log('🧪 Testing Leaderboard API Connection...');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Current Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      if (!token) {
        console.log('🔐 No token found, attempting login...');
        try {
          const loginResponse = await api.auth.login({
            email: 'movineee@gmail.com',
            password: 'ocholamo1'
          });
          console.log('✅ Login successful:', loginResponse);
        } catch (loginErr) {
          console.error('❌ Login failed:', loginErr);
          return;
        }
      }
      
      console.log('🏆 Testing Leaderboard endpoint...');
      const leaderboardResponse = await api.analytics.getLeaderboard(10);
      console.log('✅ Leaderboard Response:', leaderboardResponse);
      
      console.log('📊 Testing Community Impact endpoint...');
      const impactResponse = await api.analytics.getCommunityImpact();
      console.log('✅ Community Impact Response:', impactResponse);
      
      console.log('🎉 API test successful, refreshing main data...');
      fetchLeaderboard();
      
    } catch (err) {
      console.error('❌ API Test Failed:', err);
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-[#111b21] p-6" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        <div className="max-w-7xl mx-auto">
          {/* Debug Panel */}
          <div className="mb-4 p-4 bg-[#25d366]/10 border border-[#25d366]/20 rounded-xl">
            <button 
              onClick={testAPIConnection}
              className="px-4 py-2 bg-[#25d366]/20 text-[#25d366] rounded-lg hover:bg-[#25d366]/30 transition-all"
            >
              🧪 Test API Connection
            </button>
            <p className="text-[#25d366] text-sm mt-2">Check browser console for detailed logs</p>
          </div>
          
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-[#5e5e5e]/30 rounded w-48 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="bg-[#1c1e21] rounded-2xl p-6 border border-[#25d366]/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-4 bg-[#5e5e5e]/30 rounded w-32 mb-2"></div>
                      <div className="h-6 bg-[#5e5e5e]/30 rounded w-full mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-[#5e5e5e]/30 rounded w-20"></div>
                        <div className="h-6 bg-[#5e5e5e]/30 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-24 h-8 bg-[#5e5e5e]/30 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111b21] relative overflow-hidden" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#25d366]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#43cd66]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C1FF72] via-[#00D4B2] to-[#4ECDC4] bg-clip-text text-transparent mb-2">
                  🏆 Community Leaderboards
                </h1>
                <p className="text-[#5e5e5e] text-lg">
                  Celebrating our most active community reporters • {leaderboard.length} champions
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={testAPIConnection}
                  className="inline-flex items-center px-4 py-2 bg-[#25d366]/20 text-[#25d366] rounded-xl hover:bg-[#25d366]/30 transition-all duration-300"
                >
                  🧪 Test API
                </button>
                <button 
                  onClick={() => fetchLeaderboard()}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#25d366] to-[#43cd66] text-[#ffffff] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedTab('leaderboard')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedTab === 'leaderboard'
                    ? 'bg-[#25d366] text-[#ffffff]'
                    : 'bg-[#1c1e21] text-[#5e5e5e] hover:text-[#ffffff] border border-[#25d366]/30'
                }`}
              >
                <i className="fas fa-trophy mr-2"></i>
                Leaderboard
              </button>
              <button
                onClick={() => setSelectedTab('impact')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedTab === 'impact'
                    ? 'bg-[#25d366] text-[#ffffff]'
                    : 'bg-[#1c1e21] text-[#5e5e5e] hover:text-[#ffffff] border border-[#25d366]/30'
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Community Impact
              </button>
            </div>

            {/* Limit Selection */}
            {selectedTab === 'leaderboard' && (
              <div className="bg-[#1c1e21] backdrop-blur-sm rounded-2xl border border-[#25d366]/20 p-6">
                <div className="flex items-center gap-4">
                  <label className="text-[#ffffff] font-medium">Show:</label>
                  <select 
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-[#111b21] border border-[#25d366]/30 text-[#ffffff] rounded-xl px-4 py-3 focus:outline-none focus:border-[#25d366]/50 focus:ring-2 focus:ring-[#25d366]/20"
                  >
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                  </select>
                </div>
              </div>
            )}
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

          {/* Debug Info Panel */}
          <div className="mb-6 bg-[#1c1e21]/60 border border-[#5e5e5e]/30 rounded-2xl p-4">
            <h3 className="text-[#ffffff] text-sm font-semibold mb-2">Debug Information:</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs text-[#5e5e5e]">
              <div>Leaders Loaded: <span className="text-[#ffffff]">{leaderboard.length}</span></div>
              <div>Community Impact: <span className="text-[#ffffff]">{communityImpact ? 'Loaded' : 'Loading'}</span></div>
              <div>Loading: <span className="text-[#ffffff]">{loading ? 'Yes' : 'No'}</span></div>
              <div>Error: <span className="text-[#ffffff]">{error ? 'Yes' : 'No'}</span></div>
              <div>Token: <span className="text-[#ffffff]">{localStorage.getItem('token') ? 'Present' : 'Missing'}</span></div>
              <div>API Status: <span className="text-[#25d366]">Ready</span></div>
            </div>
          </div>

          {/* Content based on selected tab */}
          {selectedTab === 'leaderboard' && (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#C1FF72] via-[#00D4B2] to-[#4ECDC4] bg-clip-text text-transparent mb-6 text-center">🏆 Hall of Fame</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {leaderboard.slice(0, 3).map((user, index) => (
                      <div key={user.userId || index} className={`relative bg-gradient-to-br ${getRankColor(user.rank)} p-1 rounded-2xl ${user.rank === 1 ? 'md:order-2 transform md:scale-110' : user.rank === 2 ? 'md:order-1' : 'md:order-3'}`}>
                        <div className="bg-[#1c1e21] rounded-2xl p-6 text-center">
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className={`w-8 h-8 bg-gradient-to-br ${getRankColor(user.rank)} rounded-full flex items-center justify-center`}>
                              <i className={`${getRankIcon(user.rank)} text-[#ffffff] text-sm`}></i>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h3 className="text-xl font-bold text-[#ffffff] mb-2">
                              {user.userId?.replace('whatsapp:', '').replace('+', '') || `User ${index + 1}`}
                            </h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTitleBadgeColor(user.title)} mb-4`}>
                              {user.title || 'Community Member'}
                            </div>
                            <div className="text-3xl font-bold text-[#25d366] mb-2">
                              {user.totalPoints} pts
                            </div>
                            <div className="text-[#5e5e5e] text-sm">
                              Level {user.level || 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Leaderboard */}
              <div className="space-y-4 " >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#C1FF72] via-[#00D4B2] to-[#4ECDC4] bg-clip-text text-transparent mb-6"> Complete Rankings</h2>
                {leaderboard.map((user, index) => (
                  <div key={user.userId || index} className={`group bg-[#1c1e21] backdrop-blur-sm rounded-2xl border transition-all duration-300 p-6 ${user.rank <= 3 ? 'border-[#25d366]/40 shadow-lg' : 'border-[#25d366]/20 hover:border-[#25d366]/40'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(user.rank)} rounded-full flex items-center justify-center font-bold text-[#ffffff]`}>
                          {user.rank <= 3 ? (
                            <i className={`${getRankIcon(user.rank)} text-lg`}></i>
                          ) : (
                            user.rank
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#ffffff]">
                              {user.userId?.replace('whatsapp:', '').replace('+', '') || `User ${index + 1}`}
                            </h3>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTitleBadgeColor(user.title)}`}>
                              {user.title || 'Community Member'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-[#5e5e5e]">
                            <span>Level {user.level || 1}</span>
                            <span>•</span>
                            <span>Rank #{user.rank}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getPointsColor(user.totalPoints)} mb-1`}>
                          {user.totalPoints}
                        </div>
                        <div className="text-[#5e5e5e] text-sm">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {leaderboard.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#25d366]/20 rounded-full mb-4">
                    <i className="fas fa-trophy text-[#25d366] text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-[#ffffff] mb-2">No Leaderboard Data</h3>
                  <p className="text-[#5e5e5e]">Start reporting issues to see community champions!</p>
                  <button 
                    onClick={testAPIConnection}
                    className="mt-4 px-6 py-3 bg-[#25d366]/20 text-[#25d366] rounded-xl hover:bg-[#25d366]/30 transition-all"
                  >
                    🧪 Test API Connection
                  </button>
                </div>
              )}
            </>
          )}

          {selectedTab === 'impact' && communityImpact && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1c1e21] rounded-2xl p-6 border border-[#25d366]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#25d366]/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-file-alt text-[#25d366] text-xl"></i>
                  </div>
                  <span className="text-[#25d366] text-sm font-medium">Reports</span>
                </div>
                <div className="text-3xl font-bold text-[#ffffff] mb-2">
                  {communityImpact.totalReports}
                </div>
                <div className="text-[#5e5e5e] text-sm">Total Reports</div>
              </div>

              <div className="bg-[#1c1e21] rounded-2xl p-6 border border-[#25d366]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#43cd66]/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-[#43cd66] text-xl"></i>
                  </div>
                  <span className="text-[#43cd66] text-sm font-medium">Resolved</span>
                </div>
                <div className="text-3xl font-bold text-[#ffffff] mb-2">
                  {communityImpact.resolvedReports}
                </div>
                <div className="text-[#5e5e5e] text-sm">Issues Resolved</div>
              </div>

              <div className="bg-[#1c1e21] rounded-2xl p-6 border border-[#25d366]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#e6ffda]/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-percentage text-[#25d366] text-xl"></i>
                  </div>
                  <span className="text-[#25d366] text-sm font-medium">Success</span>
                </div>
                <div className="text-3xl font-bold text-[#ffffff] mb-2">
                  {communityImpact.resolutionRate}%
                </div>
                <div className="text-[#5e5e5e] text-sm">Resolution Rate</div>
              </div>

              <div className="bg-[#1c1e21] rounded-2xl p-6 border border-[#25d366]/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#25d366]/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-[#25d366] text-xl"></i>
                  </div>
                  <span className="text-[#25d366] text-sm font-medium">Active</span>
                </div>
                <div className="text-3xl font-bold text-[#ffffff] mb-2">
                  {communityImpact.activeUsers}
                </div>
                <div className="text-[#5e5e5e] text-sm">Active Users</div>
              </div>

              <div className="md:col-span-2 lg:col-span-4 bg-[#1c1e21] rounded-2xl p-6 border border-[#25d366]/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#ffffff]">Community Engagement</h3>
                  <div className="w-12 h-12 bg-[#25d366]/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-heart text-[#25d366] text-xl"></i>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-[#111b21] rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#25d366] to-[#43cd66] h-full transition-all duration-500"
                      style={{ width: `${Math.min(communityImpact.communityEngagement, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-2xl font-bold text-[#25d366]">
                    {communityImpact.communityEngagement}%
                  </span>
                </div>
                <div className="text-[#5e5e5e] text-sm mt-2">Overall community participation score</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;