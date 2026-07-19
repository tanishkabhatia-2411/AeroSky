import type { WeatherData, WeatherAlert, AirQuality, HourlyWeather, DailyForecast, SearchSuggestion } from '../types/weather';

// Preset global cities for autocomplete when offline/no API key is available
const DEFAULT_CITIES: SearchSuggestion[] = [
  { name: 'London', region: 'Greater London', country: 'United Kingdom', lat: 51.52, lon: -0.11 },
  { name: 'New York', region: 'New York', country: 'United States of America', lat: 40.71, lon: -74.01 },
  { name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69 },
  { name: 'Paris', region: 'Ile-de-France', country: 'France', lat: 48.87, lon: 2.33 },
  { name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.87, lon: 151.21 },
  { name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.25, lon: 55.3 },
  { name: 'Reykjavik', region: 'Capital Region', country: 'Iceland', lat: 64.15, lon: -21.95 },
  { name: 'Cairo', region: 'Al Qahirah', country: 'Egypt', lat: 30.05, lon: 31.25 },
  { name: 'Singapore', region: 'Singapore', country: 'Singapore', lat: 1.29, lon: 103.85 },
  { name: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', lat: -22.9, lon: -43.2 },
  { name: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 18.96, lon: 72.82 },
  { name: 'Toronto', region: 'Ontario', country: 'Canada', lat: 43.7, lon: -79.4 },
  { name: 'Cape Town', region: 'Western Cape', country: 'South Africa', lat: -33.93, lon: 18.42 },
  { name: 'Zermatt', region: 'Valais', country: 'Switzerland', lat: 46.02, lon: 7.75 }
];

// Helper to generate a simple hash code from a string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Generate a pseudo-random number based on a seed
function seedRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Create a deterministic Mock Weather Data block for a city
export function generateMockWeather(cityName: string): WeatherData {
  const hash = hashCode(cityName);
  const randVal = (offset: number) => seedRandom(hash + offset);

  // Determine climate archetype based on city name or random hash
  let type: 'hot' | 'cold' | 'wet' | 'cloudy' | 'moderate' = 'moderate';
  const nameLower = cityName.toLowerCase();
  
  if (nameLower.includes('dubai') || nameLower.includes('cairo') || nameLower.includes('sahara') || nameLower.includes('mumbai') || nameLower.includes('delhi')) {
    type = 'hot';
  } else if (nameLower.includes('reykjavik') || nameLower.includes('zermatt') || nameLower.includes('oslo') || nameLower.includes('alaska') || nameLower.includes('siberia')) {
    type = 'cold';
  } else if (nameLower.includes('london') || nameLower.includes('seattle') || nameLower.includes('amsterdam') || nameLower.includes('paris')) {
    type = 'wet';
  } else if (nameLower.includes('san francisco') || nameLower.includes('vancouver') || nameLower.includes('fog')) {
    type = 'cloudy';
  } else {
    // Determine based on hash
    const archetypes: ('hot' | 'cold' | 'wet' | 'cloudy' | 'moderate')[] = ['hot', 'cold', 'wet', 'cloudy', 'moderate'];
    type = archetypes[hash % archetypes.length];
  }

  // Base values depending on type
  let baseTemp = 20; // Celsius
  let baseHum = 65; // %
  let baseCondition = 'Partly Cloudy';
  let condCode = 1003;
  let windSpeed = 12; // kph
  let isNight = false;

  // Let's check if it's currently night based on system clock (optional, we can make it variable)
  const currentHour = new Date().getHours();
  isNight = currentHour < 6 || currentHour > 19;

  switch (type) {
    case 'hot':
      baseTemp = 32 + randVal(1) * 12; // 32 to 44
      baseHum = 20 + randVal(2) * 20;  // 20 to 40
      baseCondition = isNight ? 'Clear' : 'Sunny';
      condCode = 1000;
      windSpeed = 8 + randVal(3) * 10;
      break;
    case 'cold':
      baseTemp = -8 + randVal(1) * 12; // -8 to 4
      baseHum = 75 + randVal(2) * 20;  // 75 to 95
      baseCondition = randVal(4) > 0.5 ? 'Moderate Snow' : 'Overcast';
      condCode = baseCondition === 'Moderate Snow' ? 1219 : 1009;
      windSpeed = 15 + randVal(3) * 20;
      break;
    case 'wet':
      baseTemp = 10 + randVal(1) * 10; // 10 to 20
      baseHum = 80 + randVal(2) * 15;  // 80 to 95
      baseCondition = randVal(4) > 0.4 ? 'Moderate Rain' : 'Patchy Rain Nearby';
      condCode = baseCondition === 'Moderate Rain' ? 1189 : 1063;
      windSpeed = 12 + randVal(3) * 15;
      break;
    case 'cloudy':
      baseTemp = 12 + randVal(1) * 8;  // 12 to 20
      baseHum = 85 + randVal(2) * 12;  // 85 to 97
      baseCondition = 'Mist';
      condCode = 1030;
      windSpeed = 6 + randVal(3) * 8;
      break;
    default:
      baseTemp = 17 + randVal(1) * 10; // 17 to 27
      baseHum = 50 + randVal(2) * 25;  // 50 to 75
      baseCondition = 'Partly Cloudy';
      condCode = 1003;
      windSpeed = 10 + randVal(3) * 10;
      break;
  }

  // Adjust for system time
  if (isNight && condCode === 1000) {
    baseCondition = 'Clear';
  }

  // Lat and Lon
  const lat = (randVal(5) * 140) - 70; // -70 to 70
  const lon = (randVal(6) * 360) - 180; // -180 to 180
  
  // Air Quality
  const usEpa = Math.floor(randVal(7) * 5) + 1; // 1 to 5
  const aqi: AirQuality = {
    co: Math.round(200 + randVal(8) * 800),
    no2: Math.round(10 + randVal(9) * 40),
    o3: Math.round(15 + randVal(10) * 85),
    so2: Math.round(2 + randVal(11) * 10),
    pm2_5: Math.round(5 + randVal(12) * (usEpa * 18)),
    pm10: Math.round(10 + randVal(13) * (usEpa * 30)),
    usEpaIndex: usEpa
  };

  // Weather Alerts
  const alerts: WeatherAlert[] = [];
  if (type === 'hot' && baseTemp > 38) {
    alerts.push({
      headline: 'Extreme Heat Warning',
      severity: 'Extreme',
      urgency: 'Immediate',
      areas: cityName,
      event: 'Heatwave Warning',
      description: 'An extreme heatwave is affecting the region. Temperatures will exceed 40C. Limit outdoor activity and stay hydrated.',
      ends: 'Tomorrow 20:00'
    });
  } else if (type === 'cold' && windSpeed > 30) {
    alerts.push({
      headline: 'Severe Blizzard Warning',
      severity: 'Severe',
      urgency: 'Immediate',
      areas: cityName,
      event: 'Blizzard',
      description: 'Heavy snow accompanied by high winds will create near-zero visibility conditions. Avoid all non-essential travel.',
      ends: 'Tonight 23:59'
    });
  } else if (type === 'wet' && randVal(14) > 0.7) {
    alerts.push({
      headline: 'Flash Flood Advisory',
      severity: 'Moderate',
      urgency: 'Expected',
      areas: cityName,
      event: 'Flood Advisory',
      description: 'Persistent moderate-to-heavy rainfall may lead to localized flooding in low-lying areas. Exercise caution.',
      ends: 'Today 18:00'
    });
  }

  // Hourly Forecast (24 Hours)
  const hourly: HourlyWeather[] = [];
  const startHour = 0;
  for (let i = 0; i < 24; i++) {
    const hr = (startHour + i) % 24;
    // Temperature swing throughout the day
    const tempOffset = -Math.cos(((hr - 6) / 24) * 2 * Math.PI) * 4; // -4 to +4
    const hTempC = Number((baseTemp + tempOffset).toFixed(1));
    const hTempF = Number((hTempC * 1.8 + 32).toFixed(1));
    
    // Condition code variations
    let hCond = baseCondition;
    let hCode = condCode;
    let chanceOfRain = 0;

    if (type === 'wet') {
      chanceOfRain = Math.round(40 + Math.sin(i / 3) * 40); // 0 to 80%
      hCond = chanceOfRain > 60 ? 'Moderate Rain' : 'Patchy Rain Nearby';
      hCode = chanceOfRain > 60 ? 1189 : 1063;
    } else if (type === 'cold') {
      chanceOfRain = Math.round(30 + Math.cos(i / 4) * 30); // 0 to 60%
      hCond = chanceOfRain > 45 ? 'Moderate Snow' : 'Overcast';
      hCode = chanceOfRain > 45 ? 1219 : 1009;
    } else if (type === 'hot') {
      chanceOfRain = 0;
      hCond = hr < 6 || hr > 19 ? 'Clear' : 'Sunny';
      hCode = 1000;
    } else {
      chanceOfRain = Math.round(Math.max(0, Math.sin(i / 2) * 30));
      hCond = chanceOfRain > 20 ? 'Light Rain' : 'Partly Cloudy';
      hCode = chanceOfRain > 20 ? 1183 : 1003;
    }

    const padHour = String(hr).padStart(2, '0');

    hourly.push({
      time: `${padHour}:00`,
      temp_c: hTempC,
      temp_f: hTempF,
      condition: hCond,
      icon: getWeatherIconFromCode(hCode, hr < 6 || hr > 19),
      chance_of_rain: chanceOfRain,
      humidity: Math.min(100, Math.round(baseHum - tempOffset * 2)),
      wind_kph: Math.round(windSpeed + Math.sin(i) * 5),
      wind_mph: Math.round((windSpeed + Math.sin(i) * 5) * 0.621371)
    });
  }

  // Daily Forecast (7 Days)
  const forecast: DailyForecast[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    const dayName = dayNames[nextDay.getDay()];
    const dateStr = nextDay.toISOString().split('T')[0];

    // Temperature trend
    const trendOffset = Math.sin(i / 1.5) * 3; // -3 to 3
    const maxC = Number((baseTemp + 4 + trendOffset + randVal(i + 15) * 2).toFixed(1));
    const minC = Number((baseTemp - 4 + trendOffset - randVal(i + 22) * 2).toFixed(1));

    let fCond = baseCondition;
    let fCode = condCode;
    let fRainChance = 0;

    if (type === 'wet') {
      fRainChance = Math.round(50 + randVal(i + 30) * 40);
      fCond = fRainChance > 70 ? 'Moderate Rain' : 'Patchy Rain Nearby';
      fCode = fRainChance > 70 ? 1189 : 1063;
    } else if (type === 'cold') {
      fRainChance = Math.round(30 + randVal(i + 30) * 50);
      fCond = fRainChance > 60 ? 'Moderate Snow' : 'Overcast';
      fCode = fRainChance > 60 ? 1219 : 1009;
    } else if (type === 'hot') {
      fRainChance = 0;
      fCond = 'Sunny';
      fCode = 1000;
    } else {
      fRainChance = Math.round(randVal(i + 30) * 50);
      fCond = fRainChance > 30 ? 'Light Rain' : 'Partly Cloudy';
      fCode = fRainChance > 30 ? 1183 : 1003;
    }

    forecast.push({
      date: dateStr,
      dayName,
      max_temp_c: maxC,
      max_temp_f: Number((maxC * 1.8 + 32).toFixed(1)),
      min_temp_c: minC,
      min_temp_f: Number((minC * 1.8 + 32).toFixed(1)),
      condition: fCond,
      icon: getWeatherIconFromCode(fCode, false),
      chance_of_rain: fRainChance,
      humidity: Math.round(baseHum + (randVal(i + 40) * 10 - 5)),
      wind_kph: Math.round(windSpeed + (randVal(i + 45) * 10 - 5)),
      wind_mph: Math.round((windSpeed + (randVal(i + 45) * 10 - 5)) * 0.621371),
      uv: Math.min(11, Math.max(1, Math.round((type === 'hot' ? 8 : 4) + (randVal(i + 50) * 4 - 2)))),
      sunrise: type === 'cold' ? '08:42' : '05:54',
      sunset: type === 'cold' ? '16:15' : '19:48',
      moon_phase: getMoonPhaseFromIndex(Math.floor((hash + i) % 8)),
      moon_illumination: Math.round(randVal(i + 60) * 100),
      pollen_index: Math.max(1, Math.min(5, Math.floor((type === 'hot' ? 4 : 2) + randVal(i + 65) * 2)))
    });
  }

  // Country
  let country = 'Global';
  const matchedCity = DEFAULT_CITIES.find(c => c.name.toLowerCase() === nameLower);
  if (matchedCity) {
    country = matchedCity.country;
  } else {
    const countries = ['United States', 'Japan', 'United Kingdom', 'France', 'Germany', 'Australia', 'Canada', 'Brazil', 'South Africa', 'India'];
    country = countries[hash % countries.length];
  }

  return {
    cityName: cityName.charAt(0).toUpperCase() + cityName.slice(1),
    country,
    lat,
    lon,
    localTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temp_c: Number(baseTemp.toFixed(1)),
    temp_f: Number((baseTemp * 1.8 + 32).toFixed(1)),
    feelslike_c: Number((baseTemp + (randVal(15) * 4 - 2)).toFixed(1)),
    feelslike_f: Number(((baseTemp + (randVal(15) * 4 - 2)) * 1.8 + 32).toFixed(1)),
    condition: baseCondition,
    conditionCode: condCode,
    humidity: baseHum,
    wind_kph: windSpeed,
    wind_mph: Math.round(windSpeed * 0.621371),
    wind_degree: Math.round(randVal(16) * 360),
    wind_dir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][hash % 8],
    pressure_mb: Math.round(1008 + randVal(17) * 15),
    pressure_in: Number(((1008 + randVal(17) * 15) * 0.02953).toFixed(2)),
    visibility_km: type === 'cloudy' ? 3.5 : 10.0,
    visibility_miles: type === 'cloudy' ? 2.1 : 6.2,
    uv: type === 'hot' ? 10 : (type === 'cold' ? 1 : 5),
    cloud: type === 'cloudy' ? 95 : (type === 'hot' ? 0 : 50),
    dewpoint_c: Number((baseTemp - (100 - baseHum) / 5).toFixed(1)),
    dewpoint_f: Number(((baseTemp - (100 - baseHum) / 5) * 1.8 + 32).toFixed(1)),
    precip_mm: type === 'wet' ? 3.2 : 0.0,
    precip_in: type === 'wet' ? 0.12 : 0.0,
    aqi,
    sunrise: forecast[0].sunrise,
    sunset: forecast[0].sunset,
    moon_phase: forecast[0].moon_phase,
    moon_illumination: forecast[0].moon_illumination,
    hourly,
    forecast,
    alerts
  };
}

