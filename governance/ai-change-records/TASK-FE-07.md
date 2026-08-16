# TASK-FE-07 — Indicador de saúde da API no frontend

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-16

## O que mudou

- `src/app/nucleo/health-servico.ts` (novo) — `HealthServico.obter()` consulta `GET /health`
  (modelo `{ status, banco }`), via `HttpClient` com `API_BASE` injetado (padrão da casa)
- `src/app/nucleo/status-da-api.ts` (novo) — `StatusDaApi`, componente standalone no cabeçalho:
  "API online" (verde) com `GET /health` 200; "API indisponível" (vermelho) em qualquer falha
  (503 de banco, rede, CORS); revalida a cada 30s com `setInterval` limpo em `onDestroy`
- `src/app/app.html|app.ts|app.css` — `app-status-da-api` no topo, `.topo` vira flex
- `e2e/status-da-api.spec.ts` (novo) — 2 testes: online com API real; indisponível com
  `page.route('**/health', abort)` simulando rede/CORS fora

## Evidência RED → GREEN

```
$ docker compose up --build -d
$ npm run e2e
# 3 passed (fluxo de beneficiário + 2 do indicador)
```

## Decisão registrada (se houve)

Nenhuma — feature de visibilidade pedida pelo Paulo ("analisar a saúde da API a partir do
front"), não exigida pela SPEC; o `mensagemDeErro` das listagens já avisa em falha, mas o
indicador mostra o problema de antemão sem depender de carregar dados.

## Uso de IA (se houve)

IA como par — implementou a pedido do Paulo; nenhum trecho não trivial além do reuso do padrão
`HttpClient` + `API_BASE` + `takeUntilDestroyed(this.destroyRef)`. Ver `../AI_USAGE.md`
[TASK-FE-07].