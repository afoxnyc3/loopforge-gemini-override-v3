import axios from 'axios';
import { fetchCurrentWeather, fetchForecast } from '../../src/services/weatherService';
import { AppError } from '../../src/utils/AppError';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockAxiosCreate = jest.fn();
const mockGet = jest.fn();

beforeAll(() => {
  (axios.create as jest.Mock).mockReturnValue({ get: mockGet });
  (axios.isAxiosError as unknown as jest.Mock) = jest.fn();
});

const mockCurrentWeatherResponse = {
  name: 'London',
  sys:  { country: 'GB', sunrise: 1700000000, sunset: 1700040000 },
  main: { temp: 15.5, feels_like: 13.2, humidity: 72, pressure: 1013 },
  wind: { speed: 5.1, deg: 180 },
  weather: [{ description: 'light rain', icon: '10d' }],
  visibility: 10000,
  dt: 1700020000,
};

const mockForecastResponse = {
  city: { name: 'London', country: 'GB' },
  list: [
    {
      dt: 1700020000,
      dt_txt: '2024-03-15 12:00:00',
      main: { temp_min: 10.0, temp_max: 16.0, humidity: 70 },
      weather: [{ description: 'clear sky', icon: '01d' }],
      wind: { speed: 4.0 },
    },
    {
      dt: 1700031600,
      dt_txt: '2024-03-15 15:00:00',
      main: { temp_min: 11.0, temp_max: 17.0, humidity: 65 },
      weather: [{ description: 'clear sky', icon: '01d' }],
      wind: { speed: 3.5 },
    },
    {
      dt: 1700106800,
      dt_txt: '2024-03-16 12:00:00',
      main: { temp_min: 9.0, temp_max: 14.0, humidity: 80 },
      weather: [{ description: 'light rain', icon: '10d' }],
      wind: { speed: 6.0 },
      rain: { '3h': 1.2 },
    },
  ],
};

describe('weatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENWEATHER_API_KEY = 'test-key';
  });

  describe('fetchCurrentWeather', () => {
    it('maps OWM response to CurrentWeatherResponse shape', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeatherResponse });

      const result = await fetchCurrentWeather('London');

      expect(result.city).toBe('London');
      expect(result.country).toBe('GB');
      expect(result.temperature).toBe(15.5);
      expect(result.feelsLike).toBe(13.2);
      expect(result.humidity).toBe(72);
      expect(result.windSpeed).toBe(5.1);
      expect(result.description).toBe('light rain');
      expect(result.icon).toBe('10d');
      expect(result.cached).toBe(false);
    });

    it('throws AppError with 404 when city not found', async () => {
      const axiosError = { isAxiosError: true, response: { status: 404, data: { message: 'city not found' } } };
      mockGet.mockRejectedValueOnce(axiosError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      await expect(fetchCurrentWeather('InvalidCity999')).rejects.toThrow(AppError);
    });

    it('throws AppError with 503 on upstream rate limit', async () => {
      const axiosError = { isAxiosError: true, response: { status: 429, data: {} } };
      mockGet.mockRejectedValueOnce(axiosError);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      await expect(fetchCurrentWeather('London')).rejects.toMatchObject({
        code: 'UPSTREAM_RATE_LIMIT',
        statusCode: 503,
      });
    });
  });

  describe('fetchForecast', () => {
    it('maps OWM forecast response to ForecastResponse shape', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse });

      const result = await fetchForecast('London');

      expect(result.city).toBe('London');
      expect(result.country).toBe('GB');
      expect(result.forecast).toHaveLength(2); // 2 distinct dates in mock
      expect(result.forecast[0]?.date).toBe('2024-03-15');
      expect(result.forecast[0]?.icon).toBe('01d');
      expect(result.cached).toBe(false);
    });

    it('limits forecast to 5 days', async () => {
      const manyDays = Array.from({ length: 40 }, (_, i) => ({
        dt: 1700020000 + i * 10800,
        dt_txt: `2024-03-${String(15 + Math.floor(i / 8)).padStart(2, '0')} ${String((i % 8) * 3).padStart(2, '0')}:00:00`,
        main: { temp_min: 10, temp_max: 18, humidity: 60 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        wind: { speed: 3 },
      }));

      mockGet.mockResolvedValueOnce({
        data: { ...mockForecastResponse, list: manyDays },
      });

      const result = await fetchForecast('London');
      expect(result.forecast.length).toBeLessThanOrEqual(5);
    });
  });
});
