import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiErrorResponse } from '../types/api';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  if (err instanceof AppError) {
    // Known, operational error — log at warn level
    logger.warn(`[${err.code}] ${err.message}`, {
      statusCode: err.statusCode,
      path:       req.path,
      query:      req.query,
    });

    const response: ApiErrorResponse = {
      error:      err.message,
      code:       err.code,
      statusCode: err.statusCode,
      timestamp,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown / programmer error — log at error level, hide details from client
  logger.error('Unhandled server error', {
    error:   err.message,
    stack:   err.stack,
    path:    req.path,
    query:   req.query,
  });

  const response: ApiErrorResponse = {
    error:      'An internal server error occurred.',
    code:       'INTERNAL_ERROR',
    statusCode: 500,
    timestamp,
  };

  res.status(500).json(response);
}