// Convert a condition code to a representative emoji/lucide name fallback
function getWeatherIconFromCode(code: number, isNight: boolean): string {
  // Return semantic string names that our HeroSection and ForecastSection will translate into specific Lucide components
  if (code === 1000) return isNight ? 'moon' : 'sun';
  if (code === 1003) return isNight ? 'cloud-moon' : 'cloud-sun';
  if (code === 1006 || code === 1009) return 'cloud';
  if (code === 1030 || code === 1135) return 'cloud-fog';
  if (code === 1063 || code === 1183 || code === 1189 || code === 1240) return 'cloud-rain';
  if (code === 1195) return 'cloud-drizzle'; // heavy
  if (code === 1087 || code === 1276) return 'cloud-lightning';
  if (code === 1114 || code === 1219 || code === 1225) return 'snowflake';
  return 'cloud';
}

function getMoonPhaseFromIndex(index: number): string {
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Third Quarter',
    'Waning Crescent'
  ];
  return phases[index % 8];
}

// Main service class
export class WeatherService {
  /**
   * Fetch weather data for a city using the selected provider.
   * If no valid key is provided, it falls back to a deterministic mock engine.
   */
  static async fetchWeather(city: string, apiKey?: string, provider: 'weatherapi' | 'openweathermap' = 'weatherapi'): Promise<WeatherData> {
    if (!apiKey || apiKey.trim() === '') {
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockWeather(city);
    }

    try {
      if (provider === 'openweathermap') {
        const isCoordinateQuery = /^[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?$/.test(city.trim());
        const endpoint = isCoordinateQuery
          ? `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(city.split(',')[0].trim())}&lon=${encodeURIComponent(city.split(',')[1].trim())}&appid=${apiKey}&units=metric&cnt=40`
          : `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&cnt=40`;
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('City not found or invalid API key');
        }

        const data = await response.json();
        return this.transformOpenWeatherData(data, city);
      }

      const isCoordinateQuery = /^[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?$/.test(city.trim());
      const endpoint = isCoordinateQuery
        ? `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=yes&alerts=yes`
        : `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=yes&alerts=yes`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('City not found or invalid API key');
      }

      const data = await response.json();
      return this.transformWeatherData(data);
    } catch (error) {
      console.warn(`${provider === 'openweathermap' ? 'OpenWeatherMap' : 'WeatherAPI'} fetch failed, falling back to Mock Engine:`, error);
      return generateMockWeather(city);
    }
  }

