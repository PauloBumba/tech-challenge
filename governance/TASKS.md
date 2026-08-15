# TASKS.md

Backlog quebrado pelo Princípio dos Pedaços (`AGENTS.md`, Seção 4). Cada TASK cabe em uma frase
objetiva. Nenhuma task mistura banco + endpoint + frontend. Ordem sugerida: backend antes de
frontend, porque a UI consome os contratos que o backend fecha.

Status: `todo` | `doing` | `red` (teste escrito e falhando) | `green` (implementado) | `done` (commitado)

---

## Fase 1 — Diagnóstico (não muda código)

- [x] **TASK-DIAG-01** — Rodar `dotnet test` no estado base e listar exatamente quais testes
      falham e por quê. Vira a primeira entrada de `PROJECT_STATE.md`. **Feito 2026-08-14**:
      25 total, 12 aprovados, 13 reprovados — todos `BeneficiariosTests` (ver
      `ai-change-records/TASK-DIAG-01.md`).
- [x] **TASK-DIAG-02** — Ler `Dominio/Beneficiario.cs`, `Controllers/BeneficiariosController.cs`
      e comparar linha a linha com `SPEC.md` seções 1, 2.3, 4. Listar todo defeito encontrado,
      com ou sem teste vermelho apontando — a spec pede explicitamente notar os dois tipos.
      **Feito 2026-08-14**: 20 itens catalogados (D1–D20), 9 com teste vermelho (T), 10 só por
      leitura (S), 2 divergências spec × teste (default `tamanho` e beneficiário `INATIVO`) em
      `DECISIONS.md` (ver `ai-change-records/TASK-DIAG-02.md`).

## Fase 1.5 — Arquitetura (cross-cutting)

- [x] **TASK-ARCH-01** — Reorganizar pastas conforme Clean Architecture: unificar a camada de
      apresentação movendo `Controllers/` para dentro de `Api/` (Controllers + Middlewares +
      Contratos = Presentation), e auditar zero credencial em código/testes. Toda a camada de
      apresentação passa a viver em `src/Desafio.Api/Api/`. **Feito 2026-08-14**: `Controllers/`
      movido para `Api/Controllers/` (namespaces atualizados), auditoria de credenciais zerada
      (ver `ai-change-records/TASK-ARCH-01.md`).
- [x] **TASK-ARCH-02** — Organizar o código em DDD: cada entidade (Plano, Beneficiario) com a
      sua própria pasta nas camadas `Dominio/`, `Aplicacao/` e `Api/Contratos/`; exceções de
      domínio no shared kernel `Dominio/Comum/`; um tipo por arquivo (SOLID). Atualizar
      migrations (o snapshot guarda o nome completo das entidades) e namespaces. **Feito
      2026-08-14**: entidades por pasta nas três camadas, namespaces acompanham pastas,
      migrations atualizadas, 24/29 sem regressão (ver `ai-change-records/TASK-ARCH-02.md`).
      **⚠ Substituído pela TASK-ARCH-03** (Clean Architecture pede subdivisão por tipo, não por
      agregado).
- [x] **TASK-ARCH-03** — Corrigir a organização do domínio para o critério da Clean
      Architecture: `Dominio/Entidades/` (Plano, Beneficiario), `Dominio/Enums/`
      (StatusBeneficiario), `Dominio/Excecoes/` (um arquivo por exceção); `Aplicacao/` separa
      `Servicos/` de `Contratos/` (DTOs em arquivo próprio). **Feito 2026-08-14**:
      `Dominio/` e `Aplicacao/` subdivididos por tipo de artefato, namespaces e migrations
      atualizados, 24/29 sem regressão (ver `ai-change-records/TASK-ARCH-03.md`).
- [x] **TASK-ARCH-04** — Reorganizar o projeto de testes espelhando a arquitetura: uma pasta
      por tipo de teste (`Unitarios`, `Integracao`, `E2E`) e, em integração, subpastas por
      camada/módulo da aplicação. Preservar a suíte pública (não apagar nem enfraquecer
      teste — motivo registrado em `DECISIONS.md` [ADR-TESTES-01]). **Feito 2026-08-14**:
      testes movidos para `Integracao/{Beneficiarios,Planos}`; unitários novos do domínio
      (entidades + exceções) em `Unitarios/Dominio/`; `E2E/` criada (infra na fase frontend);
      25 testes unitários novos GREEN, suíte pública intacta — 49/54 (ver
      `ai-change-records/TASK-ARCH-04.md`).
