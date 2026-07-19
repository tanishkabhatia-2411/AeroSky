import React, { useMemo } from 'react';
import { 
  Sun, Compass, Gauge, Moon, Activity, Shirt
} from 'lucide-react';
import type { WeatherData, AppSettings } from '../types/weather';

interface WeatherDetailsGridProps {
  weather: WeatherData;
  settings: AppSettings;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({ weather, settings }) => {
  
  // Format pressure unit
  const getPressure = (hpa: number, mmhg: number) => {
    return settings.pressureUnit === 'hPa' ? `${hpa} hPa` : `${mmhg} mmHg`;
  };

  // Format visibility
  const getVisibility = (km: number, miles: number) => {
    return settings.windUnit === 'kmh' ? `${km} km` : `${miles} miles`;
  };

  // 1. Calculate Sun Position percentage (0 to 100) along the arc
  const sunPositionPercent = useMemo(() => {
    try {
      // Parse "06:12 AM" or "18:42" into minutes
      const parseTimeToMinutes = (timeStr: string) => {
        let hours = 0;
        let minutes = 0;
        const clean = timeStr.trim().toUpperCase();
        
        if (clean.includes('AM') || clean.includes('PM')) {
          const match = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
          if (match) {
            hours = parseInt(match[1], 10);
            minutes = parseInt(match[2], 10);
            const isPM = match[3] === 'PM';
            if (isPM && hours !== 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
          }
        } else {
          const parts = clean.split(':');
          hours = parseInt(parts[0] || '0', 10);
          minutes = parseInt(parts[1] || '0', 10);
        }
        return hours * 60 + minutes;
      };

      const sunriseMin = parseTimeToMinutes(weather.sunrise);
      const sunsetMin = parseTimeToMinutes(weather.sunset);
      
      const currentParts = weather.localTime.split(':');
      const currentMin = parseInt(currentParts[0] || '0', 10) * 60 + parseInt(currentParts[1] || '0', 10);

      if (currentMin < sunriseMin || currentMin > sunsetMin) {
        return -1; // Sun is below the horizon
      }

      const totalDaylight = sunsetMin - sunriseMin;
      const currentDaylight = currentMin - sunriseMin;
      return (currentDaylight / totalDaylight) * 100;
    } catch (e) {
      return 50; // fallback center
    }
  }, [weather.sunrise, weather.sunset, weather.localTime]);

  // Compute coordinates on the arc for sun position
  const sunArcStyle = useMemo(() => {
    if (sunPositionPercent === -1) return { display: 'none' };
    
    // Convert percentage to angle (0 to PI radians)
    const angle = (sunPositionPercent / 100) * Math.PI;
    // Map to a semi-circle coordinates
    const x = 50 - Math.cos(angle) * 40; // 10% to 90%
    const y = 80 - Math.sin(angle) * 65; // top offset
    
    return {
      left: `${x}%`,
      top: `${y}px`,
      display: 'block'
    };
  }, [sunPositionPercent]);

  // 2. Weather Activity recommendations (Sports/Travel/Clothing)
  const recommendations = useMemo(() => {
    const temp = weather.temp_c;
    const isRain = weather.precip_mm > 0 || weather.condition.toLowerCase().includes('rain') || weather.condition.toLowerCase().includes('drizzle');
    const isSnow = weather.condition.toLowerCase().includes('snow');
    const wind = weather.wind_kph;
    const uv = weather.uv;

    let clothing = 'Comfortable light clothing. Wear sunglasses.';
    let outdoor = 'Excellent day for outdoor exploration.';
    let running = 'Perfect conditions for a jog.';
    let driving = 'Normal driving conditions. Dry roads.';
    let umbrellaNeeded = false;

    // Umbrella & Rain Checks
    if (isRain) {
      clothing = 'Waterproof jacket, raincoat, and boots.';
      outdoor = 'Outdoor activities not recommended due to rain.';
      running = 'Wet conditions. Avoid outdoor runs or run on a track.';
      driving = 'Slippery roads. Reduce speed. Heavy rain warning.';
      umbrellaNeeded = true;
    } else if (isSnow) {
      clothing = 'Heavy winter coat, scarf, gloves, and thermal wear.';
      outdoor = 'Freezing temperature. Bundle up if going outside.';
      running = 'Icy paths. Heavy indoor cardio recommended.';
      driving = 'Snow/ice alert on roads. Winter tires advised.';
    } else if (temp < 10) {
      clothing = 'Wear a warm coat, layers, and boots.';
      outdoor = 'Chilly weather. Dress in layers.';
      running = 'Brisk running. Wear full thermal running tights.';
      driving = 'Good road visibility. Check for black ice.';
    } else if (temp > 30) {
      clothing = 'Lightweight shorts, t-shirt, sunglasses, and cap.';
      outdoor = 'High heat hazard. Limit direct sun exposure.';
      running = 'Avoid running in peak heat. Jog early morning.';
      driving = 'Normal. Keep the AC running.';
    }

    // UV checks
    if (uv >= 6) {
      clothing += ' Apply SPF 30+ sunscreen. Wear a hat.';
    }

    // Wind checks
    if (wind > 35) {
      driving = 'High crosswinds. Drive with caution, hold steering firmly.';
      running = 'High headwind. Difficult running conditions.';
      outdoor = 'Very windy. Secure loose outdoor objects.';
    }

    return { clothing, outdoor, running, driving, umbrellaNeeded };
  }, [weather.temp_c, weather.precip_mm, weather.condition, weather.wind_kph, weather.uv]);

  // UV risk category mapping
  const uvCategory = (val: number) => {
    if (val <= 2) return 'Low';
    if (val <= 5) return 'Moderate';
    if (val <= 7) return 'High';
    if (val <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <div className="details-grid fade-in">
      
      {/* 1. UV Index Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Sun size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>UV Index</span>
        </div>
        <div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{weather.uv}</span>
          <span style={{ marginLeft: '0.5rem', fontSize: '1rem', fontWeight: 600, color: weather.uv >= 8 ? 'var(--temp-hot)' : 'var(--text-primary)' }}>
            {uvCategory(weather.uv)}
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', position: 'relative', marginTop: '0.5rem' }}>
          <div style={{
            position: 'absolute',
            left: 0,
            width: `${Math.min(100, (weather.uv / 11) * 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)',
            borderRadius: '99px'
          }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35 }}>
          {weather.uv >= 6 ? 'Sun protection is essential. Seek shade.' : 'Safe levels. Low solar radiation risk.'}
        </p>
      </div>

      {/* 2. Sunrise & Sunset Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Sun size={16} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Sun Position</span>
        </div>
        
        {/* Sun Path Visualizer */}
        <div className="sun-path-container">
          <div className="sun-arc" />
          <div className="sun-position" style={sunArcStyle} />
          <div style={{ position: 'absolute', bottom: '2px', left: '8%', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{weather.sunrise}</div>
          <div style={{ position: 'absolute', bottom: '2px', right: '8%', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{weather.sunset}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Sunrise: </span>
            <span style={{ fontWeight: 600 }}>{weather.sunrise}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Sunset: </span>
            <span style={{ fontWeight: 600 }}>{weather.sunset}</span>
          </div>
        </div>
      </div>

      {/* 3. Wind Direction & Compass */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Compass size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Wind Compass</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Circular dial */}
          <div style={{
            position: 'relative',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '2px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'absolute', top: '2px', fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)' }}>N</div>
            <div style={{ position: 'absolute', bottom: '2px', fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)' }}>S</div>
            {/* Arrow Pointer rotated by wind_degree */}
            <div 
              style={{
                width: '0',
                height: '0',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '16px solid #ef4444',
                transform: `rotate(${weather.wind_degree}deg)`,
                transformOrigin: '50% 100%',
                position: 'absolute',
                top: '12px'
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{weather.wind_dir}</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              Angle: {weather.wind_degree}°
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Speed: {settings.windUnit === 'kmh' ? `${weather.wind_kph} kph` : `${weather.wind_mph} mph`}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Moon Phase Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Moon size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Moon Phase</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            fontSize: '2.5rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.15))'
          }}>
            {/* Simple Unicode moon symbol representation */}
            {weather.moon_phase.includes('New') && '🌑'}
            {weather.moon_phase.includes('Crescent') && '🌙'}
            {weather.moon_phase.includes('First') && '🌓'}
            {weather.moon_phase.includes('Gibbous') && '🌔'}
            {weather.moon_phase.includes('Full') && '🌕'}
            {weather.moon_phase.includes('Third') && '🌗'}
            {weather.moon_phase.includes('Waning') && '🌘'}
            {!['New', 'Crescent', 'First', 'Gibbous', 'Full', 'Third', 'Waning'].some(p => weather.moon_phase.includes(p)) && '🌙'}
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{weather.moon_phase}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              Illumination: {weather.moon_illumination}%
            </p>
          </div>
        </div>
      </div>

      {/* 5. Visibility & Barometer Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Gauge size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Barometer & Vis</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pressure</div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {getPressure(weather.pressure_mb, weather.pressure_in)}
            </span>
          </div>
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.45rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visibility</div>
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {getVisibility(weather.visibility_km, weather.visibility_miles)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Smart recommendations: Clothing & Activities */}
      <div className="glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <Shirt size={16} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Smart Clothing & Recommendations</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
          {/* Clothing Guidance */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Shirt size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Wear Checklist</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.35 }}>
                {recommendations.clothing}
                {recommendations.umbrellaNeeded && <span style={{ color: '#60a5fa', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>☔ Pack an Umbrella!</span>}
              </p>
            </div>
          </div>

          {/* Activity Indices */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sports & Travel</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.35 }}>
                🏃 {recommendations.running}
                <br />
                🚗 {recommendations.driving}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WeatherDetailsGrid;
