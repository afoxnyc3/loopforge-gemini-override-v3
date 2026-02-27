import axios, { AxiosError } from 'axios';
import {
  CurrentWeatherResponse,
  ForecastResponse,
  ForecastDay,
  OWMCurrentWeather,
  OWMForecastResponse,
  OWMForecastItem,
} from '../types/api';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

const BASE_URL  = process.env.OPENWEATHER_BASE_URL ?? 'https://api.openweathermap.org/data/2.5';
const API_KEY   = process.env.OPENWEATHER_API_KEY ?? '';
const TIMEOUT   = 8000; // ms

if (!API_KEY) {
  logger.warn('OPENWEATHER_API_KEY is not set — API calls will fail');
}

const owmClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  params: {
    appid: API_KEY,
    units: 'metric',
  },
});

// ── Current Weather ──────────────────────────────────────────────────────────

export async function fetchCurrentWeather(city: string): Promise<CurrentWeatherResponse> {
  try {
    logger.info(`Fetching current weather for city: ${city}`);
    const { data } = await owmClient.get<OWMCurrentWeather>('/weather', {
      params: { q: city },
    });

    return mapCurrentWeather(data);
  } catch (error) {
    throw mapAxiosError(error, city, 'current weather');
  }
}

function mapCurrentWeather(raw: OWMCurrentWeather): Omit<CurrentWeatherResponse, 'cached'> & { cached: false } {
  const weather = raw.weather[0];
  return {
    city:         raw.name,
    country:      raw.sys.country,
    temperature:  Math.round(raw.main.temp * 10) / 10,
    feelsLike:    Math.round(raw.main.feels_like * 10) / 10,
    humidity:     raw.main.humidity,
    windSpeed:    Math.round(raw.wind.speed * 10) / 10,
    windDirection: raw.wind.deg,
    description:  weather?.description ?? '',
    icon:         weather?.icon ?? '',
    visibility:   raw.visibility,
    pressure:     raw.main.pressure,
    sunrise:      raw.sys.sunrise,
    sunset:       raw.sys.sunset,
    timestamp:    raw.dt,
    cached:       false,
  };
}

// ── Forecast ─────────────────────────────────────────────────────────────────

export async function fetchForecast(city: string): Promise<ForecastResponse> {
  try {
    logger.info(`Fetching 5-day forecast for city: ${city}`);
    const { data } = await owmClient.get<OWMForecastResponse>('/forecast', {
      params: { q: city, cnt: 40 }, // 40 × 3h slots = 5 days
    });

    return mapForecast(data);
  } catch (error) {
    throw mapAxiosError(error, city, 'forecast');
  }
}

function mapForecast(raw: OWMForecastResponse): Omit<ForecastResponse, 'cached'> & { cached: false } {
  const dailyMap = new Map<string, OWMForecastItem[]>();

  // Group 3-hour slots by date
  for (const item of raw.list) {
    const date = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
    if (!date) continue;
    if (!dailyMap.has(date)) dailyMap.set(date, []);
    dailyMap.get(date)!.push(item);
  }

  const forecast: ForecastDay[] = [];

  for (const [date, slots] of dailyMap) {
    if (forecast.length >= 5) break;

    const temps        = slots.map((s) => s.main.temp_min).concat(slots.map((s) => s.main.temp_max));
    const tempMin      = Math.round(Math.min(...temps) * 10) / 10;
    const tempMax      = Math.round(Math.max(...temps) * 10) / 10;
    const humidity     = Math.round(slots.reduce((sum, s) => sum + s.main.humidity, 0) / slots.length);
    const windSpeed    = Math.round((slots.reduce((sum, s) => sum + s.wind.speed, 0) / slots.length) * 10) / 10;
    const precipitation = slots.reduce((sum, s) => sum + (s.rain?.['3h'] ?? 0), 0);

    // Use the midday slot (or closest) for icon/description
    const midSlot = slots.find((s) => s.dt_txt.includes('12:00:00')) ?? slots[Math.floor(slots.length / 2)];
    const weather = midSlot?.weather[0];

    forecast.push({
      date,
      tempMin,
      tempMax,
      description:  weather?.description ?? '',
      icon:         weather?.icon ?? '',
      humidity,
      windSpeed,
      precipitation: Math.round(precipitation * 10) / 10,
    });
  }

  return {
    city:     raw.city.name,
    country:  raw.city.country,
    forecast,
    cached:   false,
  };
}

// ── Error Mapping ─────────────────────────────────────────────────────────────

function mapAxiosError(error: unknown, city: string, context: string): AppError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ message?: string; cod?: string | number }>;
    const status   = axiosErr.response?.status;
    const owmMsg   = axiosErr.response?.data?.message;

    if (status === 404) {
      return new AppError(
        `City "${city}" not found. Please check the spelling and try again.`,
        404,
        'CITY_NOT_FOUND'
      );
    }
    if (status === 401) {
      return new AppError(
        'Invalid API key. Please configure a valid OpenWeatherMap API key.',
        500,
        'INVALID_API_KEY'
      );
    }
    if (status === 429) {
      return new AppError(
        'OpenWeatherMap API rate limit exceeded. Please try again later.',
        503,
        'UPSTREAM_RATE_LIMIT'
      );
    }
    if (axiosErr.code === 'ECONNABORTED') {
      return new AppError(
        `Request to weather service timed out while fetching ${context}.`,
        504,
        'UPSTREAM_TIMEOUT'
      );
    }

    logger.error(`OpenWeatherMap API error [${status}] for ${context}`, { owmMsg, city });
    return new AppError(
      owmMsg ?? `Failed to fetch ${context} from weather service.`,
      502,
      'UPSTREAM_ERROR'
    );
  }

  logger.error(`Unexpected error fetching ${context}`, { error, city });
  return new AppError(`An unexpected error occurred while fetching ${context}.`, 500, 'INTERNAL_ERROR');
}
