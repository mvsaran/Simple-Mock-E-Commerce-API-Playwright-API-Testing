import { expect, test } from '@playwright/test';
import productTestData from '../test-data/products.json';
import { expectJsonContentType } from './helpers/apiAssertions';

test.describe('Health Check API (GET /health)', () => {
  test('1. Health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);
    expectJsonContentType(response);
  });

  test('2. Status is UP', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    expectJsonContentType(response);

    const body = await response.json();
    expect(typeof body.status).toBe('string');
    expect(body.status).toBe(productTestData.expectedService.status);
  });

  test('3. Service name is correct', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
    expectJsonContentType(response);

    const body = await response.json();
    expect(typeof body.service).toBe('string');
    expect(body.service).toBe(productTestData.expectedService.service);
  });
});
