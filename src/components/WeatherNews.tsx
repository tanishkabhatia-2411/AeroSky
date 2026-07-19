import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Leaf, Info } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  source: string;
  time: string;
  summary: string;
  category: 'Global' | 'Science' | 'Environment';
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: 'La Niña Patterns Forecasted to Intensify in Latam and Pacific Regions',
    source: 'Climate Monitor',
    time: '2 hours ago',
    summary: 'Meteorologists predict a 75% increase in cooling ocean currents, leading to severe precipitation anomalies and shifting crop yields across South America.',
    category: 'Science'
  },
  {
    id: 2,
    title: 'Cities Adopt Green Infrastructure to Combat Localized Urban Heat Island Effects',
    source: 'EcoUrbanism',
    time: '5 hours ago',
    summary: 'Metropolitan zones are integrating green roofs, cooling corridors, and reflective pavements to lower ambient temperatures by up to 4°C.',
    category: 'Environment'
  },
  {
    id: 3,
    title: 'Arctic Sea Ice Reaches Annual Maximum, Reflecting Rapid Thermal Fluctuations',
    source: 'Polar Watch',
    time: '1 day ago',
    summary: 'Satellite data reveals a thinner ice sheet density, raising long-term sea-level projections and shifting global jet streams.',
    category: 'Global'
  }
];

const CLIMATE_FACTS = [
  'A average-sized cumulus cloud weighs about 1.1 million pounds—the equivalent of 100 elephants.',
  'Lightning strikes the Earth approximately 8.6 million times per day, or about 100 times per second.',
  'The highest temperature ever officially recorded on Earth was 56.7°C (134°F) in Death Valley, California.',
  'The coldest temperature ever recorded on Earth was -89.2°C (-128.6°F) at Vostok Station, Antarctica.',
  'Raindrops are not actually teardrop-shaped; they look more like tiny hamburger buns due to air resistance.'
];

export const WeatherNews: React.FC = () => {
  const [factIndex, setFactIndex] = useState(0);

  // Auto-rotate climate facts every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % CLIMATE_FACTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }}>
      
      {/* 1. Global Weather News Grid */}
      <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <Newspaper size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Climate & Weather News
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {NEWS_ARTICLES.map((article) => (
            <div 
              key={article.id}
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'var(--transition-smooth)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'var(--glass-border-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 700, 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '6px', 
                  background: article.category === 'Science' ? 'rgba(168, 85, 247, 0.15)' : (article.category === 'Environment' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
                  color: article.category === 'Science' ? '#c084fc' : (article.category === 'Environment' ? '#34d399' : '#60a5fa'),
                  textTransform: 'uppercase'
                }}>
                  {article.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{article.time}</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.35, color: 'var(--text-primary)' }}>
                {article.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {article.summary}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                <span>Read Full Coverage</span>
                <ExternalLink size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Did-You-Know Climate Fact Card */}
      <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Leaf size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Eco & Climate Facts
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, justifyContent: 'center' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', alignSelf: 'flex-start' }}>
            <Info size={20} />
          </div>
          <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center' }}>
            <p style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              transition: 'all 0.5s ease'
            }}>
              "{CLIMATE_FACTS[factIndex]}"
            </p>
          </div>
        </div>

        {/* Rotation Dots */}
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', marginTop: '1rem' }}>
          {CLIMATE_FACTS.map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: idx === factIndex ? '#10b981' : 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => setFactIndex(idx)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
export default WeatherNews;
