import 'dotenv/config';
import app from './app';
import { initDatabase } from './db/database';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function bootstrap(): Promise<void> {
  try {
    // Initialize SQLite database and create tables
    initDatabase();
    logger.info('Database initialized successfully');

    app.listen(PORT, () => {
      logger.info(`Weather API proxy server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
