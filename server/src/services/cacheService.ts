import { getDatabase } from '../db/database';
import { logger } from '../utils/logger';

const CACHE_TTL_CURRENT  = parseInt(process.env.CACHE_TTL_CURRENT  ?? '600',  10); // 10 min
const CACHE_TTL_FORECAST = parseInt(process.env.CACHE_TTL_FORECAST ?? '1800', 10); // 30 min

export type CacheEndpoint = 'current' | 'forecast';

function buildCacheKey(endpoint: CacheEndpoint, city: string): string {
  return `${endpoint}:${city.toLowerCase().trim()}`;
}

function getTTL(endpoint: CacheEndpoint): number {
  return endpoint === 'current' ? CACHE_TTL_CURRENT : CACHE_TTL_FORECAST;
}

export function getCached<T>(endpoint: CacheEndpoint, city: string): T | null {
  try {
    const db  = getDatabase();
    const key = buildCacheKey(endpoint, city);
    const now = Math.floor(Date.now() / 1000);

    const row = db
      .prepare(
        'SELECT data FROM weather_cache WHERE cache_key = ? AND expires_at > ?'
      )
      .get(key, now) as { data: string } | undefined;

    if (!row) return null;

    logger.debug(`Cache HIT for ${key}`);
    return JSON.parse(row.data) as T;
  } catch (error) {
    logger.warn('Cache read error', { error });
    return null;
  }
}

export function setCached<T>(endpoint: CacheEndpoint, city: string, data: T): void {
  try {
    const db        = getDatabase();
    const key       = buildCacheKey(endpoint, city);
    const now       = Math.floor(Date.now() / 1000);
    const expiresAt = now + getTTL(endpoint);

    db.prepare(`
      INSERT INTO weather_cache (cache_key, endpoint, city, data, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(cache_key) DO UPDATE SET
        data       = excluded.data,
        created_at = excluded.created_at,
        expires_at = excluded.expires_at
    `).run(key, endpoint, city.toLowerCase().trim(), JSON.stringify(data), now, expiresAt);

    logger.debug(`Cache SET for ${key}, TTL=${getTTL(endpoint)}s`);
  } catch (error) {
    logger.warn('Cache write error', { error });
    // Non-fatal — continue without caching
  }
}

export function invalidateCache(endpoint: CacheEndpoint, city: string): void {
  try {
    const db  = getDatabase();
    const key = buildCacheKey(endpoint, city);
    db.prepare('DELETE FROM weather_cache WHERE cache_key = ?').run(key);
    logger.debug(`Cache INVALIDATED for ${key}`);
  } catch (error) {
    logger.warn('Cache invalidation error', { error });
  }
}

export function purgeExpiredCache(): number {
  try {
    const db  = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db
      .prepare('DELETE FROM weather_cache WHERE expires_at < ?')
      .run(now);
    return result.changes;
  } catch (error) {
    logger.warn('Cache purge error', { error });
    return 0;
  }
}
