import React, { useState } from 'react';
import { 
  Sun, Moon, Cloud, CloudSun, CloudMoon, CloudRain, 
  CloudDrizzle, CloudLightning, Snowflake, Wind, Droplets, 
  SunDim, ChevronDown, ChevronUp, ShieldAlert
} from 'lucide-react';
import type { WeatherData, AppSettings } from '../types/weather';

interface HeroSectionProps {
  weather: WeatherData;
  settings: AppSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ weather, settings }) => {
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  // Helper to map icon name to Lucide Icon component
  const renderWeatherIcon = (iconName: string, size = 110) => {
    const props = {
      size,
      className: "float-element",
      style: {
        filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))'
      }
    };

    switch (iconName) {
      case 'sun':
        return <Sun {...props} className="float-element pulse-glow" style={{ color: '#f59e0b', ...props.style }} />;
      case 'moon':
        return <Moon {...props} className="float-element pulse-glow" style={{ color: '#e2e8f0', ...props.style }} />;
      case 'cloud-sun':
        return <CloudSun {...props} style={{ color: '#cbd5e1', ...props.style }} />;
      case 'cloud-moon':
        return <CloudMoon {...props} style={{ color: '#94a3b8', ...props.style }} />;
      case 'cloud':
        return <Cloud {...props} style={{ color: '#94a3b8', ...props.style }} />;
      case 'cloud-rain':
        return <CloudRain {...props} style={{ color: '#60a5fa', ...props.style }} />;
      case 'cloud-drizzle':
        return <CloudDrizzle {...props} style={{ color: '#93c5fd', ...props.style }} />;
      case 'cloud-lightning':
        return <CloudLightning {...props} style={{ color: '#c084fc', ...props.style }} />;
      case 'snowflake':
        return <Snowflake {...props} style={{ color: '#93c5fd', ...props.style }} />;
      default:
        return <Cloud {...props} style={{ color: '#94a3b8', ...props.style }} />;
    }
  };

  // Temperature unit helpers
  const getTemp = (c: number, f: number) => {
    return settings.tempUnit === 'C' ? `${Math.round(c)}°C` : `${Math.round(f)}°F`;
  };

  const getWind = (kph: number, mph: number) => {
    return settings.windUnit === 'kmh' ? `${Math.round(kph)} km/h` : `${Math.round(mph)} mph`;
  };

  // Get AQI text and color
  const getAqiInfo = (index: number) => {
    switch (index) {
      case 1: return { text: 'Good', color: '#10b981' };
      case 2: return { text: 'Moderate', color: '#f59e0b' };
      case 3: return { text: 'Sensitive groups', color: '#f97316' };
      case 4: return { text: 'Unhealthy', color: '#ef4444' };
      case 5: return { text: 'Very Unhealthy', color: '#ec4899' };
      case 6: return { text: 'Hazardous', color: '#7c3aed' };
      default: return { text: 'Good', color: '#10b981' };
    }
  };

  const aqiInfo = getAqiInfo(weather.aqi.usEpaIndex);
  
  // Format Date (e.g. "Sunday, July 19")
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const hasAlerts = weather.alerts && weather.alerts.length > 0;

  return (
    <div className="glass-card fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Subtle Glow Overlay */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Severe Weather Alert Header */}
      {hasAlerts && (
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '0.85rem 1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            cursor: 'pointer',
            zIndex: 1,
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.15)'
          }}
          onClick={() => setShowAlertDetails(!showAlertDetails)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#ef4444' }}>
              <ShieldAlert size={20} className="float-element" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem', fontFamily: 'Outfit' }}>
                {weather.alerts[0].headline}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#ef4444' }}>
              {showAlertDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
          
          {showAlertDetails && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.25rem', borderTop: '1px solid rgba(239, 68, 68, 0.15)', paddingTop: '0.5rem' }}>
              {weather.alerts[0].description}
              <br />
              <span style={{ display: 'block', marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Ends: {weather.alerts[0].ends}
              </span>
            </p>
          )}
        </div>
      )}

      {/* City details */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            {weather.cityName}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginTop: '0.2rem' }}>
            {weather.country}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>{formatDate()}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            Local Time: {weather.localTime}
          </p>
        </div>
      </div>

      {/* Temp and icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0', zIndex: 1 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '5.5rem', fontWeight: 800, letterSpacing: '-0.06em', lineHeight: 0.9, background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {getTemp(weather.temp_c, weather.temp_f)}
          </h1>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {weather.condition}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Feels like {getTemp(weather.feelslike_c, weather.feelslike_f)}
          </p>
        </div>
        <div>
          {renderWeatherIcon(getWeatherIconFromCode(weather.conditionCode, false))}
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '1.25rem',
        zIndex: 1
      }}>
        {/* Wind */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <Wind size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>Wind</span>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>
            {getWind(weather.wind_kph, weather.wind_mph)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Direction: {weather.wind_dir}
          </span>
        </div>

        {/* Humidity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <Droplets size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>Humidity</span>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600 }}>
            {weather.humidity}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Dew Pt: {settings.tempUnit === 'C' ? `${Math.round(weather.dewpoint_c)}°` : `${Math.round(weather.dewpoint_f)}°`}
          </span>
        </div>

        {/* Air Quality */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <SunDim size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase' }}>AQI Index</span>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: aqiInfo.color, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: aqiInfo.color }} />
            {aqiInfo.text}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            EPA Index: {weather.aqi.usEpaIndex}/6
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper inside the code (duplicate from service for component independence)
function getWeatherIconFromCode(code: number, isNight: boolean): string {
  if (code === 1000) return isNight ? 'moon' : 'sun';
  if (code === 1003) return isNight ? 'cloud-moon' : 'cloud-sun';
  if (code === 1006 || code === 1009) return 'cloud';
  if (code === 1030 || code === 1135) return 'cloud-fog';
  if ([1063, 1183, 1189, 1240].includes(code)) return 'cloud-rain';
  if (code === 1195) return 'cloud-drizzle';
  if (code === 1087 || code === 1276) return 'cloud-lightning';
  if ([1114, 1219, 1225].includes(code)) return 'snowflake';
  return 'cloud';
}
export default HeroSection;
