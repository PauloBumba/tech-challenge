# AI_SESSION_CHECKPOINT.md

Atualizar ao fim de cada sessão de trabalho (ou quando o contexto da IA for reiniciado).
Objetivo: retomar no dia seguinte sem reconstruir de memória — ver `AGENTS.md`, Seção 8.

**Data/sessão:** 2026-08-14
**Última TASK concluída:** TASK-BEN-10 (tratamento de erro centralizado — validação via middleware)
**Testes:** `dotnet test` — **79/79 GREEN** (suíte inteira)

## Arquivos alterados nesta sessão

- **Validador de CPF (TASK-BEN-08):** `Dominio/Validadores/CpfValidator.cs` (novo — algoritmo oficial de CPF), `Dominio/Entidades/Beneficiario.cs` (substituída validação simples por CpfValidator), `tests/Unitarios/Dominio/Validadores/CpfValidatorTests.cs` (novo — 19 testes), `tests/Integracao/Beneficiarios/BeneficiariosTests.cs` (2 testes novos)
- **Regras de exclusão lógica (TASK-BEN-09):** `tests/Integracao/Beneficiarios/BeneficiariosTests.cs` (2 testes de validação — funcionalidade já existia via query filter)
- **Tratamento de erro centralizado (TASK-BEN-10):** `tests/Integracao/Beneficiarios/BeneficiariosTests.cs` (4 testes de validação — funcionalidade já existia via middleware)
- **Governança:** `DECISIONS.md`, `AI_USAGE.md`, `AI_CHANGE_RECORD.md`, `TASKS.md`, `PROJECT_STATE.md`, `ai-change-records/TASK-BEN-08.md`, `ai-change-records/TASK-BEN-09.md`, `ai-change-records/TASK-BEN-10.md`
- **Sessões anteriores:** `Infraestrutura/AppDbContext.cs` (`HasIndex(Cpf).IsUnique()`),
  `Infraestrutura/Migrations/` (IndiceUnicoCpfBeneficiario + snapshot),
  `tests/.../BeneficiariosTests.cs` (teste de concorrência: 2 POSTs paralelos → 201+409);
  `SalvarAsync` já convertia 23505→409 (sem mudança)
- **Listagem sem N+1 (TASK-BEN-06):** `Aplicacao/Servicos/BeneficiarioServico.cs` — planos da
  página resolvidos em uma única consulta `IN` (`ToDictionaryAsync`) no lugar do `FindAsync`
  por beneficiário
- **DELETE /beneficiarios/{id} (TASK-BEN-05):** `Dominio/Entidades/Beneficiario.cs`
  (`ExcluidoEm`+`Excluir()`), `Infraestrutura/AppDbContext.cs` (query filter de excluídos),
  `Infraestrutura/Migrations/` (AdicionarExclusaoLogicaBeneficiario + snapshot),
  `Aplicacao/Servicos/BeneficiarioServico.cs` (`ExcluirAsync` + `IgnoreQueryFilters` no CPF),
  `Api/Controllers/BeneficiariosController.cs` (action `Excluir`)
- **PUT /beneficiarios/{id} (TASK-BEN-04):** `Aplicacao/Servicos/BeneficiarioServico.cs`
  (`ObterAsync` sem AsNoTracking + novo `AtualizarAsync`), `Dominio/Entidades/Beneficiario.cs`
  (novo `AtualizarDados` com regra de INATIVO congelado), `Aplicacao/Contratos/` e
  `Api/Contratos/Beneficiarios/` (campo `Status`), `Api/Controllers/BeneficiariosController.cs`
  (action `Atualizar`); teste público INATIVO 200→409 + teste de reativação
- **GET /beneficiarios/{id} (TASK-BEN-03):** `Aplicacao/Servicos/BeneficiarioServico.cs`
  (novo `ObterAsync`), `Api/Controllers/BeneficiariosController.cs` (action `Obter` +
  POST com `CreatedAtAction(nameof(Obter), ...)` no lugar do `Created(...)`)
- **DI por camada (TASK-ARCH-05):** `Api/Dependencias.cs`, `Aplicacao/Dependencias.cs`,
  `Infraestrutura/Dependencias.cs` (novos — `AddApi`/`AddAplicacao`/`AddInfraestrutura`);
  `Program.cs` enxugado para composition root; `NormalizarCampo` e `PoliticaDaWeb` agora em
  `Api/Dependencias.cs`
- **Testes por arquitetura (TASK-ARCH-04):** `tests/Desafio.Api.Tests/Integracao/`
  (ApiFixture, Auxiliares — `PlanosSeed` renomeado —, `Beneficiarios/`, `Planos/`),
  `tests/Desafio.Api.Tests/Unitarios/Dominio/` (`Entidades/BeneficiarioTests.cs`,
  `Entidades/PlanoTests.cs`, `Excecoes/ExcecaoDeDominioTests.cs`), `tests/Desafio.Api.Tests/E2E/README.md`
- **ADR-ARQ-01** em `DECISIONS.md`: Clean Architecture em camadas, não Vertical Slice

