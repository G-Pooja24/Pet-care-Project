import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export default function MeasurementsChart({ data }){
if(!data || data.length===0) return <div>No measurements</div>;
const labels = data.map(m=> new Date(m.measureTime).toLocaleDateString());
const weights = data.map(m=> m.weightKg);
const temps = data.map(m=> m.temperatureC);
const chartData = {
labels,
datasets: [
{ label: 'Weight (kg)', data: weights, tension:0.2, yAxisID: 'y' },
{ label: 'Temp (C)', data: temps, tension:0.2, yAxisID: 'y1' }
]
};
const options = {
scales: {
y: { type:'linear', position:'left' },
y1: { type:'linear', position:'right', grid:{display:false} }
}
};
return <div style={{height:300}}><Line data={chartData} options={options} /></div>;
}