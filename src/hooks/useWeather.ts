import { useState, useCallback } from 'react';
import type { WeatherState, ApiError } from '../types/weather';
import { fetchCurrentWeather, fetchForecast } from '../services/weatherApi';

const initialState: WeatherState = {
  current: null,
  forecast: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export function useWeather() {
  const [state, setState] = useState<WeatherState>(initialState);

  const search = useCallback(async (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(trimmed),
        fetchForecast(trimmed),
      ]);

      setState({
        current,
        forecast,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const apiError = err as ApiError;
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError.message ?? 'Failed to fetch weather data.',
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    search,
    clearError,
    reset,
  };
}
