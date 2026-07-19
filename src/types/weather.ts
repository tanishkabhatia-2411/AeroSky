export interface WeatherAlert {
  headline: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme';
  urgency: string;
  areas: string;
  event: string;
  description: string;
  ends: string;
}

export interface AirQuality {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  usEpaIndex: number; // 1 = Good, 2 = Moderate, 3 = Unhealthy for sensitive groups, 4 = Unhealthy, 5 = Very Unhealthy, 6 = Hazardous
}

export interface HourlyWeather {
  time: string; // e.g. "09:00"
  temp_c: number;
  temp_f: number;
  condition: string;
  icon: string;
  chance_of_rain: number;
  humidity: number;
  wind_kph: number;
  wind_mph: number;
}

export interface DailyForecast {
  date: string; // "2026-07-20"
  dayName: string; // "Mon"
  max_temp_c: number;
  max_temp_f: number;
  min_temp_c: number;
  min_temp_f: number;
  condition: string;
  icon: string;
  chance_of_rain: number;
  humidity: number;
  wind_kph: number;
  wind_mph: number;
  uv: number;
  sunrise: string;
  sunset: string;
  moon_phase: string;
  moon_illumination: number;
  pollen_index: number; // 1-5 scale (low to very high)
}

export interface WeatherData {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  localTime: string;
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  condition: string;
  conditionCode: number; // For icon map matching
  humidity: number;
  wind_kph: number;
  wind_mph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number; // hPa
  pressure_in: number; // mmHg / inHg
  visibility_km: number;
  visibility_miles: number;
  uv: number;
  cloud: number;
  dewpoint_c: number;
  dewpoint_f: number;
  precip_mm: number;
  precip_in: number;
  aqi: AirQuality;
  sunrise: string;
  sunset: string;
  moon_phase: string;
  moon_illumination: number;
  hourly: HourlyWeather[];
  forecast: DailyForecast[];
  alerts: WeatherAlert[];
}

export interface AppSettings {
  tempUnit: 'C' | 'F';
  windUnit: 'kmh' | 'mph';
  pressureUnit: 'hPa' | 'mmHg';
  language: 'en' | 'es' | 'fr' | 'de';
  theme: 'dark' | 'light';
  apiKey: string;
  provider: 'weatherapi' | 'openweathermap';
}

export interface SearchSuggestion {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
}
