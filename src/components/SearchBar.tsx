import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, History, X, StarOff } from 'lucide-react';
import { WeatherService } from '../services/weatherService';
import type { SearchSuggestion } from '../types/weather';

interface SearchBarProps {
  onCitySelect: (cityName: string) => void;
  currentCity: string;
  apiKey?: string;
  provider?: 'weatherapi' | 'openweathermap';
}

export const SearchBar: React.FC<SearchBarProps> = ({ onCitySelect, currentCity, apiKey, provider = 'weatherapi' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load favorites & recents on mount
  useEffect(() => {
    const storedFavs = localStorage.getItem('aerosky_favs');
    if (storedFavs) setFavorites(JSON.parse(storedFavs));

    const storedRecents = localStorage.getItem('aerosky_recents');
    if (storedRecents) setRecents(JSON.parse(storedRecents));
  }, []);

  // Handle outside clicks to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with a basic debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const results = await WeatherService.searchCities(query, apiKey, provider);
        setSuggestions(results);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, apiKey, provider]);

  const handleSelect = (cityName: string) => {
    onCitySelect(cityName);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);

    // Add to recents (max 5)
    setRecents(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
      const updated = [cityName, ...filtered].slice(0, 5);
      localStorage.setItem('aerosky_recents', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    handleSelect(trimmed);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(currentCity)) {
      updated = favorites.filter(c => c.toLowerCase() !== currentCity.toLowerCase());
    } else {
      updated = [...favorites, currentCity];
    }
    setFavorites(updated);
    localStorage.setItem('aerosky_favs', JSON.stringify(updated));
  };

  const removeRecent = (cityToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecents(prev => {
      const updated = prev.filter(c => c !== cityToRemove);
      localStorage.setItem('aerosky_recents', JSON.stringify(updated));
      return updated;
    });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const j = await r.json();
          const placeName = j.city || j.locality || j.principalSubdivision || j.countryName || 'Current Location';
          handleSelect(placeName);
        } catch (error) {
          console.warn('Reverse geocoding failed, falling back to coordinates:', error);
          handleSelect(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
        }
      },
      (error) => {
        alert('Geolocation failed: ' + error.message + '. Please search manually.');
      }
    );
  };

  const isFavorite = favorites.some(f => f.toLowerCase() === currentCity.toLowerCase());

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      {/* Search Input Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: '2.75rem', paddingRight: '2.5rem' }}
            placeholder="Search city worldwide..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          {query && (
            <X
              size={16}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
            />
          )}
        </div>

        <button
          className="icon-button"
          title="Search entered location"
          onClick={handleSearch}
          style={{ borderColor: 'rgba(255,255,255,0.16)' }}
        >
          <Search size={16} />
        </button>

        {/* Current Location Button */}
        <button
          className="icon-button"
          title="Current GPS Location"
          onClick={handleGeolocation}
        >
          <MapPin size={18} />
        </button>

        {/* Favorite Star Button */}
        <button
          className="icon-button"
          title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          onClick={toggleFavorite}
          style={{
            borderColor: isFavorite ? 'rgba(245, 158, 11, 0.4)' : 'var(--glass-border)',
            color: isFavorite ? '#f59e0b' : 'var(--text-primary)'
          }}
        >
          {isFavorite ? <StarOff size={18} /> : <Star size={18} />}
        </button>
      </div>

      {/* Autocomplete Dropdown Panel */}
      {showDropdown && (query.length >= 2 || recents.length > 0 || favorites.length > 0) && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            width: '100%',
            zIndex: 999,
            padding: '0.75rem',
            maxHeight: '350px',
            overflowY: 'auto',
            border: '1px solid var(--glass-border-hover)'
          }}
        >
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Suggestions</div>
              {suggestions.map((s, idx) => (
                <div
                  key={`${s.name}-${idx}`}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onClick={() => handleSelect(`${s.name}, ${s.country}`)}
                  className="search-item-hover"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Search size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {s.region ? `${s.region}, ` : ''}{s.country}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Autocomplete Empty State */}
          {query.trim().length >= 2 && suggestions.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'grid', gap: '0.75rem' }}>
              <div>No suggestions found.</div>
              <button
                className="glow-button"
                style={{ width: '100%', padding: '0.7rem', fontSize: '0.9rem' }}
                onClick={handleSearch}
              >
                Search "{query.trim()}" anyway
              </button>
            </div>
          )}

          {/* Favorite Cities List */}
          {query.trim().length < 2 && favorites.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Pinned Cities</div>
              {favorites.map((city, idx) => (
                <div
                  key={`fav-${idx}`}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition-smooth)'
                  }}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <span style={{ fontWeight: 500 }}>{city}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Searches List */}
          {query.trim().length < 2 && recents.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Recent Searches</div>
              {recents.map((city, idx) => (
                <div
                  key={`recent-${idx}`}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition-smooth)'
                  }}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontWeight: 500 }}>{city}</span>
                  </div>
                  <X
                    size={14}
                    style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                    onClick={(e) => removeRecent(city, e)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default SearchBar;
