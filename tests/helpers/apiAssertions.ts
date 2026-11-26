import { APIResponse, expect } from '@playwright/test';

export function expectJsonContentType(response: APIResponse): void {
  const contentType = response.headers()['content-type'];
  expect(contentType, 'Expected response Content-Type header to include application/json').toBeDefined();
  expect(contentType).toContain('application/json');
}

export async function expectErrorResponse(
  response: APIResponse,
  expectedStatus: number,
  expectedMessageSubstring?: string
): Promise<{ error: string; message: string }> {
  expect(response.status()).toBe(expectedStatus);
  expectJsonContentType(response);

  const body = await response.json();
  expect(typeof body.error).toBe('string');
  expect(body.error.length).toBeGreaterThan(0);
  expect(typeof body.message).toBe('string');
  expect(body.message.length).toBeGreaterThan(0);

  if (expectedMessageSubstring) {
    expect(body.message.toLowerCase()).toContain(expectedMessageSubstring.toLowerCase());
  }

  return body;
}
