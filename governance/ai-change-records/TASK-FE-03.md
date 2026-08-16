# TASK-FE-03 — Erros da API mapeados em mensagem legível na tela

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-15

## O que mudou

- `beneficiario-formulario.ts` — `mensagemDeErro(resposta)` (do `nucleo/api.ts`, padrão do bloco
  de Planos) no `error` do POST/PUT: CPF duplicado (409), plano inexistente (422) e validação
  recusada (400) aparecem no topo do formulário como `{{ erro() }}`, nunca `console.log`
- `beneficiario-lista.ts` — `mensagemDeErro` no `error` da listagem e da exclusão: substitui a
  tabela por uma mensagem compreensível, sem tela em branco
- O `nucleo/api.ts` existente já traduzia o corpo `{ erro, mensagem, detalhes }` da API em
  "mensagem: campo (regra)" — reutilizado, sem duplicação

## Evidência RED → GREEN

Frontend sem teste automatizado na suíte pública (SPEC 9.7). Evidência de compilação:

```
$ npm run build
# ANTES: sem tratamento de erro no novo código
```

```
$ npm run build
# DEPOIS: Application bundle generation complete — 0 erros TS
```

## Decisão registrada (se houve)

Nenhuma — reuso do padrão da casa (SPEC 9.5 exige "erros da API viram mensagem").

## Uso de IA (se houve)

Revisão apenas — ver `../AI_USAGE.md` [TASK-FE-03].