// Shared API response types — used by both server and client
// These are the canonical contracts for all weather endpoints

export interface CurrentWeatherResponse {
  city: string;
  country: string;
  temperature: number;        // Celsius
  feelsLike: number;          // Celsius
  humidity: number;           // Percentage 0–100
  windSpeed: number;          // m/s
  windDirection: number;      // Degrees
  description: string;        // e.g. "light rain"
  icon: string;               // OpenWeatherMap icon code e.g. "10d"
  visibility: number;         // Metres
  pressure: number;           // hPa
  sunrise: number;            // Unix timestamp (UTC)
  sunset: number;             // Unix timestamp (UTC)
  timestamp: number;          // Unix timestamp of observation (UTC)
  cached: boolean;            // Whether this response was served from cache
}

export interface ForecastDay {
  date: string;               // ISO 8601 date string e.g. "2024-03-15"
  tempMin: number;            // Celsius
  tempMax: number;            // Celsius
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;      // mm
}

export interface ForecastResponse {
  city: string;
  country: string;
  forecast: ForecastDay[];    // 5 days
  cached: boolean;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  statusCode: number;
  timestamp: string;
}

// OpenWeatherMap raw API shapes (internal — not exposed to client)
export interface OWMCurrentWeather {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: { speed: number; deg: number };
  weather: Array<{ description: string; icon: string }>;
  visibility: number;
  dt: number;
}

export interface OWMForecastItem {
  dt: number;
  main: { temp_min: number; temp_max: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number };
  rain?: { '3h': number };
  dt_txt: string;
}

export interface OWMForecastResponse {
  city: { name: string; country: string };
  list: OWMForecastItem[];
}
