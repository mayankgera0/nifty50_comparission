import React, { forwardRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface NavDataPoint {
  'NAV Date': string | Date;
  'NAV (Rs)': number;
}
interface BenchmarkDataPoint {
  date: string | Date;
  value: number;
}
interface EquityChartProps {
  nav: NavDataPoint[];             // pass from parent once loaded
  benchmark: BenchmarkDataPoint[]; // pass from parent once derived
}

const EquityChart = forwardRef<any, EquityChartProps>(({ nav, benchmark }, ref) => {
  // Guard for initial render
  if (!Array.isArray(nav) || nav.length === 0) {
    return <div className="chart-container" style={{ height: '400px', marginBottom: '20px' }} />;
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'month', displayFormats: { month: 'MMM yyyy' } },
        grid: { display: false },
        ticks: { color: '#666' },
      },
      y: {
        beginAtZero: false,
        grid: { color: '#f0f0f0' },
        ticks: {
          color: '#666',
          callback: function (value: number | string) {
            return Number(value).toFixed(0);
          },
        },
      },
    },
    interaction: { mode: 'index', intersect: false },
    elements: {
      point: { radius: 0, hoverRadius: 4 },
      line: { borderWidth: 2 },
    },
  };

  const data = {
    datasets: [
      {
        label: 'Focused',
        data: nav.map(item => ({ x: item['NAV Date'], y: item['NAV (Rs)'] })),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: 'NIFTY50',
        data: (benchmark ?? []).map(item => ({ x: item.date, y: item.value })),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
      <Line ref={ref} options={options} data={data} />
    </div>
  );
});

export default EquityChart;
