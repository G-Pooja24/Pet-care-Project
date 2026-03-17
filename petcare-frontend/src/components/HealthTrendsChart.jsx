import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HealthChart({ measurements }) {
  // Sort measurements by date to ensure correct order
  const sortedMeasurements = [...measurements].sort((a, b) => new Date(a.measurementDate) - new Date(b.measurementDate));

  const data = {
    labels: sortedMeasurements.map(m => new Date(m.measurementDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: sortedMeasurements.map(m => m.weight),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
        tension: 0.4, // Smooth curve
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Temperature (°C)',
        data: sortedMeasurements.map(m => m.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        tension: 0.4, // Smooth curve
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow chart to fill container height
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Health Trends: Weight & Temperature',
        font: {
          size: 18,
          weight: 'bold',
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Weight (kg)',
          color: 'rgb(53, 162, 235)',
          font: { weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: 'rgb(255, 99, 132)',
          font: { weight: 'bold' }
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      height: '450px', // Increased height
      width: '100%',
      marginTop: '20px'
    }}>
      <Line data={data} options={options} />
    </div>
  );
}
