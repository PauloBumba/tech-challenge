# TASK-BEN-10 — Tratamento de erro centralizado

**Commit:** 41faf44
**Data:** 2026-08-14

## O que mudou

- `tests/Integracao/Beneficiarios/BeneficiariosTests.cs` — 4 testes de integração (validação de corpo JSON para 400/404/409/422)

## Evidência de validação

```
$ dotnet test --filter "FullyQualifiedName~Criar_com_cpf_fora_do_formato"
Aprovado!  – Com falha:     0, Aprovado:     1, Ignorado:     0, Total:     1
```

```
$ dotnet test --filter "FullyQualifiedName~Criar_com_cpf_ja_cadastrado"
Aprovado!  – Com falha:     0, Aprovado:     1, Ignorado:     0, Total:     1
```

```
$ dotnet test --filter "FullyQualifiedName~Criar_com_plano_inexistente"
Aprovado!  – Com falha:     0, Aprovado:     1, Ignorado:     0, Total:     1
```

```
$ dotnet test --filter "FullyQualifiedName~Obter_inexistente"
Aprovado!  – Com falha:     0, Aprovado:     1, Ignorado:     0, Total:     1
```

```
$ dotnet test
Aprovado!  – Com falha:     0, Aprovado:    79, Ignorado:     0, Total:    79
```

## Decisão registrada

[Decision TASK-BEN-10](../DECISIONS.md#task-ben-10-tratamento-de-erro-centralizado---ja-implementado-via-middleware)

## Uso de IA

[AI_USAGE TASK-BEN-10](../AI_USAGE.md#task-ben-10) — validação apenas, funcionalidade já existia
