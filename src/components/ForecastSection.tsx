import React, { useMemo } from 'react';
import { 
  Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, 
  CloudDrizzle, CloudLightning, Snowflake, Calendar, Clock, Droplets, Wind
} from 'lucide-react';
import type { WeatherData, AppSettings } from '../types/weather';

interface ForecastSectionProps {
  weather: WeatherData;
  settings: AppSettings;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ weather, settings }) => {

  // Helper to map icon name to Lucide Icon component
  const renderWeatherIcon = (iconName: string, size = 24) => {
    const props = { size };
    switch (iconName) {
      case 'sun':
        return <Sun {...props} style={{ color: '#f59e0b' }} />;
      case 'moon':
        return <Moon {...props} style={{ color: '#e2e8f0' }} />;
      case 'cloud-sun':
        return <CloudSun {...props} style={{ color: '#cbd5e1' }} />;
      case 'cloud-moon':
        return <CloudMoon {...props} style={{ color: '#94a3b8' }} />;
      case 'cloud':
        return <Cloud {...props} style={{ color: '#94a3b8' }} />;
      case 'cloud-rain':
        return <CloudRain {...props} style={{ color: '#60a5fa' }} />;
      case 'cloud-drizzle':
        return <CloudDrizzle {...props} style={{ color: '#93c5fd' }} />;
      case 'cloud-lightning':
        return <CloudLightning {...props} style={{ color: '#c084fc' }} />;
      case 'snowflake':
        return <Snowflake {...props} style={{ color: '#93c5fd' }} />;
      default:
        return <Cloud {...props} style={{ color: '#94a3b8' }} />;
    }
  };

  // Temperature unit helpers
  const formatTemp = (c: number, f: number) => {
    return settings.tempUnit === 'C' ? `${Math.round(c)}°` : `${Math.round(f)}°`;
  };

  const getWind = (kph: number, mph: number) => {
    return settings.windUnit === 'kmh' ? `${Math.round(kph)} kmh` : `${Math.round(mph)} mph`;
  };

  // Compute absolute min & max temperatures for the week to draw Apple Weather range bars
  const weekTempRange = useMemo(() => {
    if (!weather.forecast || weather.forecast.length === 0) return { min: 0, max: 100 };
    
    let absMin = Infinity;
    let absMax = -Infinity;

    weather.forecast.forEach(d => {
      const min = settings.tempUnit === 'C' ? d.min_temp_c : d.min_temp_f;
      const max = settings.tempUnit === 'C' ? d.max_temp_c : d.max_temp_f;
      if (min < absMin) absMin = min;
      if (max > absMax) absMax = max;
    });

    return { min: absMin, max: absMax };
  }, [weather.forecast, settings.tempUnit]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Hourly Forecast Carousel */}
      <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <Clock size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Hourly Forecast (Next 24h)</span>
        </div>
        
        <div className="forecast-scroll-container">
          {weather.hourly.map((hour, idx) => (
            <div key={idx} className="forecast-scroll-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {hour.time}
              </span>
              <div style={{ margin: '0.2rem 0' }}>
                {renderWeatherIcon(hour.icon, 28)}
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {formatTemp(hour.temp_c, hour.temp_f)}
              </span>
              
              {/* Chance of Rain Indicator */}
              {hour.chance_of_rain > 0 ? (
                <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '1px' }}>
                  <Droplets size={9} />
                  {hour.chance_of_rain}%
                </span>
              ) : (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>-</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. 7-Day / Multi-Day Forecast List */}
      <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <Calendar size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>7-Day Forecast</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {weather.forecast.map((day, idx) => {
            const dayMin = settings.tempUnit === 'C' ? day.min_temp_c : day.min_temp_f;
            const dayMax = settings.tempUnit === 'C' ? day.max_temp_c : day.max_temp_f;
            const totalSpan = weekTempRange.max - weekTempRange.min;
            
            // Calculate Apple Weather bar dimensions
            const leftPercent = totalSpan > 0 ? ((dayMin - weekTempRange.min) / totalSpan) * 100 : 0;
            const widthPercent = totalSpan > 0 ? ((dayMax - dayMin) / totalSpan) * 100 : 100;

            return (
              <div 
                key={day.date} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 40px 100px 1fr 100px', 
                  alignItems: 'center', 
                  gap: '1rem',
                  padding: '0.65rem 0.5rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid transparent',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Weekday */}
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {idx === 0 ? 'Today' : day.dayName}
                </span>

                {/* Icon */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {renderWeatherIcon(day.icon, 22)}
                </div>

                {/* Rain Probability / Condition summary */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {day.condition}
                  </span>
                  {day.chance_of_rain > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Droplets size={10} />
                      {day.chance_of_rain}%
                    </span>
                  )}
                </div>

                {/* Apple Weather Style Temp Range Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '25px', textAlign: 'right' }}>
                    {Math.round(dayMin)}°
                  </span>
                  
                  {/* Visual Bar Track */}
                  <div style={{ 
                    flex: 1, 
                    height: '6px', 
                    background: 'rgba(255,255,255,0.06)', 
                    borderRadius: '99px',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #38bdf8, #f59e0b)',
                      borderRadius: '99px'
                    }} />
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: 600, width: '25px' }}>
                    {Math.round(dayMax)}°
                  </span>
                </div>

                {/* Daily secondary stats (Wind + Humidity) */}
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Wind size={12} />
                    {getWind(day.wind_kph, day.wind_mph).split(' ')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Droplets size={12} />
                    {day.humidity}%
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
export default ForecastSection;
