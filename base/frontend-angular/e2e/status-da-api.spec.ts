import { test, expect } from '@playwright/test';

test('indicador de saúde da API fica online com a API no ar', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await expect(page.getByText('API online')).toBeVisible();
});

test('indicador de saúde marca API offline quando a API falha', async ({ page }) => {
  // Intercepta /health e simula falha de rede — mesmo caminho de CORS/API fora do ar.
  await page.route('**/health', (route) => route.abort('connectionrefused'));
  await page.goto('http://localhost:4200');
  await expect(page.getByText('API offline')).toBeVisible();
});
