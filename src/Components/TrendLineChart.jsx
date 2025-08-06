import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TrendLineChart = ({ data }) => {
  // Sample week days - replace with actual dates from your data
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'New Reports',
        data: labels.map((_, i) => Math.floor(Math.random() * 100) + 50), // Replace with actual data
        borderColor: '#4BC0C0',
        tension: 0.1,
      },
      {
        label: 'Resolved Reports',
        data: labels.map((_, i) => Math.floor(Math.random() * 80) + 30), // Replace with actual data
        borderColor: '#36A2EB',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default TrendLineChart;