# TASK-ARCH-01 — Reorganizar pastas em Clean Architecture + audit de credenciais

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

- **`Controllers/` movido para `Api/Controllers/`** — a camada de apresentação (Presentation)
  ficou unificada em `src/Desafio.Api/Api/` (Controllers + Middlewares + Contratos). Antes,
  `Controllers/` vivia na raiz do projeto, separado dos contratos e middlewares que eram a
  mesma camada lógica. Namespaces atualizados de `Desafio.Api.Controllers` para
  `Desafio.Api.Api.Controllers` nos três controllers.
- **Auditoria de credenciais em código e testes:** zero credencial hardcoded encontrada.
  O único `Password` do código-fonte está em `appsettings.Development.json` (config dev-only,
  isolado do base — decisão ADR-026). Testes usam `Testcontainers` com senha gerada
  automaticamente (`_postgres.GetConnectionString()` em `ApiFixture.cs`), nunca uma senha fixa.

## Estrutura final (Clean Architecture em camadas)

```
src/Desafio.Api/
├── Api/                  ← Presentation
│   ├── Controllers/      (Beneficiarios, Health, Planos)
│   ├── Middlewares/      (TratamentoDeErroMiddleware)
│   └── Contratos/        (Requests/Responses, ErroResponse, JsonPadrao)
├── Aplicacao/            ← Application (PlanoServico, BeneficiarioServico)
├── Dominio/              ← Domain (Plano, Beneficiario, Excecoes)
├── Infraestrutura/       ← Infrastructure (AppDbContext, Migrations, CargaInicial)
└── Program.cs            ← Composition root
```

## Evidência

- `dotnet build --no-restore` → 0 erros.
- `dotnet test --no-restore` → **20/29**, mesma contagem de antes da movimentação
  (9 falhas: BEN-02 ×4, BEN-03 ×1, BEN-04 ×3, BEN-05 ×1). Sem regressão.

## Decisão registrada

Ver `governance/DECISIONS.md` — [TASK-ARCH-01] organização em camadas Clean Architecture,
mantendo o padrão do módulo de Planos (Dominio / Aplicacao / Controllers), apenas movendo a
camada de apresentação para baixo da pasta `Api/`.

## Uso de IA

Revisão e reorganização de pastas feitas pela IA (movimentação de arquivos + namespace).
Nenhuma lógica nova gerada — apenas movimentação física de código existente.