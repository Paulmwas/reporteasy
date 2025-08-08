import React, { useState, useEffect, useCallback } from 'react';

// Import your actual API - you'll need to make sure this path is correct in your project
const api = {
  // Authentication
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

  // Reports
  reports: {
    list: async (params = {}) => {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        limit: 50,
        offset: 0,
        status: 'open', // Only get open reports for solutions
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
  },

  // Solutions
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
          return []; // No solutions found
        }
        throw new Error('Failed to fetch solutions');
      }

      return await response.json();
    },

    submitSolution: async (reportId, solutionData) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://reporteasy-api.onrender.com/api/solutions/reports/${reportId}/solutions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(solutionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit solution');
      }

      return await response.json();
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
        return []; // Return empty array if endpoint not available
      }

      return await response.json();
    },
  }
};

const CommunitySolutions = () => {
  const [reports, setReports] = useState([]);
  const [reportSolutions, setReportSolutions] = useState({});
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [submittingSolution, setSubmittingSolution] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    location: '',
    solutionType: '' // all, with-solutions, without-solutions
  });

  // Solution form state
  const [solutionForm, setSolutionForm] = useState({
    providerId: '',
    providerName: '',
    providerPhone: '',
    solutionType: 'volunteer',
    description: '',
    estimatedCost: '',
    estimatedTime: '',
    expertise: ''
  });

  // Fetch open reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, attempting login...');
        await api.auth.login({});
      }

      const queryParams = {
        status: 'open',
        limit: 50,
        offset: 0,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && key !== 'solutionType')
        )
      };

      console.log('🔍 Fetching open reports with params:', queryParams);
      
      const response = await api.reports.list(queryParams);
      
      console.log('✅ Reports Response:', response);
      
      // Handle different response structures
      let reportsData = [];
      
      if (Array.isArray(response)) {
        reportsData = response;
      } else if (response && response.reports) {
        reportsData = response.reports;
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          reportsData = response.data;
        } else if (response.data.reports) {
          reportsData = response.data.reports;
        }
      }
      
      // Filter only open reports
      reportsData = reportsData.filter(report => report.status === 'open');
      
      console.log('📊 Filtered Open Reports:', reportsData);
      setReports(reportsData);
      
      // Fetch solutions for each report
      await fetchSolutionsForReports(reportsData);

    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch solutions for multiple reports
  const fetchSolutionsForReports = async (reportsData) => {
    const solutionsMap = {};
    
    for (const report of reportsData.slice(0, 10)) { // Limit to first 10 to avoid too many requests
      try {
        const solutions = await api.solutions.getReportSolutions(report.id);
        solutionsMap[report.id] = Array.isArray(solutions) ? solutions : [];
      } catch (err) {
        console.log(`No solutions found for report ${report.id}`);
        solutionsMap[report.id] = [];
      }
    }
    
    setReportSolutions(solutionsMap);
  };

  // Fetch top providers
  const fetchTopProviders = useCallback(async () => {
    try {
      const providers = await api.solutions.getTopProviders(5);
      setTopProviders(Array.isArray(providers) ? providers : []);
    } catch (err) {
      console.log('Top providers not available:', err.message);
      setTopProviders([]);
    }
  }, []);

  // Submit solution
  const submitSolution = async () => {
    if (!selectedReport) return;

    try {
      setSubmittingSolution(true);
      
      const solutionData = {
        providerId: solutionForm.providerId || `TEMP_${Date.now()}`,
        solutionType: solutionForm.solutionType,
        description: solutionForm.description.trim(),
        estimatedCost: solutionForm.solutionType === 'paid' ? parseInt(solutionForm.estimatedCost) : null,
        estimatedTime: solutionForm.estimatedTime.trim(),
        expertise: solutionForm.expertise.trim(),
      };

      console.log('🚀 Submitting solution:', solutionData);
      
      const response = await api.solutions.submitSolution(selectedReport.id, solutionData);
      
      console.log('✅ Solution submitted:', response);
      
      // Refresh solutions for this report
      const updatedSolutions = await api.solutions.getReportSolutions(selectedReport.id);
      setReportSolutions(prev => ({
        ...prev,
        [selectedReport.id]: Array.isArray(updatedSolutions) ? updatedSolutions : []
      }));
      
      // Reset form and close modal
      setSolutionForm({
        providerId: '',
        providerName: '',
        providerPhone: '',
        solutionType: 'volunteer',
        description: '',
        estimatedCost: '',
        estimatedTime: '',
        expertise: ''
      });
      setShowSolutionModal(false);
      setSelectedReport(null);
      
    } catch (err) {
      console.error('❌ Error submitting solution:', err);
      setError('Failed to submit solution: ' + err.message);
    } finally {
      setSubmittingSolution(false);
    }
  };

  // Filter reports based on solution availability
  const getFilteredReports = () => {
    let filtered = reports;
    
    if (filters.solutionType === 'with-solutions') {
      filtered = filtered.filter(report => 
        reportSolutions[report.id] && reportSolutions[report.id].length > 0
      );
    } else if (filters.solutionType === 'without-solutions') {
      filtered = filtered.filter(report => 
        !reportSolutions[report.id] || reportSolutions[report.id].length === 0
      );
    }
    
    return filtered;
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
    fetchReports();
    fetchTopProviders();
  }, [fetchReports, fetchTopProviders]);

  const filteredReports = getFilteredReports();

  if (loading && reports.length === 0) {
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
                  Crowdsource fixes for community problems • {filteredReports.length} open issues
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => fetchReports()}
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
                    <p className="text-gray-400 text-sm">Open Issues</p>
                    <p className="text-2xl font-bold text-white">{reports.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">With Solutions</p>
                    <p className="text-2xl font-bold text-white">
                      {reports.filter(r => reportSolutions[r.id]?.length > 0).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-lightbulb text-green-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Need Solutions</p>
                    <p className="text-2xl font-bold text-white">
                      {reports.filter(r => !reportSolutions[r.id] || reportSolutions[r.id].length === 0).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-hands-helping text-yellow-400"></i>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Top Providers</p>
                    <p className="text-2xl font-bold text-white">{topProviders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-users text-blue-400"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="normal">Normal</option>
                </select>

                <select 
                  value={filters.solutionType}
                  onChange={(e) => setFilters({...filters, solutionType: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Issues</option>
                  <option value="with-solutions">With Solutions</option>
                  <option value="without-solutions">Need Solutions</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                />

                <button
                  onClick={() => setFilters({ category: '', priority: '', location: '', solutionType: '' })}
                  className="px-4 py-3 bg-gray-500/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-500/30 transition-all duration-300"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear Filters
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

          {/* Issues List */}
          <div className="space-y-6">
            {filteredReports.map((report) => {
              const solutions = reportSolutions[report.id] || [];
              const hasSolutions = solutions.length > 0;
              
              return (
                <div key={report.id} className="group bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6 hover:border-[#00D4B2]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00D4B2]/20">
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-xl flex items-center justify-center`}>
                          <i className={`${getCategoryIcon(report.category)} text-[#1A1A2E] text-lg`}></i>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <span>Issue #{report.id}</span>
                            <span>•</span>
                            <span>{formatDate(report.createdAt)}</span>
                            {report.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center">
                                  <i className="fas fa-map-marker-alt mr-1"></i>
                                  {report.location}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(report.priority)}`}>
                              {report.priority === 'urgent' && <i className="fas fa-exclamation mr-1 text-xs"></i>}
                              {report.priority?.toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              <i className="fas fa-tag mr-1 text-xs"></i>
                              {report.category?.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-white text-lg mb-4 leading-relaxed">
                        {report.content || 'No content available'}
                      </p>

                      {/* Solutions Count */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`flex items-center px-3 py-2 rounded-xl ${hasSolutions ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                          <i className={`fas ${hasSolutions ? 'fa-check-circle' : 'fa-clock'} mr-2`}></i>
                          <span className="text-sm font-semibold">
                            {hasSolutions ? `${solutions.length} Solution${solutions.length > 1 ? 's' : ''} Available` : 'Needs Solutions'}
                          </span>
                        </div>

                        {hasSolutions && (
                          <div className="flex items-center text-sm text-gray-400">
                            <span>{solutions.filter(s => s.solutionType === 'volunteer').length} volunteer</span>
                            <span className="mx-2">•</span>
                            <span>{solutions.filter(s => s.solutionType === 'paid').length} paid</span>
                            <span className="mx-2">•</span>
                            <span>{solutions.filter(s => s.solutionType === 'expert').length} expert</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setShowSolutionModal(true);
                      }}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <i className="fas fa-lightbulb mr-2"></i>
                      Offer Solution
                    </button>
                  </div>

                  {/* Solutions Display */}
                  {hasSolutions && (
                    <div className="mt-6 pt-6 border-t border-[#00D4B2]/20">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-lightbulb text-[#C1FF72] mr-2"></i>
                        Proposed Solutions
                      </h4>
                      
                      <div className="space-y-4">
                        {solutions.slice(0, 3).map((solution, index) => (
                          <div key={solution.id || index} className="bg-[#0B1120]/50 rounded-xl p-4 border border-[#00D4B2]/10">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getSolutionTypeIcon(solution.solutionType)}</span>
                                <div>
                                  <p className="font-semibold text-white">
                                    {solution.providerName || `Provider ${solution.providerId}`}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {solution.solutionType} • {solution.estimatedTime}
                                    {solution.solutionType === 'paid' && solution.estimatedCost && 
                                      ` • ${formatCurrency(solution.estimatedCost)}`
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* Voting buttons (placeholder - you may need to implement voting API) */}
                              <div className="flex items-center gap-2">
                                <button className="flex items-center px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm">
                                  <i className="fas fa-thumbs-up mr-1"></i>
                                  {solution.upvotes || 0}
                                </button>
                                <button className="flex items-center px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm">
                                  <i className="fas fa-thumbs-down mr-1"></i>
                                  {solution.downvotes || 0}
                                </button>
                              </div>
                            </div>

                            <p className="text-gray-300 text-sm mb-2">{solution.description}</p>
                            
                            {solution.expertise && (
                              <p className="text-xs text-gray-500">
                                <i className="fas fa-certificate mr-1"></i>
                                Expertise: {solution.expertise}
                              </p>
                            )}
                          </div>
                        ))}
                        
                        {solutions.length > 3 && (
                          <button className="w-full py-2 text-[#00D4B2] hover:text-[#C1FF72] transition-all duration-300 text-sm">
                            <i className="fas fa-chevron-down mr-1"></i>
                            Show {solutions.length - 3} more solution{solutions.length - 3 > 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredReports.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00D4B2]/20 rounded-full mb-4">
                <i className="fas fa-search text-[#00D4B2] text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Issues Found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later for new community issues.</p>
            </div>
          )}

          {/* Top Providers Section */}
          {topProviders.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <i className="fas fa-star text-[#C1FF72] mr-3"></i>
                Top Community Providers
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
        </div>
      </div>

      {/* Solution Submission Modal */}
      {showSolutionModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] border border-[#00D4B2]/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent">
                Propose a Solution
              </h3>
              <button 
                onClick={() => setShowSolutionModal(false)}
                className="text-gray-400 hover:text-white transition-all duration-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Report Summary */}
            <div className="bg-[#0B1120]/50 rounded-xl p-4 mb-6 border border-[#00D4B2]/10">
              <p className="text-gray-400 text-sm mb-2">Issue #{selectedReport.id}</p>
              <p className="text-white">{selectedReport.content}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  {selectedReport.location}
                </span>
                <span className="text-xs text-gray-500">
                  <i className="fas fa-tag mr-1"></i>
                  {selectedReport.category}
                </span>
              </div>
            </div>

            {/* Solution Form */}
            <div className="space-y-6">
              {/* Provider Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={solutionForm.providerName}
                    onChange={(e) => setSolutionForm({...solutionForm, providerName: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={solutionForm.providerPhone}
                    onChange={(e) => setSolutionForm({...solutionForm, providerPhone: e.target.value})}
                    placeholder="+254712345678"
                    className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Solution Type */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Solution Type *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'volunteer', label: 'Volunteer', icon: '🤝', desc: 'Free community service' },
                    { value: 'paid', label: 'Paid Service', icon: '💰', desc: 'Professional service with cost' },
                    { value: 'expert', label: 'Expert Consultation', icon: '👨‍🔬', desc: 'Specialized knowledge' }
                  ].map((type) => (
                    <label key={type.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="solutionType"
                        value={type.value}
                        checked={solutionForm.solutionType === type.value}
                        onChange={(e) => setSolutionForm({...solutionForm, solutionType: e.target.value})}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${solutionForm.solutionType === type.value 
                        ? 'border-[#00D4B2] bg-[#00D4B2]/10' 
                        : 'border-gray-600 bg-[#0B1120]/50 hover:border-[#00D4B2]/50'
                      }`}>
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <p className="font-semibold text-white text-sm">{type.label}</p>
                        <p className="text-xs text-gray-400">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Solution Description */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Solution Description *
                </label>
                <textarea
                  value={solutionForm.description}
                  onChange={(e) => setSolutionForm({...solutionForm, description: e.target.value})}
                  placeholder="Describe your proposed solution in detail..."
                  className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500 resize-none"
                  rows="4"
                  required
                />
              </div>

              {/* Cost and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {solutionForm.solutionType === 'paid' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Estimated Cost (KES) *
                    </label>
                    <input
                      type="number"
                      value={solutionForm.estimatedCost}
                      onChange={(e) => setSolutionForm({...solutionForm, estimatedCost: e.target.value})}
                      placeholder="5000"
                      min="0"
                      className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                      required
                    />
                  </div>
                )}
                <div className={solutionForm.solutionType === 'paid' ? '' : 'md:col-span-2'}>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Estimated Time *
                  </label>
                  <input
                    type="text"
                    value={solutionForm.estimatedTime}
                    onChange={(e) => setSolutionForm({...solutionForm, estimatedTime: e.target.value})}
                    placeholder="2-3 days"
                    className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Your Expertise/Skills *
                </label>
                <input
                  type="text"
                  value={solutionForm.expertise}
                  onChange={(e) => setSolutionForm({...solutionForm, expertise: e.target.value})}
                  placeholder="Electrical work, plumbing, construction, etc."
                  className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSolutionModal(false)}
                className="flex-1 px-6 py-3 bg-gray-500/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={submitSolution}
                disabled={submittingSolution || !solutionForm.providerName || !solutionForm.description || !solutionForm.estimatedTime || !solutionForm.expertise}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submittingSolution ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lightbulb mr-2"></i>
                    Submit Solution
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySolutions;