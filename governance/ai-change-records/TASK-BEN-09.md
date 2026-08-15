# TASK-BEN-09 — Regras de exclusão lógica de planos

**Commit:** ff0fb74
**Data:** 2026-08-14

## O que mudou

- `tests/Integracao/Beneficiarios/BeneficiariosTests.cs` — 2 testes de integração (plano excluído → 422 para novos vínculos, beneficiários existentes continuam acessíveis)

## Evidência de validação

```
$ dotnet test --filter "FullyQualifiedName~Criar_com_plano_excluido_logicamente"
Aprovado!  – Com falha:     0, Aprovado:     1, Ignorado:     0, Total:     1
```

```
$ dotnet test --filter "FullyQualifiedName~Beneficiario_existente_deve_permanecer_vinculado"
Aprovado!  – Com falha:     0, Aprovado:     1, Ignorado:     0, Total:     1
```

```
$ dotnet test
Aprovado!  – Com falha:     0, Aprovado:    79, Ignorado:     0, Total:    79
```

## Decisão registrada

[Decision TASK-BEN-09](../DECISIONS.md#task-ben-09-regras-de-exclusao-logica-de-planos---ja-implementada-via-query-filter)

## Uso de IA

[AI_USAGE TASK-BEN-09](../AI_USAGE.md#task-ben-09) — validação apenas, funcionalidade já existia
