# TASK-INF-01 — Reorganização de Infraestrutura

**Commit:** bb384b4
**Data:** 2026-08-14

## O que mudou

- `Infraestrutura/Persistence/` — nova pasta com AppDbContext.cs, AppDbContextFactory.cs, CargaInicial.cs, Migrations/
- `Infraestrutura/Configuration/` — nova pasta com Dependencias.cs
- `Aplicacao/Servicos/BeneficiarioServico.cs` — namespace atualizado
- `Aplicacao/Servicos/PlanoServico.cs` — namespace atualizado
- `Api/Controllers/HealthController.cs` — namespace atualizado
- `Program.cs` — namespaces atualizados
- `Tests/Integracao/ApiFixture.cs` — namespace atualizado
- `Infraestrutura/Persistence/Migrations/*` — namespaces atualizados

## Evidência de validação

```
$ dotnet build
Compilação com êxito.
0 Erro(s)
```

```
$ dotnet test
Aprovado!  – Com falha:     0, Aprovado:    79, Ignorado:     0, Total:    79
```

## Decisão registrada

[Decision TASK-INF-01](../DECISIONS.md#task-inf-01-reorganização-de-infraestrutura---subdivisão-por-tipo)

## Uso de IA

[AI_USAGE TASK-INF-01](../AI_USAGE.md#task-inf-01) — refatoração estrutural, nenhum código não trivial gerado
