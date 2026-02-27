import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10); // 15 min
const MAX       = parseInt(process.env.RATE_LIMIT_MAX       ?? '100',    10);

export const rateLimiter = rateLimit({
  windowMs:         WINDOW_MS,
  max:              MAX,
  standardHeaders:  true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders:    false,  // Disable X-RateLimit-* headers
  message: (_req: Request, _res: Response) => ({
    error:      'Too many requests. Please try again later.',
    code:       'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
    timestamp:  new Date().toISOString(),
  }),
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For if behind a proxy, else use remote address
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ip?.trim() ?? req.ip ?? 'unknown';
    }
    return req.ip ?? 'unknown';
  },
});
