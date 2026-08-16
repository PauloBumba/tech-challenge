# TASK-ARCH-07 — Inversão de dependência da Aplicação (repositórios)

**Commit:** abeb172
**Data:** 2026-08-15

## O que mudou

- `Aplicacao/Repositorios/IPlanoRepositorio.cs` e `IBeneficiarioRepositorio.cs` — novas
  interfaces com as operações que os serviços usam (criar, obter, listar, salvar, validar
  existência/conflito)
- `Infraestrutura/Persistence/Repositorios/PlanoRepositorio.cs` e
  `BeneficiarioRepositorio.cs` — novas implementações que encapsulam `AppDbContext`/EF/Npgsql
- `Aplicacao/Servicos/PlanoServico.cs` e `BeneficiarioServico.cs` — reescritos para depender
  apenas das interfaces de repositório; nenhum `using` de `Infraestrutura`/`EF`/`Npgsql`
  restou na Aplicação
- `Infraestrutura/Persistence/Configuracoes/PlanoConfiguration.cs` e
  `BeneficiarioConfiguration.cs` — novas classes `IEntityTypeConfiguration<T>` com a
  Fluent API (índices, colunas, relações) fora do `AppDbContext`
- `Infraestrutura/Persistence/AppDbContext.cs` — `OnModelCreating` passou a usar
  `ApplyConfigurationsFromAssembly`; enxugado
- `Infraestrutura/Dependencias.cs` — registrados `IPlanoRepositorio` e
  `IBeneficiarioRepositorio` no DI
- `tests/Desafio.Api.Tests/Unitarios/Aplicacao/Arquitetura/RegraDeDependenciaTests.cs` — novo
  teste que garante a regra da Clean Architecture: `Aplicacao/Servicos/*.cs` não pode
  referenciar `Infraestrutura`/`EF`/`Npgsql`

## Evidência RED → GREEN

```
$ dotnet test --filter FullyQualifiedName~RegraDeDependenciaTests
# ANTES da implementação (RED)
Falhou!  – Com falha:     1, Aprovado:     0, Total:     1
# Violações: PlanoServico.cs e BeneficiarioServico.cs usavam Infraestrutura.Persistence/EF/Npgsql
```

```
$ dotnet test
# DEPOIS (GREEN) — suíte completa
Aprovado!  – Com falha:     0, Aprovado:    80, Ignorado:     0, Total:    80
```

## Decisão registrada

[Decision TASK-ARCH-07](../DECISIONS.md#task-arch-07-repositórios-na-fronteira-aplicação-infraestrutura)

## Uso de IA

[AI_USAGE TASK-ARCH-07](../AI_USAGE.md#task-arch-07) — IA como par; trechos não triviais:
tradução 23505→ConflitoException no `SalvarAsync` dos repositórios e resolução de planos em
uma única consulta `IN` no `ListarAsync`