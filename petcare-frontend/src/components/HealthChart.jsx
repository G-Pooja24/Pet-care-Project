import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function HealthChart({ measurements }) {
  const data = {
    labels: measurements.map(m => new Date(m.measurementDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight (kg)',
        data: measurements.map(m => m.weight),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
        tension: 0.4,
        borderWidth: 6, // Made significantly bolder
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: 'white',
        pointBorderWidth: 3,
      },
      {
        label: 'Temperature (°C)',
        data: measurements.map(m => m.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        tension: 0.4,
        borderWidth: 6, // Made significantly bolder
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: 'white',
        pointBorderWidth: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows height customization
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
          size: 20, // Increased title size
          weight: 'bold'
        },
        padding: { top: 10, bottom: 20 }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        displayColors: true,
        cornerRadius: 6,
      },
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          usePointStyle: true,
          padding: 20
        }
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
          font: { size: 14, weight: 'bold' }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Slightly darker grid
          lineWidth: 1
        },
        ticks: { font: { weight: 'bold' } }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: 'rgb(255, 99, 132)',
          font: { size: 14, weight: 'bold' }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: { font: { weight: 'bold' } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold' } }
      }
    },
  };

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)', // Enhanced shadow
      height: '365px' // Reduced height
    }}>
      <Line options={options} data={data} />
    </div>
  );
}