- [x] **TASK-ARCH-05** — Extrair a configuração do container de DI para um extension method por
      camada (`AddInfraestrutura`, `AddAplicacao`, `AddApi`) e deixar o `Program.cs` só como
      composition root. **Feito 2026-08-14**: `Api/Dependencias.cs`,
      `Aplicacao/Dependencias.cs`, `Infraestrutura/Dependencias.cs` criados; `Program.cs`
      enxugado; build 0 erros, suíte idêntica 49/54 (ver
      `ai-change-records/TASK-ARCH-05.md`).
- [x] **TASK-INF-01** — Reorganizar camada de Infraestrutura seguindo Clean Architecture:
      subdividir em `Persistence/` (AppDbContext, AppDbContextFactory, CargaInicial, Migrations)
      e `Configuration/` (Dependencias). Atualizar namespaces e migrations. **Feito 2026-08-14**:
      criadas subpastas `Persistence/` e `Configuration/`; arquivos movidos; namespaces
      atualizados em todos os arquivos afetados; migrations atualizadas — 79/79 GREEN
      (ver `ai-change-records/TASK-INF-01.md`).

## Fase 2 — Backend, módulo Beneficiários

- [x] **TASK-BEN-01** — Corrigir/completar `POST /beneficiarios` (apenas os 4 campos aceitos;
      `id`/`status`/`data_cadastro` nunca vêm do cliente; 400/409/422 conforme SPEC 2.3 e 4.1).
      **Feito 2026-08-14**: 20/29 passando; as 7 falhas de `Criar` viraram GREEN (ver
      `ai-change-records/TASK-BEN-01.md`).
- [x] **TASK-BEN-02** — Corrigir `GET /beneficiarios` para o envelope paginado (SPEC 3), sem os
      defeitos atuais. **Feito 2026-08-14**: envelope `dados/pagina/tamanho/total`, filtros
      `status`+`plano_id` combináveis, validação `pagina`≥1 e `tamanho` 1..100 (400), default
      `tamanho`=20 (D19), ordenação estável `data_cadastro`+`id`. 24/29 passando (ver
      `ai-change-records/TASK-BEN-02.md`).
- [x] **TASK-BEN-03** — Implementar `GET /beneficiarios/{id}` (200/404). **Feito 2026-08-14**:
      `ObterAsync` no serviço + action `Obter` no controller (padrão de Planos); POST trocado
      para `CreatedAtAction(nameof(Obter), ...)` (previsto em [TASK-BEN-01]); testes públicos
      `Obter_*` GREEN — 49/54 (ver `ai-change-records/TASK-BEN-03.md`).
- [x] **TASK-BEN-04** — Implementar `PUT /beneficiarios/{id}` (cpf imutável, beneficiário
      `INATIVO` congelado exceto mudança de status, 422 para plano inexistente). **Feito
      2026-08-14**: `AtualizarAsync` + `AtualizarDados` (regra de congelamento na entidade);
      D20 decidido — spec 409, teste público ajustado para 409 + teste de reativação; 54/55
      (ver `ai-change-records/TASK-BEN-04.md`).
- [x] **TASK-BEN-05** — Implementar `DELETE /beneficiarios/{id}` (exclusão lógica, CPF continua
      ocupado, some da listagem e do `total`). **Feito 2026-08-14**: `ExcluidoEm`+`Excluir()`
      na entidade, query filter no DbContext, migration, `ExcluirAsync` (404) e action
      `Excluir` (204); CPF de excluído continua ocupado (`IgnoreQueryFilters`) — **suíte inteira
      55/55 GREEN** (ver `ai-change-records/TASK-BEN-05.md`).
