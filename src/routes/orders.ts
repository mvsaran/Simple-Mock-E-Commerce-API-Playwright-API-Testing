import crypto from 'node:crypto';
import { NextFunction, Request, Response, Router } from 'express';
import productsData from '../data/products.json';
import { handleMockScenario } from '../handlers/mockScenarioHandler';
import { ErrorResponse, OrderRequest, OrderResponse, Product } from '../types/ecommerce';

const products: Product[] = productsData;

export const ordersRouter = Router();

function validateOrderPayload(
  body: unknown
): { valid: true; data: OrderRequest } | { valid: false; message: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, message: 'Request body must be a JSON object.' };
  }

  const { productId, quantity, customerName } = body as Record<string, unknown>;

  if (productId === undefined || productId === null) {
    return { valid: false, message: 'productId is required.' };
  }

  if (typeof productId !== 'number' || !Number.isInteger(productId) || productId <= 0) {
    return { valid: false, message: 'productId must be a positive integer.' };
  }

  if (quantity === undefined || quantity === null) {
    return { valid: false, message: 'quantity is required.' };
  }

  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return { valid: false, message: 'quantity must be a whole integer.' };
  }

  if (quantity <= 0) {
    return { valid: false, message: 'quantity must be greater than zero.' };
  }

  if (typeof customerName !== 'string' || customerName.trim().length === 0) {
    return { valid: false, message: 'customerName is required and must be a non-empty string.' };
  }

  return {
    valid: true,
    data: {
      productId,
      quantity,
      customerName: customerName.trim()
    }
  };
}

ordersRouter.post(
  '/api/orders',
  async (
    req: Request,
    res: Response<OrderResponse | ErrorResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate payload and stock before running mock scenarios.
      const validation = validateOrderPayload(req.body);
      if (!validation.valid) {
        res.status(400).json({
          error: 'Validation Error',
          message: validation.message
        });
        return;
      }

      const { productId, quantity, customerName } = validation.data;
      const product = products.find((item) => item.id === productId);

      if (!product) {
        res.status(404).json({
          error: 'Product Not Found',
          message: `Product with ID ${productId} was not found.`
        });
        return;
      }

      if (quantity > product.stock) {
        res.status(400).json({
          error: 'Insufficient Stock',
          message: `Requested quantity (${quantity}) exceeds available stock (${product.stock}) for product '${product.name}'.`
        });
        return;
      }

      const scenarioHeader = req.header('x-mock-scenario');
      const handledByScenario = await handleMockScenario(scenarioHeader, res);
      if (handledByScenario) {
        return;
      }

      const totalAmount = Number((product.price * quantity).toFixed(2));
      const orderId = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      res.status(201).json({
        orderId,
        status: 'CONFIRMED',
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category
        },
        quantity,
        customerName,
        totalAmount
      });
    } catch (error) {
      next(error);
    }
  }
);