  /**
   * Search for cities to support autocomplete.
   */
  static async searchCities(query: string, _apiKey?: string, _provider: 'weatherapi' | 'openweathermap' = 'weatherapi'): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Search failed');
      }

      const json = await res.json();
      return (json.results || []).map((item: any) => ({
        name: item.name,
        region: item.admin1 || item.admin2 || item.country || '',
        country: item.country,
        lat: item.latitude,
        lon: item.longitude
      }));
    } catch (error) {
      console.warn('Search failed, falling back to local list:', error);
      const q = query.toLowerCase();
      return DEFAULT_CITIES.filter(
        c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
      );
    }
  }

  /**
   * Translate WeatherAPI JSON schema to AeroSky custom schema
   */
  private static transformOpenWeatherData(data: any, cityName: string): WeatherData {
    const city = data.city || {};
    const forecastList = data.list || [];
    const hourly: HourlyWeather[] = forecastList.slice(0, 24).map((entry: any) => {
      const dt = new Date(entry.dt * 1000);
      return {
        time: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temp_c: Number(entry.main.temp.toFixed(1)),
        temp_f: Number((entry.main.temp * 1.8 + 32).toFixed(1)),
        condition: entry.weather?.[0]?.main || 'Clear',
        icon: getWeatherIconFromCode(this.mapOpenWeatherCode(entry.weather?.[0]?.id), dt.getHours() < 6 || dt.getHours() > 19),
        chance_of_rain: Math.round((entry.pop || 0) * 100),
        humidity: entry.main.humidity,
        wind_kph: Math.round(entry.wind?.speed * 3.6),
        wind_mph: Math.round(entry.wind?.speed * 2.237)
      };
    });

    const dailyForecasts: DailyForecast[] = [];
    const dayMap = new Map<string, any[]>();

    forecastList.forEach((entry: any) => {
      const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
      if (!dayMap.has(date)) dayMap.set(date, []);
      dayMap.get(date)?.push(entry);
    });

    dayMap.forEach((entries, date) => {
      const dayData = entries[0] || entries[entries.length - 1];
      const temps = entries.map((e: any) => e.main.temp);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const topEntry = entries.reduce((best: any, current: any) => current.main.temp > best.main.temp ? current : best, entries[0]);
      const rainChance = Math.round((entries.reduce((sum: number, e: any) => sum + (e.pop || 0), 0) / entries.length) * 100);
      const dt = new Date(dayData.dt * 1000);
      dailyForecasts.push({
        date,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()],
        max_temp_c: Number(maxTemp.toFixed(1)),
        max_temp_f: Number((maxTemp * 1.8 + 32).toFixed(1)),
        min_temp_c: Number(minTemp.toFixed(1)),
        min_temp_f: Number((minTemp * 1.8 + 32).toFixed(1)),
        condition: topEntry.weather?.[0]?.main || 'Clear',
        icon: getWeatherIconFromCode(this.mapOpenWeatherCode(topEntry.weather?.[0]?.id), false),
        chance_of_rain: rainChance,
        humidity: Math.round(entries.reduce((sum: number, e: any) => sum + e.main.humidity, 0) / entries.length),
        wind_kph: Math.round(Math.max(...entries.map((e: any) => e.wind?.speed * 3.6))),
        wind_mph: Math.round(Math.max(...entries.map((e: any) => e.wind?.speed * 2.237))),
        uv: 3 + Math.round(rainChance / 20),
        sunrise: '06:00 AM',
        sunset: '08:00 PM',
        moon_phase: 'Waxing Gibbous',
        moon_illumination: 60,
        pollen_index: 2
      });
    });

    const first = forecastList[0];
    const now = new Date(first.dt * 1000);
    const weatherData: WeatherData = {
      cityName: city.name || cityName,
      country: city.country || 'Global',
      lat: city.coord?.lat || 0,
      lon: city.coord?.lon || 0,
      localTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temp_c: Number(first.main.temp.toFixed(1)),
      temp_f: Number((first.main.temp * 1.8 + 32).toFixed(1)),
      feelslike_c: Number(first.main.feels_like.toFixed(1)),
      feelslike_f: Number((first.main.feels_like * 1.8 + 32).toFixed(1)),
      condition: first.weather?.[0]?.main || 'Clear',
      conditionCode: this.mapOpenWeatherCode(first.weather?.[0]?.id),
      humidity: first.main.humidity,
      wind_kph: Math.round(first.wind?.speed * 3.6),
      wind_mph: Math.round(first.wind?.speed * 2.237),
      wind_degree: first.wind?.deg || 0,
      wind_dir: this.getWindDirection(first.wind?.deg || 0),
      pressure_mb: first.main.pressure,
      pressure_in: Number((first.main.pressure * 0.02953).toFixed(2)),
      visibility_km: first.visibility ? first.visibility / 1000 : 10,
      visibility_miles: first.visibility ? first.visibility / 1609.34 : 6.2,
      uv: 3,
      cloud: first.clouds?.all || 0,
      dewpoint_c: Number((first.main.temp - (100 - first.main.humidity) / 5).toFixed(1)),
      dewpoint_f: Number(((first.main.temp - (100 - first.main.humidity) / 5) * 1.8 + 32).toFixed(1)),
      precip_mm: (first.pop || 0) * 10,
      precip_in: Number(((first.pop || 0) * 10) * 0.03937),
      aqi: {
        co: 0,
        no2: 0,
        o3: 0,
        so2: 0,
        pm2_5: 0,
        pm10: 0,
        usEpaIndex: 1
      },
      sunrise: '06:00 AM',
      sunset: '08:00 PM',
      moon_phase: 'Waxing Gibbous',
      moon_illumination: 60,
      hourly,
      forecast: dailyForecasts.slice(0, 7),
      alerts: []
    };

    return weatherData;
  }

  private static mapOpenWeatherCode(code: number): number {
    if (code >= 200 && code < 300) return 1276;
    if (code >= 300 && code < 500) return 1183;
    if (code >= 500 && code < 600) return 1189;
    if (code >= 600 && code < 700) return 1219;
    if (code >= 700 && code < 800) return 1030;
    if (code === 800) return 1000;
    if (code === 801 || code === 802) return 1003;
    if (code >= 803 && code < 900) return 1006;
    return 1003;
  }

  private static getWindDirection(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const val = Math.floor((deg / 45) + 0.5) % 8;
    return directions[val];
  }

  private static transformWeatherData(data: any): WeatherData {
    const current = data.current;
    const location = data.location;
    const forecastDayList = data.forecast?.forecastday || [];
    const todayForecast = forecastDayList[0] || {};
    const astro = todayForecast.astro || {};
    
    // Extract Air Quality index
    const rawAqi = current.air_quality || {};
    const aqi: AirQuality = {
      co: Math.round(rawAqi.co || 0),
      no2: Math.round(rawAqi.no2 || 0),
      o3: Math.round(rawAqi.o3 || 0),
      so2: Math.round(rawAqi.so2 || 0),
      pm2_5: Math.round(rawAqi.pm2_5 || 0),
      pm10: Math.round(rawAqi.pm10 || 0),
      usEpaIndex: rawAqi['us-epa-index'] || 1
    };

    // Extract Alerts
    const rawAlerts = data.alerts?.alert || [];
    const alerts: WeatherAlert[] = rawAlerts.map((a: any) => ({
      headline: a.headline || a.event,
      severity: a.severity || 'Moderate',
      urgency: a.urgency || 'Expected',
      areas: a.areas || '',
      event: a.event || '',
      description: a.desc || a.instruction || '',
      ends: a.expires || ''
    }));

    // Extract Hourly
    // Get hours from today and tomorrow to display 24 hours starting from the current local hour
    const localHour = new Date(location.localtime).getHours();
    let rawHoursCombined: any[] = [];
    
    // Today's hours
    const todayHours = todayForecast.hour || [];
    rawHoursCombined = [...todayHours];

    // If we have tomorrow's forecast, push its hours too
    if (forecastDayList[1]) {
      rawHoursCombined = [...rawHoursCombined, ...(forecastDayList[1].hour || [])];
    }

    // Filter next 24 hours from the current local time
    const hourly: HourlyWeather[] = rawHoursCombined
      .slice(localHour, localHour + 24)
      .map((h: any) => {
        const timeParts = h.time.split(' '); // "2026-07-19 14:00" -> ["2026-07-19", "14:00"]
        const displayTime = timeParts[1] || '00:00';
        return {
          time: displayTime,
          temp_c: h.temp_c,
          temp_f: h.temp_f,
          condition: h.condition?.text || 'Clear',
          icon: getWeatherIconFromCode(h.condition?.code || 1000, h.is_day === 0),
          chance_of_rain: h.chance_of_rain || h.chance_of_snow || 0,
          humidity: h.humidity,
          wind_kph: h.wind_kph,
          wind_mph: h.wind_mph
        };
      });

    // Forecast list mapping
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast: DailyForecast[] = forecastDayList.map((f: any) => {
      const fDate = new Date(f.date);
      const dayName = dayNames[fDate.getDay()];
      const fAstro = f.astro || {};
      
      // Determine pollen index (WeatherAPI doesn't have it natively in standard forecast, we simulate it based on temp/uv)
      const mockPollen = Math.max(1, Math.min(5, Math.floor((f.day?.uv || 3) / 2 + (f.day?.maxtemp_c > 25 ? 2 : 1))));

      return {
        date: f.date,
        dayName,
        max_temp_c: f.day?.maxtemp_c || 0,
        max_temp_f: f.day?.maxtemp_f || 0,
        min_temp_c: f.day?.mintemp_c || 0,
        min_temp_f: f.day?.mintemp_f || 0,
        condition: f.day?.condition?.text || 'Partly Cloudy',
        icon: getWeatherIconFromCode(f.day?.condition?.code || 1003, false),
        chance_of_rain: f.day?.daily_chance_of_rain || f.day?.daily_chance_of_snow || 0,
        humidity: f.day?.avghumidity || 50,
        wind_kph: f.day?.maxwind_kph || 10,
        wind_mph: f.day?.maxwind_mph || 6,
        uv: f.day?.uv || 1,
        sunrise: fAstro.sunrise || '06:00 AM',
        sunset: fAstro.sunset || '08:00 PM',
        moon_phase: fAstro.moon_phase || 'Waxing Gibbous',
        moon_illumination: parseInt(fAstro.moon_illumination || '50', 10),
        pollen_index: mockPollen
      };
    });

    return {
      cityName: location.name,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      localTime: location.localtime.split(' ')[1] || '00:00',
      temp_c: current.temp_c,
      temp_f: current.temp_f,
      feelslike_c: current.feelslike_c,
      feelslike_f: current.feelslike_f,
      condition: current.condition?.text || 'Clear',
      conditionCode: current.condition?.code || 1000,
      humidity: current.humidity,
      wind_kph: current.wind_kph,
      wind_mph: current.wind_mph,
      wind_degree: current.wind_degree,
      wind_dir: current.wind_dir,
      pressure_mb: current.pressure_mb,
      pressure_in: current.pressure_in,
      visibility_km: current.vis_km,
      visibility_miles: current.vis_miles,
      uv: current.uv,
      cloud: current.cloud,
      dewpoint_c: current.dewpoint_c || (current.temp_c - (100 - current.humidity)/5),
      dewpoint_f: current.dewpoint_f || ((current.temp_c - (100 - current.humidity)/5) * 1.8 + 32),
      precip_mm: current.precip_mm,
      precip_in: current.precip_in,
      aqi,
      sunrise: astro.sunrise || '06:00 AM',
      sunset: astro.sunset || '08:00 PM',
      moon_phase: astro.moon_phase || 'Waxing Gibbous',
      moon_illumination: parseInt(astro.moon_illumination || '50', 10),
      hourly,
      forecast,
      alerts
    };
  }
}
