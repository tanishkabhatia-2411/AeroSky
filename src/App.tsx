import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { SearchBar } from './components/SearchBar';
import { HeroSection } from './components/HeroSection';
import { ForecastSection } from './components/ForecastSection';
import { WeatherDetailsGrid } from './components/WeatherDetailsGrid';
import { WeatherCharts } from './components/WeatherCharts';
import { WeatherMap } from './components/WeatherMap';
import { WeatherNews } from './components/WeatherNews';
import { AiAssistant } from './components/AiAssistant';
import { SettingsPanel } from './components/SettingsPanel';
import { ExtraFeatures } from './components/ExtraFeatures';
import { WeatherService } from './services/weatherService';
import type { WeatherData, AppSettings } from './types/weather';
import { CloudOff, Menu, Sun, X } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  tempUnit: 'C',
  windUnit: 'kmh',
  pressureUnit: 'hPa',
  language: 'en',
  theme: 'dark',
  apiKey: '',
  provider: 'weatherapi'
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCity, setSelectedCity] = useState('London');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const navSections = [
    { id: 'overview', label: 'Overview' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'insights', label: 'Insights' },
    { id: 'map', label: 'Map' },
    { id: 'assistant', label: 'Assistant' }
  ];

  // Load settings on mount and sync element theme attributes
  useEffect(() => {
    const stored = localStorage.getItem('aerosky_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        document.documentElement.setAttribute('data-theme', parsed.theme || 'dark');
      } catch (e) {
        console.error(e);
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSplash) return;

    const sections = navSections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: [0.25, 0.5]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [showSplash]);

  // Fetch weather data when city or api key changes
  useEffect(() => {
    if (showSplash) return; // Wait until splash screen is done

    let active = true;
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await WeatherService.fetchWeather(selectedCity, settings.apiKey, settings.provider);
        if (active) {
          setWeatherData(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'City not found. Please verify spelling.');
          setWeatherData(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      active = false;
    };
  }, [selectedCity, settings.apiKey, settings.provider, showSplash]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileNavOpen(false);
  };

  // Loading Skeletons Renderer
  const renderSkeletons = () => (
    <div className="main-grid" style={{ zIndex: 1 }}>
      {/* Left Column Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="skeleton" style={{ height: '320px', borderRadius: '24px' }} />
        <div className="skeleton" style={{ height: '360px', borderRadius: '24px' }} />
      </div>
      
      {/* Right Column Skeletons */}
      <div className="right-grid">
        <div className="details-grid">
          <div className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />
        </div>
        <div className="skeleton" style={{ height: '350px', borderRadius: '24px' }} />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Splash Screen Logo Intro */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* 2. Interactive Backdrop Particle Overlay */}
      {weatherData && (
        <BackgroundAnimation 
          conditionCode={weatherData.conditionCode} 
          isNight={weatherData.localTime.split(':')[0] ? (parseInt(weatherData.localTime.split(':')[0], 10) < 6 || parseInt(weatherData.localTime.split(':')[0], 10) > 19) : false} 
        />
      )}

      {/* 3. Main Dashboard Body Wrapper */}
      {!showSplash && (
        <div className="app-container">
          
          {/* Premium Sticky Header */}
          <header className="topbar">
            <div className="topbar-main">
              <div className="brand-block">
                <div className="brand-mark">
                  <Sun size={20} className="float-element pulse-glow" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <h1>AeroSky</h1>
                  <span>Premium weather intelligence</span>
                </div>
              </div>

              <div className="topbar-actions">
                <nav className="topbar-nav" aria-label="Section navigation">
                  {navSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`nav-pill ${activeSection === section.id ? 'is-active' : ''}`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
                <button
                  type="button"
                  className="menu-toggle"
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                  aria-expanded={mobileNavOpen}
                  aria-label="Toggle navigation"
                >
                  {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            <div className="topbar-search">
              <SearchBar 
                onCitySelect={setSelectedCity} 
                currentCity={weatherData ? weatherData.cityName : selectedCity} 
                apiKey={settings.apiKey}
                provider={settings.provider}
              />
            </div>

            {mobileNavOpen && (
              <div className="mobile-nav" role="navigation" aria-label="Mobile section navigation">
                {navSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`mobile-nav-item ${activeSection === section.id ? 'is-active' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* 4. Display Error 404 / Custom City Not Found page */}
          {error && (
            <div 
              className="glass-panel fade-in" 
              style={{ 
                margin: '2rem auto', 
                maxWidth: '500px', 
                textAlign: 'center', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1.25rem',
                zIndex: 10
              }}
            >
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '50%' }}>
                <CloudOff size={40} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700 }}>Location Not Found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.45 }}>
                  We couldn't resolve the location "<strong>{selectedCity}</strong>". Please check spelling, verify internet connectivity, or search for a major city.
                </p>
              </div>
              <button 
                className="glow-button"
                onClick={() => setSelectedCity('London')}
                style={{ marginTop: '0.5rem' }}
              >
                Reset to Default City
              </button>
            </div>
          )}

          {/* 5. Main Weather Grid layout */}
          {loading && renderSkeletons()}

          {!loading && weatherData && (
            <main className="main-grid" style={{ zIndex: 1 }}>
              {/* Left Column widgets */}
              <div className="stack-column">
                <section id="overview" className="section-shell">
                  <HeroSection weather={weatherData} settings={settings} />
                </section>
                <section id="forecast" className="section-shell">
                  <ForecastSection weather={weatherData} settings={settings} />
                </section>
              </div>

              {/* Right Column widgets */}
              <div className="right-grid">
                <section id="insights" className="section-shell">
                  <WeatherDetailsGrid weather={weatherData} settings={settings} />
                </section>
                <section className="section-shell">
                  <WeatherCharts weather={weatherData} settings={settings} />
                </section>
                <section id="map" className="section-shell">
                  <WeatherMap weather={weatherData} settings={settings} />
                </section>
                <section id="assistant" className="section-shell">
                  <AiAssistant weather={weatherData} settings={settings} />
                </section>
                <section className="section-shell">
                  <WeatherNews />
                </section>
                <section className="section-shell">
                  <ExtraFeatures weather={weatherData} settings={settings} />
                </section>
                <section className="section-shell">
                  <SettingsPanel settings={settings} onSettingsChange={setSettings} />
                </section>
              </div>
            </main>
          )}

          {showBackToTop && (
            <button
              className="back-to-top-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
            >
              ↑
            </button>
          )}

          {/* Core Footer */}
          <footer className="footer-shell">
            <div>
              <strong>AeroSky</strong>
              <p>Premium weather intelligence for planning, travel, and everyday life.</p>
            </div>
            <div className="footer-links">
              <span>Live forecasts</span>
              <span>AI guidance</span>
              <span>Personalized insights</span>
            </div>
          </footer>

        </div>
      )}
    </>
  );
}

export default App;
