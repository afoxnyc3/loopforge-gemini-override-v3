import { Request, Response, NextFunction } from 'express';
import { fetchCurrentWeather, fetchForecast } from '../services/weatherService';
import { getCached, setCached } from '../services/cacheService';
import { CurrentWeatherResponse, ForecastResponse } from '../types/api';
import { logger } from '../utils/logger';

// ── GET /api/weather/current ──────────────────────────────────────────────────

export async function getCurrentWeather(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const city = (req.query.city as string).trim();

    // 1. Check cache
    const cached = getCached<CurrentWeatherResponse>('current', city);
    if (cached) {
      logger.info(`Serving cached current weather for "${city}"`);
      res.json({ ...cached, cached: true });
      return;
    }

    // 2. Fetch from OpenWeatherMap
    const data = await fetchCurrentWeather(city);

    // 3. Store in cache
    setCached('current', city, data);

    res.json(data);
  } catch (error) {
    next(error);
  }
}

// ── GET /api/weather/forecast ─────────────────────────────────────────────────

export async function getForecast(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const city = (req.query.city as string).trim();

    // 1. Check cache
    const cached = getCached<ForecastResponse>('forecast', city);
    if (cached) {
      logger.info(`Serving cached forecast for "${city}"`);
      res.json({ ...cached, cached: true });
      return;
    }

    // 2. Fetch from OpenWeatherMap
    const data = await fetchForecast(city);

    // 3. Store in cache
    setCached('forecast', city, data);

    res.json(data);
  } catch (error) {
    next(error);
  }
}
