import request from 'supertest';
import app from '../../src/app';
import * as weatherService from '../../src/services/weatherService';
import * as cacheService from '../../src/services/cacheService';
import { initDatabase } from '../../src/db/database';

// Use in-memory DB for tests
process.env.DB_PATH = ':memory:';
process.env.OPENWEATHER_API_KEY = 'test-key';

beforeAll(() => {
  initDatabase();
});

jest.mock('../../src/services/weatherService');
jest.mock('../../src/services/cacheService');

const mockCurrentData = {
  city:         'London',
  country:      'GB',
  temperature:  15.5,
  feelsLike:    13.2,
  humidity:     72,
  windSpeed:    5.1,
  windDirection: 180,
  description:  'light rain',
  icon:         '10d',
  visibility:   10000,
  pressure:     1013,
  sunrise:      1700000000,
  sunset:       1700040000,
  timestamp:    1700020000,
  cached:       false,
};

const mockForecastData = {
  city:     'London',
  country:  'GB',
  forecast: [
    {
      date:          '2024-03-15',
      tempMin:       10.0,
      tempMax:       16.0,
      description:   'clear sky',
      icon:          '01d',
      humidity:      70,
      windSpeed:     4.0,
      precipitation: 0,
    },
  ],
  cached: false,
};

describe('GET /api/weather/current', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheService.getCached as jest.Mock).mockReturnValue(null);
    (cacheService.setCached as jest.Mock).mockImplementation(() => {});
  });

  it('returns 200 with weather data for valid city', async () => {
    (weatherService.fetchCurrentWeather as jest.Mock).mockResolvedValueOnce(mockCurrentData);

    const res = await request(app).get('/api/weather/current?city=London');

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('London');
    expect(res.body.temperature).toBe(15.5);
    expect(res.body.humidity).toBe(72);
  });

  it('returns 400 when city parameter is missing', async () => {
    const res = await request(app).get('/api/weather/current');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when city is empty string', async () => {
    const res = await request(app).get('/api/weather/current?city=');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns cached data when available', async () => {
    (cacheService.getCached as jest.Mock).mockReturnValueOnce({ ...mockCurrentData, cached: true });

    const res = await request(app).get('/api/weather/current?city=London');

    expect(res.status).toBe(200);
    expect(res.body.cached).toBe(true);
    expect(weatherService.fetchCurrentWeather).not.toHaveBeenCalled();
  });

  it('returns 404 when city is not found', async () => {
    const { AppError } = await import('../../src/utils/AppError');
    (weatherService.fetchCurrentWeather as jest.Mock).mockRejectedValueOnce(
      new AppError('City "InvalidCity" not found.', 404, 'CITY_NOT_FOUND')
    );

    const res = await request(app).get('/api/weather/current?city=InvalidCity');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('CITY_NOT_FOUND');
  });
});

describe('GET /api/weather/forecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheService.getCached as jest.Mock).mockReturnValue(null);
    (cacheService.setCached as jest.Mock).mockImplementation(() => {});
  });

  it('returns 200 with forecast data for valid city', async () => {
    (weatherService.fetchForecast as jest.Mock).mockResolvedValueOnce(mockForecastData);

    const res = await request(app).get('/api/weather/forecast?city=London');

    expect(res.status).toBe(200);
    expect(res.body.city).toBe('London');
    expect(res.body.forecast).toHaveLength(1);
  });

  it('returns 400 when city parameter is missing', async () => {
    const res = await request(app).get('/api/weather/forecast');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Unknown routes', () => {
  it('returns 404 for undefined routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
