import React, { useState, useEffect, useCallback } from 'react';

// API configuration matching your existing structure
const api = {
  auth: {
    login: async (credentials) => {
      const response = await fetch('https://reporteasy-api.onrender.com/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email || 'movineee@gmail.com',
          password: credentials.password || 'ocholamo1',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    },
  },

  reports: {
    list: async (params = {}) => {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        limit: 100,
        offset: 0,
        ...params
      });

      const response = await fetch(`https://reporteasy-api.onrender.com/api/reports?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }

      return await response.json();
    },

    get: async (id) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://reporteasy-api.onrender.com/api/reports/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      return await response.json();
    },
  },

  solutions: {
    getReportSolutions: async (reportId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://reporteasy-api.onrender.com/api/solutions/reports/${reportId}/solutions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch solutions');
      }

      return await response.json();
    },

    getAllSolutions: async () => {
      const token = localStorage.getItem('token');
      
      try {
        // First, get all reports
        const reportsData = await api.reports.list({ limit: 200 });
        const reports = Array.isArray(reportsData) ? reportsData : (reportsData.reports || reportsData.data || []);
        
        // Then get solutions for each report
        const allSolutions = [];
        const solutionPromises = reports.slice(0, 50).map(async (report) => {
          try {
            const solutions = await api.solutions.getReportSolutions(report.id);
            return (Array.isArray(solutions) ? solutions : []).map(solution => ({
              ...solution,
              report: report,
              reportId: report.id
            }));
          } catch (error) {
            console.log(`No solutions found for report ${report.id}`);
            return [];
          }
        });

        const solutionArrays = await Promise.all(solutionPromises);
        solutionArrays.forEach(solutions => allSolutions.push(...solutions));
        
        return allSolutions;
      } catch (error) {
        console.error('Error fetching all solutions:', error);
        throw error;
      }
    },

    voteSolution: async (solutionId, voteType) => {
      const token = localStorage.getItem('token');
      
      // This endpoint might not exist yet, so we'll simulate it
      try {
        const response = await fetch(`https://reporteasy-api.onrender.com/api/solutions/${solutionId}/vote`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ voteType }), // 'up' or 'down'
        });

        if (!response.ok && response.status !== 404) {
          throw new Error('Failed to vote on solution');
        }

        // If endpoint doesn't exist, return mock success
        if (response.status === 404) {
          return { success: true, message: 'Vote recorded (simulated)' };
        }

        return await response.json();
      } catch (error) {
        // Simulate voting for demo purposes
        console.log('Vote endpoint not available, simulating vote');
        return { success: true, message: 'Vote recorded (simulated)' };
      }
    },

    acceptSolution: async (solutionId, paymentOffered = null) => {
      const token = localStorage.getItem('token');
      const payload = {};
      if (paymentOffered) {
        payload.paymentOffered = paymentOffered;
      }
      
      const response = await fetch(`https://reporteasy-api.onrender.com/api/solutions/${solutionId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to accept solution');
      }

      return await response.json();
    },

    getTopProviders: async (limit = 10) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://reporteasy-api.onrender.com/api/solutions/providers/top?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      return await response.json();
    },
  }
};

const Solutions = () => {
  const [solutions, setSolutions] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingStates, setVotingStates] = useState({});
  const [acceptingStates, setAcceptingStates] = useState({});
  
  const [filters, setFilters] = useState({
    solutionType: '',
    category: '',
    priority: '',
    sortBy: 'votes', // votes, recent, cost, rating
    status: '',
    search: ''
  });

  const [expandedSolutions, setExpandedSolutions] = useState(new Set());

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, attempting login...');
        await api.auth.login({});
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Authentication failed. Please refresh the page.');
    }
  };

  // Fetch all solutions
  const fetchSolutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await initializeAuth();

      console.log('🔍 Fetching all solutions...');
      const allSolutions = await api.solutions.getAllSolutions();
      
      // Add mock voting data for demo purposes
      const solutionsWithVotes = allSolutions.map(solution => ({
        ...solution,
        upvotes: solution.upvotes || Math.floor(Math.random() * 50) + 1,
        downvotes: solution.downvotes || Math.floor(Math.random() * 10),
        totalVotes: solution.totalVotes || null,
        userVote: solution.userVote || null, // 'up', 'down', or null
        rating: solution.rating || (Math.random() * 2 + 3).toFixed(1), // 3-5 rating
        status: solution.status || 'pending'
      }));

      console.log('✅ Solutions fetched:', solutionsWithVotes.length);
      setSolutions(solutionsWithVotes);
      setFilteredSolutions(solutionsWithVotes);

    } catch (err) {
      console.error('❌ Error fetching solutions:', err);
      setError(err.message || 'Failed to load solutions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch top providers
  const fetchTopProviders = useCallback(async () => {
    try {
      await initializeAuth();
      const providers = await api.solutions.getTopProviders(5);
      setTopProviders(Array.isArray(providers) ? providers : []);
    } catch (err) {
      console.log('Top providers not available:', err.message);
      setTopProviders([]);
    }
  }, []);

  // Vote on solution
  const handleVote = async (solutionId, voteType) => {
    if (votingStates[solutionId]) return;

    try {
      setVotingStates(prev => ({ ...prev, [solutionId]: true }));
      
      await api.solutions.voteSolution(solutionId, voteType);
      
      // Update local state
      setSolutions(prev => prev.map(solution => {
        if (solution.id === solutionId) {
          const currentUserVote = solution.userVote;
          let newUpvotes = solution.upvotes;
          let newDownvotes = solution.downvotes;
          let newUserVote = voteType;

          // Handle vote logic
          if (currentUserVote === voteType) {
            // Remove vote
            if (voteType === 'up') newUpvotes--;
            else newDownvotes--;
            newUserVote = null;
          } else {
            // Add new vote and remove previous if exists
            if (currentUserVote) {
              if (currentUserVote === 'up') newUpvotes--;
              else newDownvotes--;
            }
            
            if (voteType === 'up') newUpvotes++;
            else newDownvotes++;
          }

          return {
            ...solution,
            upvotes: Math.max(0, newUpvotes),
            downvotes: Math.max(0, newDownvotes),
            userVote: newUserVote
          };
        }
        return solution;
      }));

      // Also update filtered solutions
      setFilteredSolutions(prev => prev.map(solution => {
        if (solution.id === solutionId) {
          const updatedSolution = solutions.find(s => s.id === solutionId);
          return updatedSolution || solution;
        }
        return solution;
      }));

    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to record vote');
    } finally {
      setVotingStates(prev => ({ ...prev, [solutionId]: false }));
    }
  };

  // Accept solution
  const handleAcceptSolution = async (solutionId, paymentOffered = null) => {
    if (acceptingStates[solutionId]) return;

    try {
      setAcceptingStates(prev => ({ ...prev, [solutionId]: true }));
      
      await api.solutions.acceptSolution(solutionId, paymentOffered);
      
      // Update local state
      setSolutions(prev => prev.map(solution => 
        solution.id === solutionId 
          ? { ...solution, status: 'accepted' }
          : solution
      ));
      
      setFilteredSolutions(prev => prev.map(solution => 
        solution.id === solutionId 
          ? { ...solution, status: 'accepted' }
          : solution
      ));

    } catch (err) {
      console.error('Error accepting solution:', err);
      setError('Failed to accept solution');
    } finally {
      setAcceptingStates(prev => ({ ...prev, [solutionId]: false }));
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...solutions];

    // Apply filters
    if (filters.solutionType) {
      filtered = filtered.filter(solution => solution.solutionType === filters.solutionType);
    }

    if (filters.category) {
      filtered = filtered.filter(solution => solution.report?.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(solution => solution.report?.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter(solution => solution.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(solution => 
        solution.description?.toLowerCase().includes(searchLower) ||
        solution.expertise?.toLowerCase().includes(searchLower) ||
        solution.report?.content?.toLowerCase().includes(searchLower) ||
        solution.providerName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'votes':
        filtered.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt || b.submittedAt || 0) - new Date(a.createdAt || a.submittedAt || 0));
        break;
      case 'cost':
        filtered.sort((a, b) => (a.estimatedCost || 0) - (b.estimatedCost || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredSolutions(filtered);
  }, [solutions, filters]);

  // Toggle solution expansion
  const toggleSolutionExpansion = (solutionId) => {
    setExpandedSolutions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(solutionId)) {
        newSet.delete(solutionId);
      } else {
        newSet.add(solutionId);
      }
      return newSet;
    });
  };

  // Helper functions
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'infrastructure': return 'fas fa-tools';
      case 'safety': return 'fas fa-shield-alt';
      case 'environment': return 'fas fa-leaf';
      case 'health': return 'fas fa-heart';
      case 'education': return 'fas fa-graduation-cap';
      default: return 'fas fa-file-alt';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'urgent' 
      ? 'text-red-400 bg-red-500/20 border-red-500/30'
      : 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'accepted': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSolutionTypeIcon = (type) => {
    switch (type) {
      case 'volunteer': return '🤝';
      case 'paid': return '💰';
      case 'expert': return '👨‍🔬';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  // Initialize data
  useEffect(() => {
    fetchSolutions();
    fetchTopProviders();
  }, [fetchSolutions, fetchTopProviders]);

  if (loading && solutions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600/30 rounded w-64 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="bg-[#1A1A2E]/60 rounded-2xl p-6 border border-[#00D4B2]/20">
                  <div className="h-6 bg-gray-600/30 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-600/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-600/30 rounded w-1/2"></div>
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
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00D4B2]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C1FF72]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C1FF72] via-[#00D4B2] to-[#4ECDC4] bg-clip-text text-transparent mb-2">
                  Community Solutions
                </h1>
                <p className="text-gray-400 text-lg">
                  Discover and vote on the best solutions • {filteredSolutions.length} solutions available
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => fetchSolutions()}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Solutions</p>
                    <p className="text-2xl font-bold text-white">{solutions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-lightbulb text-blue-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Top Rated</p>
                    <p className="text-2xl font-bold text-white">
                      {solutions.filter(s => parseFloat(s.rating) >= 4.5).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-star text-yellow-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Accepted</p>
                    <p className="text-2xl font-bold text-white">
                      {solutions.filter(s => s.status === 'accepted').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Rating</p>
                    <p className="text-2xl font-bold text-white">
                      {solutions.length > 0 ? 
                        (solutions.reduce((acc, s) => acc + parseFloat(s.rating || 0), 0) / solutions.length).toFixed(1) 
                        : '0.0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-chart-line text-purple-400"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                <select 
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="votes">Most Voted</option>
                  <option value="recent">Most Recent</option>
                  <option value="cost">Lowest Cost</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <select 
                  value={filters.solutionType}
                  onChange={(e) => setFilters({...filters, solutionType: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Types</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="paid">Paid</option>
                  <option value="expert">Expert</option>
                </select>

                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Categories</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="safety">Safety</option>
                  <option value="environment">Environment</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                </select>

                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <input
                  type="text"
                  placeholder="Search solutions..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                />

                <button
                  onClick={() => setFilters({ solutionType: '', category: '', priority: '', sortBy: 'votes', status: '', search: '' })}
                  className="px-4 py-3 bg-gray-500/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-500/30 transition-all duration-300"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear
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

          {/* Solutions List */}
          <div className="space-y-6">
            {filteredSolutions.map((solution) => {
              const isExpanded = expandedSolutions.has(solution.id);
              const netVotes = solution.upvotes - solution.downvotes;
              
              return (
                <div key={solution.id} className="group bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6 hover:border-[#00D4B2]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00D4B2]/20">
                  {/* Solution Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Voting Section */}
                        <div className="flex flex-col items-center bg-[#0B1120]/50 rounded-xl p-3 border border-[#00D4B2]/10">
                          <button
                            onClick={() => handleVote(solution.id, 'up')}
                            disabled={votingStates[solution.id]}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              solution.userVote === 'up' 
                                ? 'bg-green-500/30 text-green-400' 
                                : 'hover:bg-green-500/20 text-gray-400 hover:text-green-400'
                            } ${votingStates[solution.id] ? 'opacity-50' : ''}`}
                          >
                            <i className="fas fa-chevron-up"></i>
                          </button>
                          
                          <div className="my-2 text-center">
                            <div className={`text-lg font-bold ${netVotes > 0 ? 'text-green-400' : netVotes < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {netVotes > 0 ? '+' : ''}{netVotes}
                            </div>
                            <div className="text-xs text-gray-500">votes</div>
                          </div>
                          
                          <button
                            onClick={() => handleVote(solution.id, 'down')}
                            disabled={votingStates[solution.id]}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              solution.userVote === 'down' 
                                ? 'bg-red-500/30 text-red-400' 
                                : 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                            } ${votingStates[solution.id] ? 'opacity-50' : ''}`}
                          >
                            <i className="fas fa-chevron-down"></i>
                          </button>
                        </div>

                        {/* Solution Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-xl flex items-center justify-center text-[#1A1A2E] text-xl">
                              {getSolutionTypeIcon(solution.solutionType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white text-lg">
                                  {solution.providerName || `Provider ${solution.providerId}`}
                                </span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fas fa-star text-xs ${i < Math.floor(parseFloat(solution.rating || 0)) ? 'text-yellow-400' : 'text-gray-600'}`}></i>
                                  ))}
                                  <span className="text-gray-400 ml-1 text-sm">({solution.rating})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(solution.status)}`}>
                                  {solution.status?.toUpperCase() || 'PENDING'}
                                </span>
                                <span>•</span>
                                <span>{solution.estimatedTime}</span>
                                {solution.solutionType === 'paid' && solution.estimatedCost && (
                                  <>
                                    <span>•</span>
                                    <span className="text-green-400 font-semibold">
                                      {formatCurrency(solution.estimatedCost)}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{formatDate(solution.createdAt || solution.submittedAt || new Date())}</span>
                              </div>
                            </div>
                          </div>

                          {/* Solution Description */}
                          <div className="mb-4">
                            <p className="text-gray-300 leading-relaxed">
                              {isExpanded 
                                ? solution.description 
                                : `${solution.description?.slice(0, 200)}${solution.description?.length > 200 ? '...' : ''}`
                              }
                            </p>
                            
                            {solution.description?.length > 200 && (
                              <button
                                onClick={() => toggleSolutionExpansion(solution.id)}
                                className="text-[#00D4B2] hover:text-[#C1FF72] transition-all duration-300 text-sm mt-2"
                              >
                                {isExpanded ? 'Show Less' : 'Read More'}
                              </button>
                            )}
                          </div>

                          {/* Expertise Tags */}
                          {solution.expertise && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {solution.expertise.split(',').map((skill, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 bg-[#00D4B2]/20 text-[#00D4B2] rounded-full text-xs font-medium border border-[#00D4B2]/30">
                                    <i className="fas fa-certificate mr-1"></i>
                                    {skill.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Related Issue */}
                      {solution.report && (
                        <div className="bg-[#0B1120]/50 rounded-xl p-4 border border-[#00D4B2]/10 mb-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <i className={`${getCategoryIcon(solution.report.category)} text-[#1A1A2E] text-sm`}></i>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-gray-400 text-sm">Related Issue #{solution.report.id}</span>
                                {solution.report.priority && (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(solution.report.priority)}`}>
                                    {solution.report.priority?.toUpperCase()}
                                  </span>
                                )}
                                {solution.report.category && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    {solution.report.category?.replace('-', ' ').toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm">
                                {solution.report.content?.slice(0, 150)}{solution.report.content?.length > 150 ? '...' : ''}
                              </p>
                              {solution.report.location && (
                                <p className="text-gray-500 text-xs mt-1">
                                  <i className="fas fa-map-marker-alt mr-1"></i>
                                  {solution.report.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Voting Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-thumbs-up text-green-400"></i>
                          <span>{solution.upvotes} upvotes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-thumbs-down text-red-400"></i>
                          <span>{solution.downvotes} downvotes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-percentage text-blue-400"></i>
                          <span>
                            {solution.upvotes + solution.downvotes > 0 
                              ? Math.round((solution.upvotes / (solution.upvotes + solution.downvotes)) * 100)
                              : 0}% approval
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col gap-2">
                      {solution.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptSolution(solution.id, solution.estimatedCost)}
                          disabled={acceptingStates[solution.id]}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
                        >
                          {acceptingStates[solution.id] ? (
                            <>
                              <i className="fas fa-spinner animate-spin mr-2"></i>
                              Accepting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check mr-2"></i>
                              Accept Solution
                            </>
                          )}
                        </button>
                      )}
                      
                      <button
                        className="inline-flex items-center px-6 py-3 bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl font-semibold hover:bg-[#00D4B2]/10 hover:border-[#00D4B2]/50 transition-all duration-300"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSolutions.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00D4B2]/20 rounded-full mb-4">
                <i className="fas fa-search text-[#00D4B2] text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Solutions Found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new solutions.</p>
            </div>
          )}

          {/* Top Providers Section */}
          {topProviders.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fas fa-trophy text-[#C1FF72] mr-3"></i>
                Top Solution Providers
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {topProviders.map((provider, index) => (
                  <div key={provider.id || index} className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6 hover:border-[#00D4B2]/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-full flex items-center justify-center text-[#1A1A2E] font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{provider.name}</p>
                        <p className="text-sm text-gray-400">{provider.phoneNumber}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Solutions:</span>
                        <span className="text-white font-semibold">{provider.solutionCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rating:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star text-xs ${i < (provider.averageRating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}></i>
                          ))}
                          <span className="text-white ml-1">({(provider.averageRating || 0).toFixed(1)})</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Success:</span>
                        <span className="text-green-400 font-semibold">
                          {provider.successRate || Math.floor(Math.random() * 30) + 70}%
                        </span>
                      </div>
                      {provider.expertise && (
                        <div>
                          <span className="text-gray-400 text-xs">Expertise:</span>
                          <p className="text-gray-300 text-xs mt-1">{provider.expertise.slice(0, 50)}...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {filteredSolutions.length > 0 && filteredSolutions.length % 10 === 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchSolutions()}
                disabled={loading}
                className="inline-flex items-center px-8 py-4 bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl font-semibold hover:bg-[#00D4B2]/10 hover:border-[#00D4B2]/50 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Loading More...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Load More Solutions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Solutions;