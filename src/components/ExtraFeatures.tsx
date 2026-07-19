import React, { useState } from 'react';
import { Download, Share2, Code, Copy, Check, FileText, Smartphone, RefreshCw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { WeatherData, AppSettings } from '../types/weather';

interface ExtraFeaturesProps {
  weather: WeatherData;
  settings: AppSettings;
}

export const ExtraFeatures: React.FC<ExtraFeaturesProps> = ({ weather, settings }) => {
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isCapturingCard, setIsCapturingCard] = useState(false);

  const getTempString = (c: number, f: number) => {
    return settings.tempUnit === 'C' ? `${Math.round(c)}°C` : `${Math.round(f)}°F`;
  };

  // 1. Export Meteorological Report as PDF
  const handleDownloadPDF = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Styling & Header
      doc.setFillColor(9, 13, 22);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('AEROSKY METEOROLOGICAL REPORT', 15, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      doc.text(`Generated: ${new Date().toLocaleString()} | City: ${weather.cityName}, ${weather.country}`, 15, 30);
      
      // Divider
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1.5);
      doc.line(15, 45, 195, 45);

      // Section 1: Current Weather
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('1. Current Weather Conditions', 15, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      
      const stats = [
        `Temperature: ${getTempString(weather.temp_c, weather.temp_f)} (Feels like ${getTempString(weather.feelslike_c, weather.feelslike_f)})`,
        `Condition: ${weather.condition}`,
        `Humidity: ${weather.humidity}% | Dew Point: ${settings.tempUnit === 'C' ? `${Math.round(weather.dewpoint_c)}°C` : `${Math.round(weather.dewpoint_f)}°F`}`,
        `Wind speed: ${settings.windUnit === 'kmh' ? `${weather.wind_kph} km/h` : `${weather.wind_mph} mph`} (${weather.wind_dir})`,
        `Barometer Pressure: ${settings.pressureUnit === 'hPa' ? `${weather.pressure_mb} hPa` : `${weather.pressure_in} mmHg`}`,
        `UV Radiation Index: ${weather.uv} (Index classification: ${weather.uv >= 8 ? 'Very High/Extreme' : 'Low/Moderate'})`,
        `Air Quality (AQI Index): PM2.5: ${weather.aqi.pm2_5} ug/m3 | PM10: ${weather.aqi.pm10} ug/m3 | US-EPA: ${weather.aqi.usEpaIndex}/6`
      ];

      let yPos = 70;
      stats.forEach((stat) => {
        doc.text(`• ${stat}`, 20, yPos);
        yPos += 8;
      });

      // Section 2: 7-Day Outlook
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text('2. 7-Day Forecast Projections', 15, 140);
      
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(15, 145, 195, 145);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Day', 20, 153);
      doc.text('Condition', 45, 153);
      doc.text('Temp Range', 95, 153);
      doc.text('Rain %', 135, 153);
      doc.text('Humidity', 165, 153);

      doc.setFont('helvetica', 'normal');
      let tableY = 161;
      weather.forecast.forEach((day) => {
        doc.text(day.dayName, 20, tableY);
        doc.text(day.condition.slice(0, 18), 45, tableY);
        doc.text(`${Math.round(settings.tempUnit === 'C' ? day.min_temp_c : day.min_temp_f)}° to ${Math.round(settings.tempUnit === 'C' ? day.max_temp_c : day.max_temp_f)}°`, 95, tableY);
        doc.text(`${day.chance_of_rain}%`, 135, tableY);
        doc.text(`${day.humidity}%`, 165, tableY);
        tableY += 8;
      });

      // Footer notice
      doc.setFillColor(243, 244, 246);
      doc.rect(15, 230, 180, 20, 'F');
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.text('Disclaimer: This report is dynamically compiled from AeroSky forecast arrays. Real-time conditions are subject to change.', 20, 240);
      doc.text('AeroSky Meteorological SaaS Services © 2026. All rights reserved.', 20, 245);

      // Save PDF
      doc.save(`AeroSky_Report_${weather.cityName}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF Report.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 2. Share Weather Card as PNG Image
  const handleCaptureCard = async () => {
    setIsCapturingCard(true);
    // Find the main Hero Card element in DOM
    const cardElement = document.querySelector('.main-grid > div:first-child');
    if (!cardElement) {
      alert('Weather Card element not found.');
      setIsCapturingCard(false);
      return;
    }

    try {
      // Temporarily add styling parameters for canvas snapshot
      const canvas = await html2canvas(cardElement as HTMLElement, {
        backgroundColor: '#070a13',
        scale: 2,
        useCORS: true,
        logging: false
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `AeroSky_Weather_${weather.cityName}.png`;
      link.click();
      
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error('Snapshot failed:', err);
      alert('Could not capture weather card image.');
    } finally {
      setIsCapturingCard(false);
    }
  };

  // 3. Iframe Embed Code generator
  const embedCode = `<iframe src="https://aerosky.weather.app/embed?city=${encodeURIComponent(weather.cityName)}&unit=${settings.tempUnit.toLowerCase()}" width="350" height="150" style="border:none; border-radius:16px; backdrop-filter:blur(8px); background:rgba(11,15,25,0.7);"></iframe>`;

  const copyEmbedToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
      
      {/* 1. Export Tools & PDF Widget Card */}
      <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <FileText size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Data Export & Sharing
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
          {/* PDF Report trigger */}
          <button 
            className="glow-button" 
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)' }}
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
          >
            {isExportingPdf ? (
              <RefreshCw size={15} style={{ animation: 'float-slow 2s infinite' }} />
            ) : (
              <Download size={15} />
            )}
            <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF Report'}</span>
          </button>

          {/* Share png card trigger */}
          <button 
            className="glow-button"
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' }}
            onClick={handleCaptureCard}
            disabled={isCapturingCard}
          >
            <Share2 size={15} />
            <span>{isCapturingCard ? 'Capturing Card...' : (copiedShare ? 'Downloaded!' : 'Download Share Card')}</span>
          </button>
        </div>
      </div>

      {/* 2. Web Widget Embed & PWA status Card */}
      <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <Code size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Integrations & Embeds
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Embedding Widget</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.3 }}>
              Place this responsive meteorological iframe widget on your blog or dashboard.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.5rem 0.75rem' }}>
            <input 
              type="text" 
              readOnly 
              value={embedCode} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                flex: 1,
                outline: 'none'
              }} 
            />
            <button 
              onClick={copyEmbedToClipboard} 
              style={{ background: 'transparent', border: 'none', color: copiedEmbed ? '#10b981' : 'var(--text-primary)', cursor: 'pointer' }}
            >
              {copiedEmbed ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            <Smartphone size={16} style={{ color: '#22c55e' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>PWA Installable & Offline Cache Active</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.25 }}>
                AeroSky is fully installable on mobile & desktop, storing assets via service workers for full offline fallback capability.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
export default ExtraFeatures;
