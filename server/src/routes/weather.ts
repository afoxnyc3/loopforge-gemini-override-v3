import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { getCurrentWeather, getForecast } from '../controllers/weatherController';

const router = Router();

// ── Validation Middleware ─────────────────────────────────────────────────────

const validateCity = [
  query('city')
    .trim()
    .notEmpty()
    .withMessage('city query parameter is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('city must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s,.'\-\u00C0-\u024F]+$/)
    .withMessage('city contains invalid characters'),
];

export function handleValidationErrors(
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error:      errors.array()[0]?.msg ?? 'Validation error',
      code:       'VALIDATION_ERROR',
      statusCode: 400,
      timestamp:  new Date().toISOString(),
    });
    return;
  }
  next();
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/weather/current?city={city}
 * Returns current weather data for the specified city.
 */
router.get('/current', validateCity, handleValidationErrors, getCurrentWeather);

/**
 * GET /api/weather/forecast?city={city}
 * Returns 5-day weather forecast for the specified city.
 */
router.get('/forecast', validateCity, handleValidationErrors, getForecast);

export default router;
