import React from 'react';
import { Settings, Key, Globe, Moon, Sun, ShieldCheck } from 'lucide-react';
import type { AppSettings } from '../types/weather';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {

  const handleUnitChange = (key: keyof AppSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    
    // Theme side-effect
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    
    onSettingsChange(updated);
    localStorage.setItem('aerosky_settings', JSON.stringify(updated));
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...settings, apiKey: e.target.value };
    onSettingsChange(updated);
    localStorage.setItem('aerosky_settings', JSON.stringify(updated));
  };

  const handleProviderChange = (provider: AppSettings['provider']) => {
    const updated = { ...settings, provider };
    onSettingsChange(updated);
    localStorage.setItem('aerosky_settings', JSON.stringify(updated));
  };

  return (
    <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Settings Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        <Settings size={16} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          App Settings
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* 1. Temperature Unit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Temperature Unit</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Choose Celsius or Fahrenheit</div>
          </div>
          <div style={toggleContainerStyle}>
            <button 
              style={toggleButtonStyle(settings.tempUnit === 'C')}
              onClick={() => handleUnitChange('tempUnit', 'C')}
            >
              °C
            </button>
            <button 
              style={toggleButtonStyle(settings.tempUnit === 'F')}
              onClick={() => handleUnitChange('tempUnit', 'F')}
            >
              °F
            </button>
          </div>
        </div>

        {/* 2. Wind Unit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Wind Speed Unit</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Choose Metric or Imperial wind units</div>
          </div>
          <div style={toggleContainerStyle}>
            <button 
              style={toggleButtonStyle(settings.windUnit === 'kmh')}
              onClick={() => handleUnitChange('windUnit', 'kmh')}
            >
              km/h
            </button>
            <button 
              style={toggleButtonStyle(settings.windUnit === 'mph')}
              onClick={() => handleUnitChange('windUnit', 'mph')}
            >
              mph
            </button>
          </div>
        </div>

        {/* 3. Pressure Unit */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Pressure Unit</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Choose hPa or mmHg scale</div>
          </div>
          <div style={toggleContainerStyle}>
            <button 
              style={toggleButtonStyle(settings.pressureUnit === 'hPa')}
              onClick={() => handleUnitChange('pressureUnit', 'hPa')}
            >
              hPa
            </button>
            <button 
              style={toggleButtonStyle(settings.pressureUnit === 'mmHg')}
              onClick={() => handleUnitChange('pressureUnit', 'mmHg')}
            >
              mmHg
            </button>
          </div>
        </div>

        {/* 4. Theme Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Application Theme</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Switch dark or light appearance</div>
          </div>
          <div style={toggleContainerStyle}>
            <button 
              style={toggleButtonStyle(settings.theme === 'dark')}
              onClick={() => handleUnitChange('theme', 'dark')}
              title="Dark Theme"
            >
              <Moon size={14} style={{ marginRight: '2px' }} /> Dark
            </button>
            <button 
              style={toggleButtonStyle(settings.theme === 'light')}
              onClick={() => handleUnitChange('theme', 'light')}
              title="Light Theme"
            >
              <Sun size={14} style={{ marginRight: '2px' }} /> Light
            </button>
          </div>
        </div>

        {/* 5. Language Selection */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>System Language</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select default translation</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', border: '1px solid var(--glass-border)', padding: '0.35rem 0.5rem', color: 'var(--text-primary)' }}>
            <Globe size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={settings.language}
              onChange={(e) => handleUnitChange('language', e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en" style={{ background: '#090d16', color: '#fff' }}>English</option>
              <option value="es" style={{ background: '#090d16', color: '#fff' }}>Español</option>
              <option value="fr" style={{ background: '#090d16', color: '#fff' }}>Français</option>
              <option value="de" style={{ background: '#090d16', color: '#fff' }}>Deutsch</option>
            </select>
          </div>
        </div>

        {/* 6. Weather Provider Selection */}
        <div 
          style={{ 
            marginTop: '0.5rem', 
            borderTop: '1px solid var(--glass-border)', 
            paddingTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Key size={15} style={{ color: 'var(--accent-secondary)' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Weather Provider</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', border: '1px solid var(--glass-border)', padding: '0.35rem 0.5rem', color: 'var(--text-primary)' }}>
            <select
              value={settings.provider}
              onChange={(e) => handleProviderChange(e.target.value as AppSettings['provider'])}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="weatherapi" style={{ background: '#090d16', color: '#fff' }}>WeatherAPI.com</option>
              <option value="openweathermap" style={{ background: '#090d16', color: '#fff' }}>OpenWeatherMap</option>
            </select>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
            Use a free API key from your selected provider to fetch live weather for any city worldwide. If left empty, AeroSky uses its built-in mock engine.
          </p>
          <input
            type="password"
            className="glass-input"
            style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
            placeholder={settings.provider === 'openweathermap' ? 'Enter OpenWeatherMap API Key...' : 'Enter WeatherAPI.com API Key...'}
            value={settings.apiKey}
            onChange={handleApiKeyChange}
          />
          {settings.apiKey && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '0.2rem' }}>
              <ShieldCheck size={14} />
              <span>Live weather is active with the selected provider.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// Styling variables
const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  background: 'rgba(0,0,0,0.15)',
  padding: '0.2rem',
  borderRadius: '10px',
  border: '1px solid var(--glass-border)'
};

const toggleButtonStyle = (isActive: boolean): React.CSSProperties => ({
  background: isActive ? 'var(--accent-primary)' : 'transparent',
  color: isActive ? '#ffffff' : 'var(--text-secondary)',
  border: 'none',
  borderRadius: '6px',
  padding: '0.35rem 0.65rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s ease'
});

export default SettingsPanel;