- [x] **TASK-BEN-06** — Implementar filtros combináveis (`status`, `plano_id`) + paginação
      estável, sem N+1 (SPEC 3: "tempo constante em relação ao número de registros retornados").
      **Feito 2026-08-14**: filtros/paginação já estavam verdes (BEN-02); eliminado o N+1 do
      `ListarAsync` (planos resolvidos em uma única consulta `IN` em vez de `FindAsync` por
      beneficiário) — 55/55 GREEN (ver `ai-change-records/TASK-BEN-06.md`).
- [x] **TASK-BEN-07** — Garantir unicidade de CPF sob concorrência (duas criações simultâneas
      com o mesmo CPF). Decidir o mecanismo (constraint única no banco + tratamento de exceção
      de violação, vs. lock aplicacional) e registrar em `DECISIONS.md` — é a pergunta de
      compreensão nº 1 do desafio. **Feito 2026-08-14**: índice único `IX_Beneficiarios_Cpf` +
      migration; `SalvarAsync` já convertia 23505→409; teste de concorrência (2 POSTs paralelos
      → 201+409) — 56/56 GREEN (ver `ai-change-records/TASK-BEN-07.md`).
- [x] **TASK-BEN-08** — Validador de CPF completo: 11 dígitos, dígitos verificadores, rejeição
      de sequências repetidas. **Feito 2026-08-14**: `CpfValidator` em `Dominio/Validadores/` com
      algoritmo oficial do CPF brasileiro; integrado na entidade `Beneficiario`; 19 testes
      unitários + 2 de integração — 77/77 GREEN (ver `ai-change-records/TASK-BEN-08.md`).
- [x] **TASK-BEN-09** — Confirmar que plano excluído logicamente conta como inexistente para
      novos vínculos, mas não invalida vínculos existentes (SPEC 4.2). **Feito 2026-08-14**:
      funcionalidade já implementada via query filter em `AppDbContext`; adicionados 2 testes
      de integração como evidência — 79/79 GREEN (ver `ai-change-records/TASK-BEN-09.md`).
- [x] **TASK-BEN-10** — Confirmar tratamento de erro centralizado (400/404/409/422/500) para
      Beneficiários, seguindo o padrão de Planos (SPEC 5). **Feito 2026-08-14**: funcionalidade
      já implementada via `TratamentoDeErroMiddleware`; adicionados 4 testes de integração como
      evidência — 79/79 GREEN (ver `ai-change-records/TASK-BEN-10.md`).

## Fase 3 — Frontend, módulo Beneficiários

- [ ] **TASK-FE-01** — Listagem de Beneficiários: nome, CPF, nascimento, status, nome do plano
      (resolvido via `GET /planos`, não `plano_id` cru), filtros combináveis, paginação.
- [ ] **TASK-FE-02** — Formulário de cadastro/edição: validação client-side (obrigatórios,
      formato de CPF, data passada), CPF não editável na edição.
- [ ] **TASK-FE-03** — Mapear erros da API (400/409/422) para mensagem legível na tela, não
      `console.log` nem tela em branco.
- [ ] **TASK-FE-04** — Estado de loading e de lista vazia; exclusão só some da lista após
      resposta de sucesso do `DELETE`.

## Fase 4 — Entrega

- [ ] **TASK-ENT-01** — Build multi-arch (`linux/amd64,linux/arm64`) e publicação das duas
      imagens no Docker Hub como públicas.
- [ ] **TASK-ENT-02** — Montar `participantes/<id>/` (`docker-compose.yml` com `image:`,
      `info.json`, `README.md`) a partir de `participantes/exemplo/`.
- [ ] **TASK-ENT-03** — Rodar `./verificar.sh participantes/<id>` com Docker limpo até passar.
- [ ] **TASK-ENT-04** — Escrever o README de entrega: Resumo, Decisões (puxar de
      `governance/DECISIONS.md`), Uso de IA (puxar de `governance/AI_USAGE.md`), e as 3
      perguntas de compreensão.

---

*Adicionar TASKs conforme o diagnóstico da Fase 1 revelar defeitos específicos não listados aqui.
Cada nova TASK segue o mesmo formato: uma frase objetiva, um módulo, um teste.*
