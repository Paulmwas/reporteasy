import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../utils/transitions';
import { dashboardAPI, reportsAPI, analyticsAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import StatusPieChart from '../components/charts/StatusPieChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import ActivityFeed from '../components/ActivityFeed';
import LoadingSpinner from '../components/LoadingSpinner';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboard, stats, analytics] = await Promise.all([
          dashboardAPI.getDashboardData(),
          reportsAPI.getStats(),
          analyticsAPI.getInsights()
        ]);
        
        setData({ dashboard, stats, analytics });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="space-y-6"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Reports" 
          value={data.dashboard.quickStats.totalReports} 
          trend="up" 
          change="12%"
        />
        <StatsCard 
          title="Active Incidents" 
          value={data.dashboard.quickStats.activeIncidents} 
          trend="down" 
          change="5%"
        />
        <StatsCard 
          title="Resolution Rate" 
          value={`${data.analytics.communityImpact.resolutionRate}%`} 
          trend="up" 
          change="8%"
        />
        <StatsCard 
          title="Active Users" 
          value={data.analytics.communityImpact.activeUsers} 
          trend="up" 
          change="15%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-700 mb-3">Report Status</h3>
          <StatusPieChart data={data.stats.byStatus} />
        </div>
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-700 mb-3">Report Trends</h3>
          <TrendLineChart data={data.analytics.trendAnalysis} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-700 mb-3">Recent Activity</h3>
          <ActivityFeed />
        </div>
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-700 mb-3">Hotspots</h3>
          {/* Hotspot component would go here */}
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;