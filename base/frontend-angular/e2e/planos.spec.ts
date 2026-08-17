import { test, expect } from '@playwright/test';

/**
 * Smoke test de ponta a ponta do módulo de Planos, no mesmo caminho que o
 * Beneficiários: cadastrar, provocar erro, filtrar, editar e excluir. Roda
 * contra a aplicação real subida por `docker compose up` (web na 4200).
 */
const WEB = process.env.WEB_URL ?? 'http://localhost:4200';
const NOME = 'E2E Plano Teste';

test('fluxo completo de plano (cadastro, erro, filtro, edição, exclusão)', async ({ page }) => {
  const nome = `${NOME} ${Date.now()}`;
  const codigoAns = String(Math.floor(100000 + Math.random() * 900000));

  await page.goto(`${WEB}/planos`);

  await expect(page.getByRole('heading', { name: 'Planos', exact: true })).toBeVisible();

  // 1. Cadastro
  const form = page.locator('form.formulario');
  await page.getByRole('button', { name: 'Novo plano' }).click();
  await form.getByLabel('Nome do plano').fill(nome);
  await form.getByLabel('Código ANS').fill(codigoAns);
  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(page.getByText(nome)).toBeVisible();

  // 2. ANS duplicado vira mensagem de erro na tela
  await page.getByRole('button', { name: 'Novo plano' }).click();
  await form.getByLabel('Nome do plano').fill(`${nome} Duplicado`);
  await form.getByLabel('Código ANS').fill(codigoAns);
  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(page.getByText(/já existe plano/i)).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // 3. Filtro por nome reflete a lista
  const busca = page.getByPlaceholder('Nome do plano');
  await busca.fill(nome);
  await expect(page.getByText(nome)).toBeVisible();
  await busca.fill('Plano que não existe 98765');
  await expect(page.getByText(nome)).toBeHidden();
  await busca.fill('');
  await expect(page.getByText(nome)).toBeVisible();

  // 4. Edição
  await page.getByRole('row', { name: new RegExp(nome) }).getByRole('button', { name: 'Editar' }).click();
  await form.getByLabel('Nome do plano').fill(`${nome} Editado`);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText(`${nome} Editado`)).toBeVisible();

  // 5. Exclusão só some após sucesso do DELETE
  await page
    .getByRole('row', { name: new RegExp(`${nome} Editado`) })
    .getByRole('button', { name: 'Excluir' })
    .click();
  await page.getByRole('button', { name: 'Excluir plano' }).click();
  await expect(page.getByRole('row', { name: new RegExp(`${nome} Editado`) })).toBeHidden();
});