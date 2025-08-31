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
  Filler,
} from 'chart.js';
import type { ChartOptions, TooltipItem } from 'chart.js';
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
  TimeScale,
  Filler
);

interface NavDrawdown {
  'NAV Date': string | Date;
  Drawdown: number; // negative or 0
}

interface DrawdownChartProps {
  nav: NavDrawdown[]; // pass from parent once loaded (computed with drawdowns)
}

const DrawdownChart = forwardRef<any, DrawdownChartProps>(({ nav }, ref) => {
  // Guard: avoid rendering before data is ready
  if (!Array.isArray(nav) || nav.length === 0) {
    return <div className="chart-container" style={{ height: '200px' }} />;
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
        callbacks: {
          label: (context: TooltipItem<'line'>) => `Drawdown: ${context.parsed.y.toFixed(2)}%`,
        },
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
        max: 5,
        min: -45,
        grid: { color: '#f0f0f0' },
        ticks: {
          color: '#666',
          callback: (value: number | string) => `${Number(value).toFixed(0)}%`,
        },
      },
    },
    interaction: { mode: 'index', intersect: false },
    elements: { point: { radius: 0, hoverRadius: 4 }, line: { borderWidth: 1 } },
  };

  const data = {
    datasets: [
      {
        label: 'Drawdown',
        data: nav.map(item => ({ x: item['NAV Date'], y: item.Drawdown })),
        borderColor: '#f472b6',
        backgroundColor: 'rgba(244, 114, 182, 0.3)',
        fill: 'origin', // area under line [2]
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <Line ref={ref} options={options} data={data} />
    </div>
  );
});

export default DrawdownChart;
