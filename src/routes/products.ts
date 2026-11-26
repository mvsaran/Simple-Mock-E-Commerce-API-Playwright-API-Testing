import { Request, Response, Router } from 'express';
import productsData from '../data/products.json';
import { ErrorResponse, Product } from '../types/ecommerce';

const products: Product[] = productsData;

export const productsRouter = Router();

productsRouter.get('/api/products', (_req: Request, res: Response<Product[]>) => {
  res.status(200).json(products);
});

productsRouter.get('/api/products/:id', (req: Request, res: Response<Product | ErrorResponse>) => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsedId = Number(rawId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    res.status(400).json({
      error: 'Invalid Product ID',
      message: 'Product ID must be a positive integer.'
    });
    return;
  }

  const product = products.find((item) => item.id === parsedId);

  if (!product) {
    res.status(404).json({
      error: 'Product Not Found',
      message: `Product with ID ${parsedId} was not found.`
    });
    return;
  }

  res.status(200).json(product);
});