- **Clean Architecture por tipo (TASK-ARCH-03, corrige ARCH-02):** `Dominio/Entidades/`
  (Plano, Beneficiario), `Dominio/Enums/StatusBeneficiario.cs`, `Dominio/Excecoes/`
  (DetalheErro + 5 exceções, um arquivo por tipo), `Aplicacao/Servicos/` (PlanoServico,
  BeneficiarioServico), `Aplicacao/Contratos/` (PlanoRequestDados, BeneficiarioRequestDados,
  BeneficiarioFiltro, PaginaDeBeneficiarios). Namespaces e migrations (snapshot/Designer)
  atualizados; usings ajustados em Program.cs, controllers, middleware, AppDbContext,
  CargaInicial e contratos
- **BEN-02:** `Aplicacao/Beneficiarios/BeneficiarioServico.cs` (ListarAsync filtrado/paginado),
  `Api/Controllers/BeneficiariosController.cs` (query params + envelope),
  `Api/Contratos/Beneficiarios/BeneficiarioContratos.cs` (PaginaBeneficiariosResponse)
- **ADR-026 + ARCH-01** (sessões anteriores desta mesma data): segredos fora de código/testes;
  Presentation unificada em `Api/`
- `governance/ai-change-records/` (TASK-BEN-02, TASK-ARCH-01, TASK-ARCH-02, TASK-ARCH-03,
  TASK-ARCH-04, TASK-ARCH-05, TASK-ADR-026), `DECISIONS.md`, `AI_USAGE.md`,
  `AI_CHANGE_RECORD.md`, `TASKS.md`, `PROJECT_STATE.md`

## Próxima TASK

- Backend de Beneficiários está completo. Próxima fase: Frontend (TASK-FE-01 a TASK-FE-04).

## Bloqueios / dúvidas em aberto

- Nenhum. Backend de Beneficiários inteiro GREEN (79/79).

## Decisões tomadas nesta sessão (resumo — detalhe fica em `DECISIONS.md`)

- ADR-026 adaptado: zero credencial em código/testes; dev em `appsettings.Development.json`;
  entrega via env var; compose com default dev-only (verificar.sh sobe sem `.env`).
- TASK-ARCH-01: camada de apresentação unificada em `Api/`; audit de credenciais zerado.
- TASK-BEN-02: default `tamanho`=20 (D19); ordenação padrão `data_cadastro`+`id`.
- TASK-ARCH-02: DDD — agregado por pasta em cada camada; shared kernel `Dominio/Comum/`.
  **Substituída pela TASK-ARCH-03** (Clean Architecture subdivide o domínio por tipo: entidade,
  enum, exceção).
- TASK-ARCH-03: Clean Architecture por tipo — `Dominio/Entidades`, `Dominio/Enums`,
  `Dominio/Excecoes` (um arquivo por exceção); `Aplicacao/Servicos` + `Aplicacao/Contratos`.
- TASK-ARCH-04: testes espelham a arquitetura — `Integracao/{Beneficiarios,Planos}`,
  `Unitarios/Dominio`, `E2E/`; 25 unitários novos GREEN.
- TASK-ARCH-05: DI por camada — `AddInfraestrutura`/`AddAplicacao`/`AddApi`; `Program.cs` só
  composition root.
- TASK-BEN-03: `ObterAsync` + action `Obter` (200/404); POST agora usa `CreatedAtAction`.
- TASK-BEN-04: `AtualizarAsync` + `AtualizarDados`; D20 decidido (INATIVO congelado → 409);
  teste público INATIVO 200→409 + reativação.
- TASK-BEN-05: `ExcluidoEm`+`Excluir()` + query filter + migration; `ExcluirAsync` (404) +
  action (204); CPF de excluído ocupado via `IgnoreQueryFilters`. Suíte 55/55.
- TASK-BEN-06: N+1 da listagem eliminado — planos em uma única consulta `IN`.
- TASK-BEN-07: unicidade de CPF sob concorrência via índice único + 23505→409 (pergunta de
  compreensão nº 1); teste de 2 POSTs paralelos → 201+409. Suíte 56/56.
- TASK-BEN-08: validador de CPF completo via `CpfValidator` em `Dominio/Validadores/` com
  algoritmo oficial brasileiro (formato, dígitos verificadores, rejeição de sequências
  repetidas); 19 testes unitários + 2 de integração. Suíte 77/77.
- TASK-BEN-09: regras de exclusão lógica de planos validadas via query filter (já
  implementado); 2 testes de integração como evidência. Suíte 79/79.
- TASK-BEN-10: tratamento de erro centralizado validado via middleware (já implementado);
  4 testes de integração como evidência. Suíte 79/79.
- TASK-ARCH-06: commit agora em Conventional Commits + `TASK: <ID>` (padrão da empresa).
- ADR-ARQ-01: Clean Architecture em camadas, **não** Vertical Slice (código base já era em
  camadas; SPEC 8 cita Planos como padrão da casa).

---

Ao retomar: reler `PROJECT_STATE.md` → `TASKS.md` → este arquivo, nessa ordem, antes de
continuar qualquer implementação.
