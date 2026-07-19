import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, SVGOverlay } from 'react-leaflet';
import L from 'leaflet';
import { Cloud, Thermometer, Wind, Droplets, Radio } from 'lucide-react';
import type { WeatherData, AppSettings } from '../types/weather';

// Fix leaflet icon path issues in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface WeatherMapProps {
  weather: WeatherData;
  settings: AppSettings;
}

// Controller component to center/fly map to the target city coordinates
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 9, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, map]);
  return null;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ weather, settings }) => {
  const [activeLayer, setActiveLayer] = useState<'temp' | 'clouds' | 'wind' | 'rain' | 'radar'>('radar');
  const cityCenter = useMemo<[number, number]>(() => [weather.lat, weather.lon], [weather.lat, weather.lon]);

  // Leaflet Tile URLs
  const baseTileUrl = settings.theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Render a custom animated SVG overlay for weather radar/effects
  const renderWeatherOverlay = () => {
    // Generate bounds around the city (roughly ~1 degree latitude/longitude box)
    const bounds: L.LatLngBoundsExpression = [
      [weather.lat - 0.6, weather.lon - 0.8],
      [weather.lat + 0.6, weather.lon + 0.8]
    ];

    switch (activeLayer) {
      case 'radar':
        // Pulsing radar circles
        return (
          <SVGOverlay bounds={bounds}>
            <rect x="0" y="0" width="100%" height="100%" fill="none" />
            {/* Animated Radar Pulse circles */}
            <circle cx="50%" cy="50%" r="15%" fill="rgba(34, 197, 94, 0.05)" stroke="#22c55e" strokeWidth="1.5">
              <animate attributeName="r" values="5%;35%" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50%" cy="50%" r="30%" fill="rgba(34, 197, 94, 0.02)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4">
              <animate attributeName="r" values="15%;50%" dur="3.5s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="3.5s" begin="1s" repeatCount="indefinite" />
            </circle>
            {/* Mock Storm Cells */}
            <circle cx="45%" cy="48%" r="4%" fill="rgba(239, 68, 68, 0.45)" filter="blur(5px)" />
            <circle cx="52%" cy="54%" r="6%" fill="rgba(249, 115, 22, 0.4)" filter="blur(6px)" />
            <circle cx="48%" cy="52%" r="8%" fill="rgba(34, 197, 94, 0.3)" filter="blur(8px)" />
          </SVGOverlay>
        );

      case 'temp':
        // Heatmap gradient overlay
        const tempColor = weather.temp_c > 30 ? 'rgba(239, 68, 68, 0.3)' : (weather.temp_c < 10 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)');
        return (
          <SVGOverlay bounds={bounds}>
            <defs>
              <radialGradient id="tempGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={tempColor.replace('0.3', '0.6')} />
                <stop offset="60%" stopColor={tempColor} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="50%" cy="50%" r="45%" fill="url(#tempGlow)" />
          </SVGOverlay>
        );

      case 'clouds':
        // Drifting clouds overlay
        return (
          <SVGOverlay bounds={bounds}>
            <defs>
              <filter id="cloudBlur">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <g filter="url(#cloudBlur)">
              {/* Animated Cloud Bubbles drifting */}
              <circle cx="40%" cy="45%" r="12%" fill="rgba(255, 255, 255, 0.15)">
                <animate attributeName="cx" values="35%;45%;35%" dur="20s" repeatCount="indefinite" />
              </circle>
              <circle cx="60%" cy="50%" r="15%" fill="rgba(255, 255, 255, 0.18)">
                <animate attributeName="cx" values="65%;55%;65%" dur="25s" repeatCount="indefinite" />
              </circle>
              <circle cx="50%" cy="48%" r="18%" fill="rgba(255, 255, 255, 0.1)">
                <animate attributeName="cy" values="45%;52%;45%" dur="18s" repeatCount="indefinite" />
              </circle>
            </g>
          </SVGOverlay>
        );

      case 'wind':
        // Wind vector lines
        return (
          <SVGOverlay bounds={bounds}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="rgba(6, 182, 212, 0.7)" />
              </marker>
            </defs>
            {/* Draw flowing lines rotated by wind degree */}
            <g transform={`rotate(${weather.wind_degree} ${window.innerWidth / 2} ${window.innerHeight / 2})`}>
              <line x1="20%" y1="30%" x2="40%" y2="30%" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arrow)">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
              </line>
              <line x1="30%" y1="60%" x2="50%" y2="60%" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arrow)">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1.5s" repeatCount="indefinite" />
              </line>
              <line x1="50%" y1="40%" x2="70%" y2="40%" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="5" markerEnd="url(#arrow)">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="2.2s" repeatCount="indefinite" />
              </line>
            </g>
          </SVGOverlay>
        );

      case 'rain':
        // Animated raindrops overlay
        return (
          <SVGOverlay bounds={bounds}>
            <rect x="0" y="0" width="100%" height="100%" fill="none" />
            <g stroke="#3b82f6" strokeWidth="1.5" opacity="0.6">
              {/* Rain cells */}
              <line x1="35%" y1="30%" x2="33%" y2="40%">
                <animate attributeName="y1" values="20%;80%" dur="1s" repeatCount="indefinite" />
                <animate attributeName="y2" values="30%;90%" dur="1s" repeatCount="indefinite" />
              </line>
              <line x1="45%" y1="20%" x2="43%" y2="30%">
                <animate attributeName="y1" values="10%;90%" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="y2" values="20%;100%" dur="0.8s" repeatCount="indefinite" />
              </line>
              <line x1="55%" y1="40%" x2="53%" y2="50%">
                <animate attributeName="y1" values="30%;80%" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="y2" values="40%;90%" dur="1.2s" repeatCount="indefinite" />
              </line>
              <circle cx="48%" cy="75%" r="10%" fill="rgba(59, 130, 246, 0.05)" stroke="none" />
            </g>
          </SVGOverlay>
        );

      default:
        return null;
    }
  };

  return (
    <div className="glass-card fade-in" style={{ padding: '1.25rem', height: '420px', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      
      {/* Map Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radio size={16} className="float-element" style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Interactive Weather Radar
          </span>
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
          <button 
            style={buttonStyle(activeLayer === 'radar')} 
            onClick={() => setActiveLayer('radar')}
            title="Radar"
          >
            <Radio size={14} />
          </button>
          <button 
            style={buttonStyle(activeLayer === 'temp')} 
            onClick={() => setActiveLayer('temp')}
            title="Temperature"
          >
            <Thermometer size={14} />
          </button>
          <button 
            style={buttonStyle(activeLayer === 'clouds')} 
            onClick={() => setActiveLayer('clouds')}
            title="Clouds"
          >
            <Cloud size={14} />
          </button>
          <button 
            style={buttonStyle(activeLayer === 'wind')} 
            onClick={() => setActiveLayer('wind')}
            title="Wind"
          >
            <Wind size={14} />
          </button>
          <button 
            style={buttonStyle(activeLayer === 'rain')} 
            onClick={() => setActiveLayer('rain')}
            title="Rain"
          >
            <Droplets size={14} />
          </button>
        </div>
      </div>

      {/* Leaflet Map Frame */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <MapContainer 
          center={cityCenter} 
          zoom={9} 
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', zIndex: 10 }}
        >
          <TileLayer
            attribution={attribution}
            url={baseTileUrl}
          />
          
          <MapController center={cityCenter} />

          {/* Animated Overlay Layer */}
          {renderWeatherOverlay()}

          {/* City Location Marker */}
          <Marker position={cityCenter}>
            <Popup>
              <div style={{ color: '#111827', fontFamily: 'Outfit, sans-serif' }}>
                <strong style={{ fontSize: '1rem' }}>{weather.cityName}</strong>
                <p style={{ margin: '0.2rem 0 0' }}>{weather.condition} | {settings.tempUnit === 'C' ? `${weather.temp_c}°C` : `${weather.temp_f}°F`}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>Showing: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{activeLayer}</strong> layer</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Low</span>
          <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: activeLayer === 'temp' ? 'linear-gradient(90deg, #38bdf8, #f59e0b, #ef4444)' : (activeLayer === 'radar' ? 'linear-gradient(90deg, rgba(34,197,94,0.1), #22c55e, #ef4444)' : 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.6))') }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

// Styles for custom buttons
const buttonStyle = (isActive: boolean): React.CSSProperties => ({
  background: isActive ? 'var(--accent-primary)' : 'transparent',
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

export default WeatherMap;
