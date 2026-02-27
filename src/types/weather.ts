// Current weather response from backend proxy
export interface CurrentWeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  visibility: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  timezone: number;
  dt: number;
}

// Single forecast entry
export interface ForecastEntry {
  dt: number;
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  pop: number; // probability of precipitation
}

// 5-day forecast response from backend proxy
export interface ForecastData {
  city: string;
  country: string;
  list: ForecastEntry[];
}

// Combined weather state
export interface WeatherState {
  current: CurrentWeatherData | null;
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// API error shape
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}
