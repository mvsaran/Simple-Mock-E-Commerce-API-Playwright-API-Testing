import { Request, Response, Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'Mock E-Commerce API',
    status: 'UP',
    message: 'Welcome! Use one of the API endpoints below.',
    endpoints: {
      health: 'GET /health',
      products: 'GET /api/products',
      productById: 'GET /api/products/:id',
      createOrder: 'POST /api/orders'
    }
  });
});

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'Mock E-Commerce API'
  });
});
