# TASK-FE-06 — Infraestrutura E2E do frontend (Playwright) + bug NG0203 corrigido

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-16

## O que mudou

- `package.json` — `@playwright/test` (devDep) + script `e2e`
- `playwright.config.ts` — `testDir: ./e2e`, roda contra a aplicação real (`docker compose up`)
- `e2e/beneficiarios.spec.ts` — smoke test do fluxo da entrevista (SPEC 9.7): cadastro via
  formulário, CPF duplicado vira mensagem na tela (409), filtro por situação não esvazia a
  tela, edição com CPF travado, exclusão que só some após o DELETE
- `.gitignore` — `/test-results`, `/playwright-report`, `/blob-report`, `/.playwright`

## Bug real revelado pelo E2E e corrigido

O primeiro run do Playwright mostrou `ERROR NG0203` no console: `takeUntilDestroyed()` chamado
**sem argumento dentro de um handler de clique** (`salvar()`, `excluir()`, `filtrar()`,
`carregar()` fora do construtor) lança `inject()` fora de injection context — o cadastro/edição/
exclusão simplesmente não acontecia no navegador, mesmo com o build verde e a API funcionando.
Esse bug existia desde a TASK-FE-01..04 e só apareceu com o navegador de verdade (SPEC 9.7 não
testa comportamento). Correção: injetar `DestroyRef` nos 3 componentes
(`beneficiario-lista`, `beneficiario-formulario`, `planos-lista`) e passar
`takeUntilDestroyed(this.destroyRef)`.

## Evidência RED → GREEN

```
$ docker compose up --build -d   # web:4200, api:9999
$ npm run e2e
# ANTES: NG0203 no console, cadastro nunca acontecia — teste falhava
# DEPOIS: 1 passed (fluxo completo: cadastro → erro 409 → filtro → edição → exclusão)
```

## Decisão registrada (se houve)

**Teste usa CPF aleatório válido por execução** (gerado no próprio spec, mesmo algoritmo do
`CpfValidator`). Motivo: o CPF de um beneficiário excluído logicamente continua ocupado
(TASK-BEN-05), então um CPF fixo ficaria bloqueado por registros soft-deleted de execuções
anteriores.

## Uso de IA (se houve)

IA como par — montou a infra Playwright a pedido do Paulo; o diagnóstico do NG0203 (bug real,
não do teste) foi feito a partir do stack do console capturado pelo Playwright. Ver
`../AI_USAGE.md` [TASK-FE-06].