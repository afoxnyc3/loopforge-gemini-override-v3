/**
 * Operational application error with HTTP status code and machine-readable code.
 * Distinguishes known errors (city not found, upstream timeout) from
 * unexpected programmer errors, enabling the error handler to respond
 * appropriately without leaking internals.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name        = 'AppError';
    this.statusCode  = statusCode;
    this.code        = code;
    this.isOperational = true;

    // Maintain correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
