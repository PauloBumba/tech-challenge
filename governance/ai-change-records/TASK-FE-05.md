# TASK-FE-05 — Polish de CSS (visual coerente sem mudar comportamento)

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-16

## O que mudou

- `src/app/app.css` — topo com sombra, título maior, largura do main; CSS morto
  (`.cartao.pendente` que não é mais usado) removido
- `src/app/beneficiarios/beneficiario-lista.css` — cartão com sombra, **badges de status**
  (ATIVO verde / INATIVO cinza), hover/focus em botões, hover nas linhas da tabela, aviso de
  erro com fundo; `beneficiario-lista.html` marca o status com `<span class="status">`
- `src/app/beneficiarios/beneficiario-formulario.css|html` — borda vermelha no campo inválido
  (`[class.invalido]`), foco azul nos inputs/selects, hover nos botões
- `src/app/planos/planos-lista.css|html` — alinhado ao mesmo padrão (`.botao`, hover, zebra)

## Evidência RED → GREEN

Frontend sem teste automatizado na suíte pública (SPEC 9.7). Evidência de compilação:

```
$ npm run build
# DEPOIS: Application bundle generation complete — 0 erros TS
```

## Decisão registrada (se houve)

**Não usar biblioteca de componentes/design system (Angular Material etc.).** A SPEC 9
explicitamente não dá pontos por design; um tema externo tornaria a tela mais difícil de
explicar na entrevista (AGENTS.md §0) e adicionaria peso ao build. CSS próprio, paleta fixa
(azul #1d4ed8, vermelho #b42318) e classes semânticas (`.botao`, `.status`) bastam e são
100% explicáveis.

## Uso de IA (se houve)

IA como par — poliu o CSS por pedido do Paulo ("design na interface, ux/ui"); reuso da paleta
já existente, sem introduzir biblioteca. Ver `../AI_USAGE.md` [TASK-FE-05].