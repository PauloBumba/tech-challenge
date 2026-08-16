import { defineConfig } from '@playwright/test';

/**
 * Roda contra a aplicação real (SPEC 9.7: mesma trilha da entrevista). Suba antes com:
 *   docker compose up --build -d   (web:4200, api:9999)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4200'
  },
  webServer: undefined
});