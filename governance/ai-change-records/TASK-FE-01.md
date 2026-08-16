# TASK-FE-01 — Listagem de Beneficiários (filtros, paginação, nome do plano)

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-15

## O que mudou

- `src/app/beneficiarios/beneficiario.ts` (novo) — modelos tipados `Beneficiario`,
  `PaginaDeBeneficiarios`, `StatusBeneficiario`, espelhando o envelope `dados/pagina/tamanho/total`
  da API (SPEC 3)
- `src/app/beneficiarios/beneficiario-servico.ts` (novo) — `BeneficiarioServico` com `listar`
  (`HttpParams` com `pagina`/`tamanho`/`status`/`plano_id`), `criar`, `atualizar`, `excluir`;
  padrão do `PlanoServico` (componente não toca em `HttpClient`)
- `src/app/beneficiarios/beneficiario-lista.ts|html|css` (novos) — `BeneficiarioLista`: tabela
  (nome completo, CPF, nascimento, situação, plano, ações), filtros combináveis de situação e
  plano (voltar à página 1 ao filtrar), paginação prev/anterior com total de páginas, nome do
  plano resolvido via `PlanoServico.listar()` (nunca o `plano_id` cru — SPEC 9.3)
- `src/app/app.ts` e `src/app/app.html` — `BeneficiarioLista` montado no lugar do bloco pendente

## Evidência RED → GREEN

Frontend não tem teste automatizado na suíte pública (SPEC 9.7: a verificação automática só
confere que a app sobe na 4200). Evidência de compilação:

```
$ npm run build
# ANTES: módulo ausente — bloco "pendente" em app.html
```

```
$ npm run build
# DEPOIS: Application bundle generation complete — 0 erros TS (strict: true)
```

## Decisão registrada (se houve)

Nenhuma — comportamento segue SPEC 9.3 e o padrão do bloco de Planos.

## Uso de IA (se houve)

Revisão apenas — ver `../AI_USAGE.md` [TASK-FE-01].