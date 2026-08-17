import { test, expect } from '@playwright/test';

/**
 * Smoke test de ponta a ponta do módulo de Beneficiários, no mesmo caminho que a
 * entrevista percorre (SPEC 9.7): cadastrar, filtrar, provocar erro, editar, excluir.
 * Roda contra a aplicação real subida por `docker compose up` — web na 4200, API na 9999.
 */
const WEB = process.env.WEB_URL ?? 'http://localhost:4200';
const API = process.env.API_URL ?? 'http://localhost:9999';

const PLANO_ID = '11111111-1111-1111-1111-111111111111';
const NOME = 'E2E Beneficiario Teste';

/** Gera um CPF aleatório e válido — evita colidir com registros antigos (o CPF
 * de um beneficiário excluído logicamente continua ocupado, TASK-BEN-05). */
function gerarCpfValido(): string {
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const digito = (digitos: number[], peso: number): number => {
    const soma = digitos.reduce((acc, d) => acc + d * peso--, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = digito(base, 10);
  const d2 = digito([...base, d1], 11);
  const cpf = `${base.join('')}${d1}${d2}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

test('fluxo completo de beneficiário (cadastro, erro, filtro, edição, exclusão)', async ({ page }) => {
  const cpf = gerarCpfValido();
  const nome = `${NOME} ${Date.now()}`;

  await page.goto(`${WEB}/beneficiarios`);

  await expect(page.getByRole('heading', { name: 'Beneficiários', exact: true })).toBeVisible();

  // 1. Cadastro
  const form = page.locator('form.formulario');
  await page.getByRole('button', { name: 'Novo beneficiário' }).click();
  await form.getByLabel('Nome completo').fill(nome);
  await form.getByLabel('CPF').fill(cpf);
  await form.getByLabel('Data de nascimento').fill('1995-03-10');
  await form.getByLabel('Plano').selectOption(PLANO_ID);
  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(page.getByText(nome)).toBeVisible();

  // 2. CPF duplicado vira mensagem de erro na tela (SPEC 9.5)
  await page.getByRole('button', { name: 'Novo beneficiário' }).click();
  await form.getByLabel('Nome completo').fill(`${nome} Duplicado`);
  await form.getByLabel('CPF').fill(cpf);
  await form.getByLabel('Data de nascimento').fill('1995-03-10');
  await form.getByLabel('Plano').selectOption(PLANO_ID);
  await page.getByRole('button', { name: 'Cadastrar' }).click();

  await expect(page.getByText(/duplicado/i)).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // 3. Filtro por situação reflete a API (não esvazia a tela)
  await page.getByLabel('Situação').selectOption('ATIVO');
  await expect(page.getByText(nome)).toBeVisible();
  await page.getByLabel('Situação').selectOption('');
  await expect(page.getByText(nome)).toBeVisible();

  // 4. Edição
  await page.getByRole('row', { name: new RegExp(nome) }).getByRole('button', { name: 'Editar' }).click();
  const cpfField = form.getByLabel('CPF');
  await expect(cpfField).toBeDisabled();
  await form.getByLabel('Nome completo').fill(`${nome} Editado`);
  await page.getByRole('button', { name: 'Salvar' }).click();

  await expect(page.getByText(`${nome} Editado`)).toBeVisible();

  // 5. Exclusão só some após sucesso do DELETE
  await page
    .getByRole('row', { name: new RegExp(`${nome} Editado`) })
    .getByRole('button', { name: 'Excluir' })
    .click();
  await page.getByRole('button', { name: 'Excluir beneficiário' }).click();
  await expect(page.getByRole('row', { name: new RegExp(`${nome} Editado`) })).toBeHidden();
});
