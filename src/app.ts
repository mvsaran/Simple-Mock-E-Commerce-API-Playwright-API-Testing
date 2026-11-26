import express, { Express } from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { healthRouter } from './routes/health';
import { ordersRouter } from './routes/orders';
import { productsRouter } from './routes/products';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);

  app.use(healthRouter);
  app.use(productsRouter);
  app.use(ordersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
