import { Request, Response } from 'express';
import { ApiErrorResponse } from '../types/api';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiErrorResponse = {
    error:      `Route ${req.method} ${req.path} not found.`,
    code:       'NOT_FOUND',
    statusCode: 404,
    timestamp:  new Date().toISOString(),
  };
  res.status(404).json(response);
}
