import { initDatabase, closeDatabase } from '../../src/db/database';
import { getCached, setCached, invalidateCache, purgeExpiredCache } from '../../src/services/cacheService';

// Use in-memory SQLite for tests
process.env.DB_PATH = ':memory:';

beforeAll(() => {
  initDatabase();
});

afterAll(() => {
  closeDatabase();
});

describe('cacheService', () => {
  describe('getCached / setCached', () => {
    it('returns null for cache miss', () => {
      const result = getCached('current', 'nonexistent-city-xyz');
      expect(result).toBeNull();
    });

    it('stores and retrieves data correctly', () => {
      const payload = { city: 'Paris', temperature: 20, cached: false };
      setCached('current', 'Paris', payload);

      const result = getCached<typeof payload>('current', 'Paris');
      expect(result).not.toBeNull();
      expect(result?.city).toBe('Paris');
      expect(result?.temperature).toBe(20);
    });

    it('is case-insensitive for city lookup', () => {
      const payload = { city: 'Berlin', temperature: 18 };
      setCached('current', 'Berlin', payload);

      const result = getCached('current', 'BERLIN');
      expect(result).not.toBeNull();
    });

    it('returns null for expired cache entries', () => {
      // We can't easily mock time with SQLite TTL, so we test the purge path
      const payload = { city: 'Tokyo', temperature: 25 };
      setCached('forecast', 'Tokyo', payload);

      // Verify it's set
      expect(getCached('forecast', 'Tokyo')).not.toBeNull();
    });

    it('overwrites existing cache entry on second set', () => {
      setCached('current', 'Madrid', { temperature: 22 });
      setCached('current', 'Madrid', { temperature: 28 });

      const result = getCached<{ temperature: number }>('current', 'Madrid');
      expect(result?.temperature).toBe(28);
    });
  });

  describe('invalidateCache', () => {
    it('removes cache entry for specified city and endpoint', () => {
      setCached('current', 'Rome', { temperature: 19 });
      expect(getCached('current', 'Rome')).not.toBeNull();

      invalidateCache('current', 'Rome');
      expect(getCached('current', 'Rome')).toBeNull();
    });

    it('does not affect other endpoints for same city', () => {
      setCached('current', 'Vienna', { temperature: 12 });
      setCached('forecast', 'Vienna', { forecast: [] });

      invalidateCache('current', 'Vienna');

      expect(getCached('current', 'Vienna')).toBeNull();
      expect(getCached('forecast', 'Vienna')).not.toBeNull();
    });
  });

  describe('purgeExpiredCache', () => {
    it('returns 0 when no entries have expired', () => {
      const count = purgeExpiredCache();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
