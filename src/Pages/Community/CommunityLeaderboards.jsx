import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CommunityLeaderboards = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [communityImpact, setCommunityImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('leaderboard');
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();

  // API Client Configuration
  const apiClient = axios.create({
    baseURL: 'https://reporteasy-api.onrender.com/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Add request interceptor for auth token
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      return Promise.reject(error.response?.data || error.message);
    }
  );

  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have a token, if not attempt to login
      if (!localStorage.getItem('token')) {
        await handleLogin();
      }

      const [leaderboardRes, impactRes] = await Promise.all([
        apiClient.get(`/analytics/leaderboard?limit=${limit}`),
        apiClient.get('/analytics/community-impact')
      ]);

      setLeaderboard(leaderboardRes || []);
      setCommunityImpact(impactRes || {});
      
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [limit, navigate]);

  // Handle login if no token exists
  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/admin/login', {
        email: 'movineee@gmail.com',
        password: 'ocholamo1'
      });
      localStorage.setItem('token', response.token);
    } catch (loginError) {
      console.error('Login failed:', loginError);
      throw new Error('Authentication failed. Please refresh the page.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions for UI
  const getRankBadge = (rank) => {
    const rankColors = {
      1: { bg: 'from-yellow-400 to-yellow-600', icon: '🥇' },
      2: { bg: 'from-gray-300 to-gray-500', icon: '🥈' },
      3: { bg: 'from-amber-600 to-amber-800', icon: '🥉' },
      default: { bg: 'from-green-500 to-green-700', icon: '🏅' }
    };

    const { bg, icon } = rankColors[rank] || rankColors.default;
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${bg} text-white`}>
        {rank <= 3 ? icon : rank}
      </div>
    );
  };

  const getUserTitleBadge = (title) => {
    if (!title) return null;
    
    const badgeClasses = {
      'Community Champion': 'bg-purple-100 text-purple-800',
      'Active Citizen': 'bg-blue-100 text-blue-800',
      'Safety Guardian': 'bg-red-100 text-red-800',
      'Eco Warrior': 'bg-green-100 text-green-800',
      'New Reporter': 'bg-gray-100 text-gray-800',
      default: 'bg-gray-100 text-gray-800'
    };

    const badgeClass = badgeClasses[title] || badgeClasses.default;
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>
        {title}
      </span>
    );
  };

  const formatPhoneNumber = (userId) => {
    if (!userId) return 'Anonymous';
    return userId.replace('whatsapp:', '').replace('+', '');
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {error}
            <button 
              onClick={fetchData}
              className="ml-2 text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
            >
              Retry
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((position) => {
            const user = leaderboard[position];
            if (!user) return null;
            
            return (
              <div 
                key={user.userId} 
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  position === 0 ? 'md:order-2 transform md:scale-105' : 
                  position === 1 ? 'md:order-1' : 'md:order-3'
                }`}
              >
                <div className={`h-2 ${
                  position === 0 ? 'bg-y-400' : 
                  position === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}></div>
                <div className="p-4 text-center">
                  {getRankBadge(user.rank)}
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    {formatPhoneNumber(user.userId)}
                  </h3>
                  {getUserTitleBadge(user.title)}
                  <div className="mt-2 text-2xl font-bold text-green-600">
                    {user.totalPoints} pts
                  </div>
                  <div className="text-sm text-gray-500">
                    Level {user.level || 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((user, index) => (
              <tr key={user.userId || index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getRankBadge(user.rank)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPhoneNumber(user.userId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getUserTitleBadge(user.title)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.level || 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  {user.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCommunityImpact = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communityImpact && (
        <>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{communityImpact.totalReports || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Resolved Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{communityImpact.resolvedReports || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Resolution Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{communityImpact.resolutionRate || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{communityImpact.activeUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Community Engagement</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-600 h-4 rounded-full" 
                style={{ width: `${communityImpact.communityEngagement || 0}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {communityImpact.communityEngagement || 0}% of community members actively participate
            </p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Community Leaderboards</h1>
          <p className="text-lg text-gray-500">
            Recognizing our most active community members and their impact
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('leaderboard')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'leaderboard'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setSelectedTab('impact')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'impact'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Community Impact
            </button>
          </nav>
        </div>

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          {selectedTab === 'leaderboard' && (
            <div className="flex items-center space-x-4">
              <label htmlFor="limit" className="text-sm font-medium text-gray-700">
                Show:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Content */}
        {error ? renderErrorState() : 
         loading ? renderLoadingSkeleton() : 
         selectedTab === 'leaderboard' ? renderLeaderboard() : 
         renderCommunityImpact()}
      </div>
    </div>
  );
};

export default CommunityLeaderboards;