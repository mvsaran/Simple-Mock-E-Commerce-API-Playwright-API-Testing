import { expect, test } from '@playwright/test';
import orderTestData from '../test-data/orders.json';
import { expectErrorResponse, expectJsonContentType } from './helpers/apiAssertions';

test.describe('Orders API (POST /api/orders)', () => {
  test('14. Valid order returns 201', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder
    });

    expect(response.status()).toBe(201);
    expectJsonContentType(response);
  });

  test('15. Order ID is returned', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder,
      headers: {
        'x-mock-scenario': orderTestData.scenarios.success
      }
    });

    expect(response.status()).toBe(201);
    expectJsonContentType(response);

    const body = await response.json();
    expect(typeof body.orderId).toBe('string');
    expect(body.orderId).toMatch(/^ORD-[A-Z0-9]+$/);
  });

  test('16. Order status is CONFIRMED', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder
    });

    expect(response.status()).toBe(201);
    expectJsonContentType(response);

    const body = await response.json();
    expect(body.status).toBe('CONFIRMED');
  });

  test('17. Total amount is calculated correctly', async ({ request }) => {
    const order = orderTestData.multiItemOrder;
    const expectedUnitPrice = orderTestData.expectedPrices['2'];
    const expectedTotal = Number((expectedUnitPrice * order.quantity).toFixed(2));

    const response = await request.post('/api/orders', {
      data: order
    });

    expect(response.status()).toBe(201);
    expectJsonContentType(response);

    const body = await response.json();
    expect(body.product).toBeDefined();
    expect(body.product.id).toBe(order.productId);
    expect(body.product.price).toBe(expectedUnitPrice);
    expect(body.quantity).toBe(order.quantity);
    expect(body.customerName).toBe(order.customerName);
    expect(typeof body.totalAmount).toBe('number');
    expect(body.totalAmount).toBe(expectedTotal);
  });

  test('18. Payment failure scenario returns 402', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder,
      headers: {
        'x-mock-scenario': orderTestData.scenarios.paymentFailure
      }
    });

    await expectErrorResponse(response, 402, 'payment declined');
  });

  test('19. Server error scenario returns 500', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder,
      headers: {
        'x-mock-scenario': orderTestData.scenarios.serverError
      }
    });

    await expectErrorResponse(response, 500, 'internal server error');
  });

  test('20. Service unavailable scenario returns 503', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder,
      headers: {
        'x-mock-scenario': orderTestData.scenarios.unavailable
      }
    });

    await expectErrorResponse(response, 503, 'unavailable');
  });

  test('21. Timeout scenario returns 504 after the configured delay', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder,
      headers: {
        'x-mock-scenario': orderTestData.scenarios.timeout
      }
    });
    const elapsedMs = Date.now() - startTime;

    await expectErrorResponse(response, 504, 'timed out');
    expect(elapsedMs).toBeGreaterThanOrEqual(2900);
  });

  test('22. Unsupported scenario returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.validOrder,
      headers: {
        'x-mock-scenario': orderTestData.scenarios.unsupported
      }
    });

    await expectErrorResponse(response, 400, 'unsupported mock scenario');
  });

  test('23. Missing product ID returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.missingProductId
    });

    await expectErrorResponse(response, 400, 'productId');
  });

  test('24. Missing quantity returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.missingQuantity
    });

    await expectErrorResponse(response, 400, 'quantity');
  });

  test('25. Quantity zero returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.zeroQuantity
    });

    await expectErrorResponse(response, 400, 'greater than zero');
  });

  test('26. Negative quantity returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.negativeQuantity
    });

    await expectErrorResponse(response, 400, 'greater than zero');
  });

  test('27. Decimal quantity returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.decimalQuantity
    });

    await expectErrorResponse(response, 400, 'integer');
  });

  test('28. Missing customer name returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.missingCustomerName
    });

    await expectErrorResponse(response, 400, 'customerName');
  });

  test('29. Non-existing product ID returns 404', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.nonExistingProduct
    });

    await expectErrorResponse(response, 404, 'not found');
  });

  test('30. Order quantity greater than available stock returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: orderTestData.invalidOrders.exceedingStock
    });

    await expectErrorResponse(response, 400, 'exceeds available stock');
  });
});
