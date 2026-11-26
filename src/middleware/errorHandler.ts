import { NextFunction, Request, Response } from 'express';
import { ErrorResponse } from '../types/ecommerce';

/**
 * Handles requests to undefined routes with a consistent 404 JSON payload.
 */
export function notFoundHandler(req: Request, res: Response<ErrorResponse>): void {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`
  });
}

/**
 * Global error-handling middleware so every error returns clean, consistent JSON.
 */
export function errorHandler(
  err: Error & { status?: number; type?: string },
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body.'
    });
    return;
  }

  console.error('Unhandled error:', err.message);
  res.status(err.status ?? 500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.'
  });
}
