import { defineConfig } from '@playwright/test';

const baseURL = process.env.API_BASE_URL || 'http://localhost:4001';
const isUsingRealApi = Boolean(process.env.API_BASE_URL);

export default defineConfig({
  testDir: './tests',
  timeout: 15000,
  fullyParallel: true,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  },
  webServer: isUsingRealApi
    ? undefined
    : {
        command: 'node node_modules/tsx/dist/cli.mjs src/server.ts',
        url: 'http://localhost:4001/health',
        reuseExistingServer: true,
        timeout: 30000
      }
});
