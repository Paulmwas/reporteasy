import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    location: '',
    messageType: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0
  });

  // Fetch reports with current filters
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        limit: pagination.limit,
        offset: pagination.offset,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      };

      const response = await api.reports.list(queryParams);
      setReports(response.reports || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Update report status
  const updateReportStatus = async (reportId, newStatus) => {
    try {
      setUpdatingStatus(true);
      
      const response = await api.reports.updateStatus(reportId, newStatus, statusNotes);
      
      // Update the report in the local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
            : report
        )
      );

      setStatusUpdateModal(false);
      setSelectedReport(null);
      setStatusNotes('');
      
      // Show success notification (you can implement toast notifications here)
      console.log('Status updated successfully:', response);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update report status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters, pagination.offset]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'in-progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'resolved': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'urgent' 
      ? 'text-red-400 bg-red-500/20 border-red-500/30'
      : 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'open': return 'in-progress';
      case 'in-progress': return 'resolved';
      default: return currentStatus;
    }
  };

  const canUpdateStatus = (status) => {
    return status !== 'resolved';
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#1A1A2E] to-[#16213E] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600/30 rounded w-48 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="bg-[#1A1A2E]/60 rounded-2xl p-6 border border-[#00D4B2]/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-600/30 rounded w-32 mb-2"></div>
                      <div className="h-6 bg-gray-600/30 rounded w-full mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-600/30 rounded w-20"></div>
                        <div className="h-6 bg-gray-600/30 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="w-24 h-8 bg-gray-600/30 rounded"></div>
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
                  Reports Management
                </h1>
                <p className="text-gray-400 text-lg">
                  Monitor and manage community reports • {pagination.total} total reports
                </p>
              </div>
              
              <button 
                onClick={() => fetchReports()}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
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
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="normal">Normal</option>
                </select>

                <select 
                  value={filters.messageType}
                  onChange={(e) => setFilters({...filters, messageType: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20"
                >
                  <option value="">All Types</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="voice">Voice</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500"
                />
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

          {/* Reports List */}
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="group bg-[#1A1A2E]/60 backdrop-blur-sm rounded-2xl border border-[#00D4B2]/20 p-6 hover:border-[#00D4B2]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00D4B2]/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br from-[#C1FF72] to-[#00D4B2] rounded-xl flex items-center justify-center`}>
                        <i className={`${getCategoryIcon(report.category)} text-[#1A1A2E] text-sm`}></i>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>ID: {report.id}</span>
                        <span>•</span>
                        <span>{formatDate(report.createdAt)}</span>
                        {report.phoneNumber && (
                          <>
                            <span>•</span>
                            <span>{report.phoneNumber}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-white text-lg mb-4 leading-relaxed">
                      {report.content || 'No content available'}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                        <i className="fas fa-circle mr-1.5 text-xs"></i>
                        {report.status?.replace('-', ' ').toUpperCase()}
                      </span>

                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getPriorityColor(report.priority)}`}>
                        {report.priority === 'urgent' && <i className="fas fa-exclamation mr-1.5 text-xs"></i>}
                        {report.priority?.toUpperCase()}
                      </span>

                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                        <i className={`fas ${report.messageType === 'text' ? 'fa-comment' : report.messageType === 'image' ? 'fa-image' : 'fa-microphone'} mr-1.5 text-xs`}></i>
                        {report.messageType?.toUpperCase()}
                      </span>

                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <i className="fas fa-tag mr-1.5 text-xs"></i>
                        {report.category?.replace('-', ' ').toUpperCase()}
                      </span>

                      {report.location && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                          <i className="fas fa-map-marker-alt mr-1.5 text-xs"></i>
                          {report.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 ml-6">
                    {canUpdateStatus(report.status) && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setStatusUpdateModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-[#00D4B2]/20 hover:bg-[#00D4B2]/30 text-[#00D4B2] rounded-xl transition-all duration-300 border border-[#00D4B2]/30 hover:border-[#00D4B2]/50"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Update Status
                      </button>
                    )}
                    
                    <button className="inline-flex items-center px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 hover:text-white rounded-xl transition-all duration-300 border border-gray-500/30 hover:border-gray-400/50">
                      <i className="fas fa-eye mr-2"></i>
                      View Details
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                {report.metadata && (
                  <div className="mt-4 p-4 bg-[#0B1120]/50 rounded-xl border border-[#00D4B2]/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <span className="text-gray-300 ml-2">{(report.metadata.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Language:</span>
                        <span className="text-gray-300 ml-2 capitalize">{report.metadata.language}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sentiment:</span>
                        <span className="text-gray-300 ml-2 capitalize">{report.metadata.sentiment}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Word Count:</span>
                        <span className="text-gray-300 ml-2">{report.metadata.wordCount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button 
                onClick={() => setPagination(prev => ({...prev, offset: Math.max(0, prev.offset - prev.limit)}))}
                disabled={pagination.offset === 0}
                className="px-4 py-2 bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl disabled:opacity-50 hover:bg-[#00D4B2]/20 transition-all duration-300"
              >
                <i className="fas fa-chevron-left mr-2"></i>
                Previous
              </button>
              
              <span className="text-gray-300">
                {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
              </span>
              
              <button 
                onClick={() => setPagination(prev => ({...prev, offset: prev.offset + prev.limit}))}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-4 py-2 bg-[#1A1A2E]/60 border border-[#00D4B2]/30 text-gray-300 rounded-xl disabled:opacity-50 hover:bg-[#00D4B2]/20 transition-all duration-300"
              >
                Next
                <i className="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          )}

          {reports.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00D4B2]/20 rounded-full mb-4">
                <i className="fas fa-inbox text-[#00D4B2] text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Reports Found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] border border-[#00D4B2]/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] bg-clip-text text-transparent">
                Update Report Status
              </h3>
              <button 
                onClick={() => setStatusUpdateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Change status from <span className="text-[#C1FF72] font-semibold">{selectedReport.status}</span> to <span className="text-[#00D4B2] font-semibold">{nextStatus(selectedReport.status)}</span>
              </p>
              
              <textarea
                placeholder="Add notes (optional)..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full bg-[#0B1120]/50 border border-[#00D4B2]/30 text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#00D4B2]/50 focus:ring-2 focus:ring-[#00D4B2]/20 placeholder-gray-500 resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStatusUpdateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-500/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, nextStatus(selectedReport.status))}
                disabled={updatingStatus}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#C1FF72] to-[#00D4B2] text-[#1A1A2E] rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Update Status
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

export default Reports;