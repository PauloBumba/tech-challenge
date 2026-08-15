# TASK-BEN-08 — Validador de CPF completo

**Commit:** 19b97d9
**Data:** 2026-08-14

## O que mudou

- `Dominio/Validadores/CpfValidator.cs` — novo validador com algoritmo oficial de CPF (formato, dígitos verificadores, rejeição de sequências repetidas)
- `Dominio/Entidades/Beneficiario.cs` — substituída validação simples de formato por `CpfValidator.Validar`
- `tests/Unitarios/Dominio/Validadores/CpfValidatorTests.cs` — 19 testes unitários (CPF válido, sequências repetidas, dígitos verificadores, formato)
- `tests/Integracao/Beneficiarios/BeneficiariosTests.cs` — 2 testes de integração (sequência repetida, dígitos verificadores)

## Evidência RED → GREEN

```
$ dotnet test --filter "FullyQualifiedName~CpfValidatorTests"
Com falha! – Com falha:     2, Aprovado:    17, Ignorado:     0, Total:    19
```

```
$ dotnet test
Aprovado!  – Com falha:     0, Aprovado:    77, Ignorado:     0, Total:    77
```

## Decisão registrada

[Decision TASK-BEN-08](../DECISIONS.md#task-ben-08-validador-de-cpf-completo---algoritmo-oficial-brasileiro)

## Uso de IA

[AI_USAGE TASK-BEN-08](../AI_USAGE.md#task-ben-08)
