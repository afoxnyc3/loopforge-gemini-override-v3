import axios, { AxiosError } from 'axios';
import type { CurrentWeatherData, ForecastData, ApiError } from '../types/weather';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function normalizeError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const message =
      err.response?.data?.error ??
      err.response?.data?.message ??
      err.message ??
      'An unexpected error occurred';
    return { message, status };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: 'An unexpected error occurred' };
}

export async function fetchCurrentWeather(city: string): Promise<CurrentWeatherData> {
  try {
    const response = await apiClient.get<CurrentWeatherData>('/weather/current', {
      params: { city },
    });
    return response.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export async function fetchForecast(city: string): Promise<ForecastData> {
  try {
    const response = await apiClient.get<ForecastData>('/weather/forecast', {
      params: { city },
    });
    return response.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

export function getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}
