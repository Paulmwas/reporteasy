import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusPieChart = ({ data }) => {
  const chartData = {
    labels: ['Open', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [data?.open || 0, data?.['in-progress'] || 0, data?.resolved || 0],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#4BC0C0'
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={chartData} />;
};

export default StatusPieChart;