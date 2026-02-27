import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const DB_PATH = process.env.DB_PATH ?? './data/weather_cache.db';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function initDatabase(): void {
  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -32000'); // 32 MB cache
  db.pragma('foreign_keys = ON');

  createTables();
  logger.info(`SQLite database opened at ${DB_PATH}`);
}

function createTables(): void {
  const database = getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS weather_cache (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      cache_key   TEXT    NOT NULL UNIQUE,
      endpoint    TEXT    NOT NULL,
      city        TEXT    NOT NULL,
      data        TEXT    NOT NULL,
      created_at  INTEGER NOT NULL,
      expires_at  INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cache_key    ON weather_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_expires_at   ON weather_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_city         ON weather_cache(city);
  `);

  // Periodic cleanup of expired entries (runs once on startup)
  const now = Math.floor(Date.now() / 1000);
  const result = database
    .prepare('DELETE FROM weather_cache WHERE expires_at < ?')
    .run(now);

  if (result.changes > 0) {
    logger.info(`Purged ${result.changes} expired cache entries on startup`);
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    logger.info('Database connection closed');
  }
}
