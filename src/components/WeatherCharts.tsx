import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ScriptableContext } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Thermometer, Droplets, Wind, CloudRain, BarChart3 } from 'lucide-react';
import type { WeatherData, AppSettings } from '../types/weather';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherChartsProps {
  weather: WeatherData;
  settings: AppSettings;
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ weather, settings }) => {
  const [activeChart, setActiveChart] = useState<'temp' | 'humidity' | 'wind' | 'rain'>('temp');

  // Prepare chart data based on selected tab
  const chartData = useMemo(() => {
    // We only display every 2 hours to avoid clutter on mobile screens
    const filteredHourly = weather.hourly.filter((_, idx) => idx % 2 === 0);
    const labels = filteredHourly.map(h => h.time);
    
    let datasetLabel = 'Temperature';
    let dataValues: number[] = [];
    let strokeColor = '#3b82f6';
    let startGlowColor = 'rgba(59, 130, 246, 0.35)';
    let endGlowColor = 'rgba(59, 130, 246, 0.0)';

    switch (activeChart) {
      case 'temp':
        datasetLabel = settings.tempUnit === 'C' ? 'Temperature (°C)' : 'Temperature (°F)';
        dataValues = filteredHourly.map(h => settings.tempUnit === 'C' ? h.temp_c : h.temp_f);
        strokeColor = '#f59e0b'; // Amber sun glow
        startGlowColor = 'rgba(245, 158, 11, 0.3)';
        break;
      case 'humidity':
        datasetLabel = 'Humidity (%)';
        dataValues = filteredHourly.map(h => h.humidity);
        strokeColor = '#06b6d4'; // Cyan humidity
        startGlowColor = 'rgba(6, 182, 212, 0.3)';
        break;
      case 'wind':
        datasetLabel = settings.windUnit === 'kmh' ? 'Wind Speed (km/h)' : 'Wind Speed (mph)';
        dataValues = filteredHourly.map(h => settings.windUnit === 'kmh' ? h.wind_kph : h.wind_mph);
        strokeColor = '#a855f7'; // Purple wind
        startGlowColor = 'rgba(168, 85, 247, 0.3)';
        break;
      case 'rain':
        datasetLabel = 'Chance of Rain (%)';
        dataValues = filteredHourly.map(h => h.chance_of_rain);
        strokeColor = '#3b82f6'; // Blue rain
        startGlowColor = 'rgba(59, 130, 246, 0.3)';
        break;
    }

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: datasetLabel,
          data: dataValues,
          borderColor: strokeColor,
          borderWidth: 2,
          pointBackgroundColor: strokeColor,
          pointBorderColor: 'rgba(255, 255, 255, 0.8)',
          pointHoverRadius: 6,
          pointRadius: 4,
          tension: 0.38,
          // Area gradient glow
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return undefined;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, startGlowColor);
            gradient.addColorStop(1, endGlowColor);
            return gradient;
          }
        }
      ]
    };
  }, [activeChart, weather.hourly, settings.tempUnit, settings.windUnit]);

  // Chart configuration options
  const options = useMemo(() => {
    const isDark = settings.theme !== 'light';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#4b5563';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // We use our own customized buttons
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          titleColor: isDark ? '#ffffff' : '#111827',
          bodyColor: isDark ? '#f8fafc' : '#1f2937',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: 'Outfit, sans-serif', weight: 'bold' as const },
          bodyFont: { family: 'Inter, sans-serif' },
          backdropFilter: 'blur(8px)',
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: textColor,
            font: { family: 'var(--font-mono)', size: 10 }
          }
        },
        y: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            font: { family: 'var(--font-sans)', size: 10 }
          }
        }
      }
    };
  }, [settings.theme]);

  return (
    <div className="glass-card fade-in" style={{ padding: '1.5rem', height: '360px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Chart controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <BarChart3 size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Forecast Analytics
          </span>
        </div>

        {/* Tab triggers */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.15)', padding: '0.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <button 
            style={tabButtonStyle(activeChart === 'temp', '#f59e0b')} 
            onClick={() => setActiveChart('temp')}
            title="Temperature Trend"
          >
            <Thermometer size={14} />
          </button>
          <button 
            style={tabButtonStyle(activeChart === 'humidity', '#06b6d4')} 
            onClick={() => setActiveChart('humidity')}
            title="Humidity Trend"
          >
            <Droplets size={14} />
          </button>
          <button 
            style={tabButtonStyle(activeChart === 'wind', '#a855f7')} 
            onClick={() => setActiveChart('wind')}
            title="Wind Speed Trend"
          >
            <Wind size={14} />
          </button>
          <button 
            style={tabButtonStyle(activeChart === 'rain', '#3b82f6')} 
            onClick={() => setActiveChart('rain')}
            title="Rain Probability"
          >
            <CloudRain size={14} />
          </button>
        </div>
      </div>

      {/* Line Chart Canvas Frame */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>

    </div>
  );
};

// Styling function for tabs
const tabButtonStyle = (isActive: boolean, accentColor: string): React.CSSProperties => ({
  background: isActive ? accentColor : 'transparent',
  color: isActive ? '#ffffff' : 'var(--text-secondary)',
  border: 'none',
  borderRadius: '6px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

export default WeatherCharts;
