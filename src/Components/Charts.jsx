// components/Charts.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import api from '../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const Charts = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [hotspotsData, setHotspotsData] = useState([]);
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all required data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [insights, dashboard, hotspots, community] = await Promise.all([
          api.analytics.getInsights(),
          api.dashboard.getOverview(),
          api.analytics.getHotspots(),
          api.analytics.getCommunityImpact()
        ]);

        setAnalyticsData(insights);
        setDashboardData(dashboard);
        setHotspotsData(hotspots);
        setCommunityData(community);
      } catch (err) {
        setError(err.message || 'Failed to fetch chart data');
        console.error('Charts data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Chart color scheme
  const colors = {
    background: '#1A1A2E',
    lime: '#C1FF72',
    teal: '#00D4B2',
    yellow: '#FFD60A',
    white: '#FFFFFF',
    gray: '#8B8B8B',
    gradients: {
      limeTeal: ['#C1FF72', '#00D4B2'],
      tealYellow: ['#00D4B2', '#FFD60A'],
      limeYellow: ['#C1FF72', '#FFD60A']
    }
  };

  // Chart options with dark theme
  const getChartOptions = (title, type = 'default') => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: colors.white,
            font: {
              family: 'Segoe UI, sans-serif',
              size: 12,
            },
            padding: 20,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: title,
          color: colors.white,
          font: {
            family: 'Segoe UI, sans-serif',
            size: 16,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          titleColor: colors.white,
          bodyColor: colors.white,
          borderColor: colors.teal,
          borderWidth: 1,
        },
      },
    };

    if (type === 'bar') {
      return {
        ...baseOptions,
        scales: {
          x: {
            ticks: {
              color: colors.white,
              font: {
                family: 'Segoe UI, sans-serif',
              },
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          y: {
            ticks: {
              color: colors.white,
              font: {
                family: 'Segoe UI, sans-serif',
              },
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      };
    }

    return baseOptions;
  };

  // Create gradient helper
  const createGradient = (ctx, colorArray) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colorArray[0]);
    gradient.addColorStop(1, colorArray[1]);
    return gradient;
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1A1A2E] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C1FF72]"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-red-500/30">
        <div className="text-center text-red-400">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Charts</h3>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  // Prepare Chart Data
  const getReportStatusData = () => {
    if (!dashboardData?.quickStats) return null;

    const { totalReports, activeIncidents, urgentReports } = dashboardData.quickStats;
    const resolvedReports = totalReports - activeIncidents;

    return {
      labels: ['Active', 'Resolved', 'Urgent'],
      datasets: [
        {
          label: 'Reports Status',
          data: [activeIncidents, resolvedReports, urgentReports],
          backgroundColor: [colors.teal, colors.lime, colors.yellow],
          borderColor: colors.white,
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  };

  const getHotspotsData = () => {
    if (!hotspotsData?.length) return null;

    // Group by risk level
    const riskLevels = hotspotsData.reduce((acc, hotspot) => {
      acc[hotspot.riskLevel] = (acc[hotspot.riskLevel] || 0) + hotspot.incidents;
      return acc;
    }, {});

    return {
      labels: Object.keys(riskLevels),
      datasets: [
        {
          label: 'Incidents by Risk Level',
          data: Object.values(riskLevels),
          backgroundColor: [colors.lime, colors.teal, colors.yellow],
          borderColor: colors.white,
          borderWidth: 2,
        },
      ],
    };
  };

  const getCommunityEngagementData = () => {
    if (!analyticsData?.trendAnalysis || !communityData) return null;

    const labels = ['Total Reports', 'Active Users', 'Resolved Reports', 'Engagement Score'];
    const data = [
      analyticsData.trendAnalysis.totalReports || 0,
      communityData.activeUsers || 0,
      communityData.resolvedReports || 0,
      analyticsData.trendAnalysis.citizenEngagement || 0,
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Community Metrics',
          data,
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return colors.lime;
            return createGradient(canvasCtx, colors.gradients.limeTeal);
          },
          borderColor: colors.white,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };

  const reportStatusData = getReportStatusData();
  const hotspotsChartData = getHotspotsData();
  const communityEngagementData = getCommunityEngagementData();

  return (
    <div className="space-y-6">
      {/* Charts Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
          Analytics Dashboard
        </h2>
        <p className="text-gray-400" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
          Real-time insights and community impact metrics
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart - Report Status */}
        <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-gray-700 hover:border-[#C1FF72]/30 transition-all duration-300">
          <div className="h-80">
            {reportStatusData ? (
              <Doughnut
                data={reportStatusData}
                options={getChartOptions('Report Status Distribution')}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl mb-4 opacity-50"></i>
                  <p>No status data available</p>
                </div>
              </div>
            )}
          </div>
          {reportStatusData && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Total: <span className="text-[#C1FF72] font-semibold">{dashboardData.quickStats.totalReports}</span> reports
              </p>
            </div>
          )}
        </div>

        {/* Bar Chart - Community Engagement */}
        <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-gray-700 hover:border-[#00D4B2]/30 transition-all duration-300">
          <div className="h-80">
            {communityEngagementData ? (
              <Bar
                data={communityEngagementData}
                options={getChartOptions('Community Engagement Metrics', 'bar')}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <i className="fas fa-chart-bar text-4xl mb-4 opacity-50"></i>
                  <p>No engagement data available</p>
                </div>
              </div>
            )}
          </div>
          {communityEngagementData && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Engagement Score: <span className="text-[#00D4B2] font-semibold">{analyticsData.trendAnalysis.citizenEngagement}%</span>
              </p>
            </div>
          )}
        </div>

        {/* Pie Chart - Risk Hotspots */}
        <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-gray-700 hover:border-[#FFD60A]/30 transition-all duration-300">
          <div className="h-80">
            {hotspotsChartData ? (
              <Pie
                data={hotspotsChartData}
                options={getChartOptions('Risk Level Distribution')}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <i className="fas fa-map-marked-alt text-4xl mb-4 opacity-50"></i>
                  <p>No hotspot data available</p>
                </div>
              </div>
            )}
          </div>
          {hotspotsChartData && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Total Hotspots: <span className="text-[#FFD60A] font-semibold">{hotspotsData.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
          Quick Insights
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#C1FF72]/10 to-[#00D4B2]/10 border border-[#C1FF72]/20">
            <div className="text-2xl font-bold text-[#C1FF72] mb-2">
              {dashboardData?.quickStats?.totalReports || 0}
            </div>
            <div className="text-sm text-gray-400">Total Reports</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#00D4B2]/10 to-[#FFD60A]/10 border border-[#00D4B2]/20">
            <div className="text-2xl font-bold text-[#00D4B2] mb-2">
              {communityData?.activeUsers || 0}
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#FFD60A]/10 to-[#C1FF72]/10 border border-[#FFD60A]/20">
            <div className="text-2xl font-bold text-[#FFD60A] mb-2">
              {dashboardData?.quickStats?.urgentReports || 0}
            </div>
            <div className="text-sm text-gray-400">Urgent Reports</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-[#C1FF72]/10 to-[#FFD60A]/10 border border-[#C1FF72]/20">
            <div className="text-2xl font-bold text-[#C1FF72] mb-2">
              {communityData?.resolutionRate || 0}%
            </div>
            <div className="text-sm text-gray-400">Resolution Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;