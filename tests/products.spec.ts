import { expect, test } from '@playwright/test';
import productTestData from '../test-data/products.json';
import { expectErrorResponse, expectJsonContentType } from './helpers/apiAssertions';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

test.describe('Products API (GET /api/products & GET /api/products/:id)', () => {
  test('4. Get all products returns 200', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.status()).toBe(200);
    expectJsonContentType(response);
  });

  test('5. Products response is an array', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);
    expectJsonContentType(response);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
  });

  test('6. At least 5 products are returned', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);

    const products: Product[] = await response.json();
    expect(products.length).toBeGreaterThanOrEqual(productTestData.minimumProductCount);
  });

  test('7. Each product contains id, name, price, category and stock', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);

    const products: Product[] = await response.json();
    for (const product of products) {
      expect(typeof product.id).toBe('number');
      expect(Number.isInteger(product.id)).toBe(true);
      expect(typeof product.name).toBe('string');
      expect(product.name.trim().length).toBeGreaterThan(0);
      expect(typeof product.price).toBe('number');
      expect(typeof product.category).toBe('string');
      expect(product.category.trim().length).toBeGreaterThan(0);
      expect(typeof product.stock).toBe('number');
      expect(Number.isInteger(product.stock)).toBe(true);
    }
  });

  test('8. Product price is greater than zero', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);

    const products: Product[] = await response.json();
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('9. Product stock is non-negative', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);

    const products: Product[] = await response.json();
    for (const product of products) {
      expect(product.stock).toBeGreaterThanOrEqual(0);
    }
  });

  test('10. Get existing product by ID returns 200', async ({ request }) => {
    const { id } = productTestData.existingProduct;
    const response = await request.get(`/api/products/${id}`);

    expect(response.status()).toBe(200);
    expectJsonContentType(response);
  });

  test('11. Product ID in response matches requested ID', async ({ request }) => {
    const expected = productTestData.existingProduct;
    const response = await request.get(`/api/products/${expected.id}`);
    expect(response.status()).toBe(200);
    expectJsonContentType(response);

    const product: Product = await response.json();
    expect(product.id).toBe(expected.id);
    expect(product.name).toBe(expected.name);
    expect(product.price).toBe(expected.price);
    expect(product.category).toBe(expected.category);
    expect(product.stock).toBe(expected.stock);
  });

  test('12. Get non-existing product returns 404', async ({ request }) => {
    const response = await request.get(`/api/products/${productTestData.nonExistingProductId}`);
    await expectErrorResponse(response, 404, 'not found');
  });

  test('13. Invalid product ID is handled appropriately', async ({ request }) => {
    for (const invalidId of productTestData.invalidProductIds) {
      const response = await request.get(`/api/products/${invalidId}`);
      await expectErrorResponse(response, 400, 'positive integer');
    }
  });
});
