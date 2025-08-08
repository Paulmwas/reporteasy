import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ApproveSolutions = () => {
  const [reports, setReports] = useState([]);
  const [solutions, setSolutions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [approvalModal, setApprovalModal] = useState(false);
  const [completionModal, setCompletionModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [rating, setRating] = useState(5);
  const [processingAction, setProcessingAction] = useState(false);
  const [expandedReports, setExpandedReports] = useState(new Set());

  // Fetch all reports and their solutions
  const fetchReportsAndSolutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching reports for solution approval...');
      
      // First get all reports
      const reportsResponse = await api.reports.list({ limit: 100, offset: 0 });
      
      let reportsData = [];
      if (Array.isArray(reportsResponse)) {
        reportsData = reportsResponse;
      } else if (reportsResponse && reportsResponse.reports) {
        reportsData = reportsResponse.reports;
      } else if (reportsResponse && reportsResponse.data) {
        reportsData = Array.isArray(reportsResponse.data) 
          ? reportsResponse.data 
          : reportsResponse.data.reports || [];
      }

      console.log('📋 Reports Data:', reportsData);
      setReports(reportsData);

      // Fetch solutions for each report
      const solutionsData = {};
      
      for (const report of reportsData) {
        try {
          console.log(`🔧 Fetching solutions for report ${report.id}...`);
          const reportSolutions = await api.solutions.getReportSolutions(report.id);
          
          if (reportSolutions && reportSolutions.length > 0) {
            solutionsData[report.id] = reportSolutions;
            console.log(`✅ Found ${reportSolutions.length} solutions for report ${report.id}`);
          }
        } catch (solutionError) {
          console.warn(`⚠️ No solutions found for report ${report.id}:`, solutionError.message);
          // Don't treat this as an error - just means no solutions exist
        }
      }

      console.log('🔧 All Solutions Data:', solutionsData);
      setSolutions(solutionsData);

    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept a solution
  const acceptSolution = async (solutionId) => {
    try {
      setProcessingAction(true);
      
      const payload = {};
      if (selectedSolution?.solutionType === 'paid' && paymentAmount) {
        payload.paymentOffered = parseFloat(paymentAmount);
      }

      console.log('✅ Accepting solution:', { solutionId, payload });
      
      const response = await api.solutions.acceptSolution(solutionId, payload.paymentOffered);
      
      console.log('✅ Solution Accepted:', response);
      
      // Update local state
      setSolutions(prevSolutions => {
        const updated = { ...prevSolutions };
        Object.keys(updated).forEach(reportId => {
          updated[reportId] = updated[reportId].map(solution => 
            solution.id === solutionId 
              ? { ...solution, status: 'accepted', paymentOffered: payload.paymentOffered }
              : solution
          );
        });
        return updated;
      });

      setApprovalModal(false);
      setSelectedSolution(null);
      setPaymentAmount('');
      
    } catch (err) {
      console.error('❌ Error accepting solution:', err);
      setError('Failed to accept solution');
    } finally {
      setProcessingAction(false);
    }
  };

  // Complete a solution
  const completeSolution = async (solutionId, solutionRating) => {
    try {
      setProcessingAction(true);
      
      console.log('🎯 Completing solution:', { solutionId, rating: solutionRating });
      
      const response = await api.solutions.completeSolution(solutionId, solutionRating);
      
      console.log('🎯 Solution Completed:', response);
      
      // Update local state
      setSolutions(prevSolutions => {
        const updated = { ...prevSolutions };
        Object.keys(updated).forEach(reportId => {
          updated[reportId] = updated[reportId].map(solution => 
            solution.id === solutionId 
              ? { ...solution, status: 'completed', rating: solutionRating }
              : solution
          );
        });
        return updated;
      });

      setCompletionModal(false);
      setSelectedSolution(null);
      setRating(5);
      
    } catch (err) {
      console.error('❌ Error completing solution:', err);
      setError('Failed to complete solution');
    } finally {
      setProcessingAction(false);
    }
  };

  useEffect(() => {
    fetchReportsAndSolutions();
  }, [fetchReportsAndSolutions]);

  // Helper functions
  const getSolutionStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'accepted': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'in_progress': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSolutionTypeColor = (type) => {
    switch (type) {
      case 'volunteer': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'paid': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'expert': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSolutionTypeIcon = (type) => {
    switch (type) {
      case 'volunteer': return 'fas fa-handshake';
      case 'paid': return 'fas fa-dollar-sign';
      case 'expert': return 'fas fa-user-graduate';
      default: return 'fas fa-question';
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

  const toggleReportExpansion = (reportId) => {
    setExpandedReports(prev => {
      const updated = new Set(prev);
      if (updated.has(reportId)) {
        updated.delete(reportId);
      } else {
        updated.add(reportId);
      }
      return updated;
    });
  };

  const canAcceptSolution = (solution) => {
    return solution.status === 'pending';
  };

  const canCompleteSolution = (solution) => {
    return solution.status === 'accepted' || solution.status === 'in_progress';
  };

  // Get reports that have solutions
  const reportsWithSolutions = reports.filter(report => solutions[report.id] && solutions[report.id].length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600/30 rounded w-48 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(item => (
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
                  Solution Approval Center
                </h1>
                <p className="text-gray-400 text-lg">
                  Review and approve community solutions • {reportsWithSolutions.length} reports with solutions
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={fetchReportsAndSolutions}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#00D4B2]/20 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-tasks text-[#00D4B2] text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(solutions).reduce((total, reportSolutions) => 
                        total + reportSolutions.filter(s => s.status === 'pending').length, 0
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">Pending Approval</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-check-circle text-blue-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(solutions).reduce((total, reportSolutions) => 
                        total + reportSolutions.filter(s => s.status === 'accepted').length, 0
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">Accepted Solutions</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-star text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(solutions).reduce((total, reportSolutions) => 
                        total + reportSolutions.filter(s => s.status === 'completed').length, 0
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">Completed Solutions</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-users text-purple-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {Object.values(solutions).reduce((total, reportSolutions) => 
                        total + reportSolutions.length, 0
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">Total Solutions</p>
                  </div>
                </div>
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

          {/* Reports with Solutions */}
          <div className="space-y-6">
            {reportsWithSolutions.map((report) => (
              <div key={report.id} className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 overflow-hidden">
                {/* Report Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-[#00D4B2]/5 transition-all duration-300"
                  onClick={() => toggleReportExpansion(report.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-xl flex items-center justify-center">
                          <i className="fas fa-file-alt text-[#1A1A2E] text-sm"></i>
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-semibold">Report #{report.id}</h3>
                          <p className="text-gray-400 text-sm">
                            {formatDate(report.createdAt)} • {solutions[report.id]?.length || 0} solutions
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-300 text-base mb-4 line-clamp-2">
                        {report.content || 'No content available'}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <i className="fas fa-tag mr-1.5 text-xs"></i>
                          {report.category?.toUpperCase()}
                        </span>
                        
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          <i className="fas fa-flag mr-1.5 text-xs"></i>
                          {report.priority?.toUpperCase()}
                        </span>

                        {report.location && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                            <i className="fas fa-map-marker-alt mr-1.5 text-xs"></i>
                            {report.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Solutions</p>
                        <p className="text-xl font-bold text-[#00D4B2]">
                          {solutions[report.id]?.length || 0}
                        </p>
                      </div>
                      <i className={`fas fa-chevron-${expandedReports.has(report.id) ? 'up' : 'down'} text-gray-400`}></i>
                    </div>
                  </div>
                </div>

                {/* Solutions List */}
                {expandedReports.has(report.id) && solutions[report.id] && (
                  <div className="border-t border-[#00D4B2]/20 bg-[#0B1120]/30">
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <i className="fas fa-lightbulb mr-2 text-[#C1FF72]"></i>
                        Proposed Solutions
                      </h4>
                      
                      <div className="grid gap-4">
                        {solutions[report.id].map((solution) => (
                          <div key={solution.id} className="bg-[#1A1A2E]/40 rounded-xl border border-[#00D4B2]/10 p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 bg-[#00D4B2]/20 rounded-lg flex items-center justify-center">
                                    <i className={`${getSolutionTypeIcon(solution.solutionType)} text-[#00D4B2] text-sm`}></i>
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {solution.providerId} 
                                      {solution.providerName && ` (${solution.providerName})`}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                      Submitted {formatDate(solution.createdAt)}
                                    </p>
                                  </div>
                                </div>

                                <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                                  {solution.description}
                                </p>

                                <div className="flex items-center gap-4 flex-wrap text-sm">
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-semibold border ${getSolutionStatusColor(solution.status)}`}>
                                    <i className="fas fa-circle mr-1.5 text-xs"></i>
                                    {solution.status?.toUpperCase()}
                                  </span>

                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full font-semibold border ${getSolutionTypeColor(solution.solutionType)}`}>
                                    <i className={`${getSolutionTypeIcon(solution.solutionType)} mr-1.5 text-xs`}></i>
                                    {solution.solutionType?.toUpperCase()}
                                  </span>

                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                    <i className="fas fa-clock mr-1.5 text-xs"></i>
                                    {solution.estimatedTime}
                                  </span>

                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    <i className="fas fa-tools mr-1.5 text-xs"></i>
                                    {solution.expertise}
                                  </span>

                                  {solution.estimatedCost && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                                      <i className="fas fa-dollar-sign mr-1.5 text-xs"></i>
                                      KES {solution.estimatedCost}
                                    </span>
                                  )}

                                  {solution.rating && (
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                      <i className="fas fa-star mr-1.5 text-xs"></i>
                                      {solution.rating}/5
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 ml-4">
                                {canAcceptSolution(solution) && (
                                  <button
                                    onClick={() => {
                                      setSelectedSolution(solution);
                                      setApprovalModal(true);
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-[#00D4B2]/20 hover:bg-[#00D4B2]/30 text-[#00D4B2] rounded-xl transition-all duration-300 border border-[#00D4B2]/30 hover:border-[#00D4B2]/50 text-sm font-medium"
                                  >
                                    <i className="fas fa-check mr-2"></i>
                                    Accept
                                  </button>
                                )}
                                
                                {canCompleteSolution(solution) && (
                                  <button
                                    onClick={() => {
                                      setSelectedSolution(solution);
                                      setCompletionModal(true);
                                    }}
                                    className="inline-flex items-center px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-all duration-300 border border-green-500/30 hover:border-green-500/50 text-sm font-medium"
                                  >
                                    <i className="fas fa-flag-checkered mr-2"></i>
                                    Complete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {reportsWithSolutions.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00D4B2]/20 rounded-full mb-4">
                <i className="fas fa-lightbulb text-[#00D4B2] text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Solutions Found</h3>
              <p className="text-gray-500">No community solutions are available for approval at this time.</p>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModal && selectedSolution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] border border-[#00D4B2]/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent">
                Approve Solution
              </h3>
              <button 
                onClick={() => setApprovalModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                <strong>Provider:</strong> {selectedSolution.providerId}
              </p>
              <p className="text-gray-300 mb-4">
                <strong>Solution:</strong> {selectedSolution.description}
              </p>
              <p className="text-gray-300 mb-4">
                <strong>Type:</strong> <span className="capitalize">{selectedSolution.solutionType}</span>
              </p>
              
              {selectedSolution.solutionType === 'paid' && (
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Payment Amount (KES)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter payment amount..."
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                  />
                  {selectedSolution.estimatedCost && (
                    <p className="text-sm text-gray-400 mt-1">
                      Estimated: KES {selectedSolution.estimatedCost}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setApprovalModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => acceptSolution(selectedSolution.id)}
                disabled={processingAction}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {processingAction ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Approving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Accept Solution
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completionModal && selectedSolution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] border border-[#00D4B2]/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent">
                Complete Solution
              </h3>
              <button 
                onClick={() => setCompletionModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                <strong>Provider:</strong> {selectedSolution.providerId}
              </p>
              <p className="text-gray-300 mb-4">
                <strong>Solution:</strong> {selectedSolution.description}
              </p>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Rate the completed work (1-5 stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating 
                          ? 'text-yellow-400 hover:text-yellow-300' 
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                  ))}
                  <span className="ml-3 text-gray-300 font-medium">{rating}/5</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCompletionModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => completeSolution(selectedSolution.id, rating)}
                disabled={processingAction}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {processingAction ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Completing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-flag-checkered mr-2"></i>
                    Mark Complete
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

export default ApproveSolutions;