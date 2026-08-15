# AI_CHANGE_RECORD.md

Índice. Cada linha aponta pra um arquivo em `ai-change-records/<TASK-ID>.md` com o detalhe
completo daquela mudança (testes rodados, evidência RED, arquivos alterados). Mantém este
índice curto — o detalhe fica no arquivo individual.

| TASK-ID | Resumo | Commit | Testes |
| --- | --- | --- | --- |
| TASK-DIAG-01 | Baseline `dotnet test`: 12/25 (13 falhas em Beneficiários) | — | 12/25 |
| TASK-DIAG-02 | Leitura estática Beneficiários × SPEC: 20 defeitos (9 T, 10 S), 2 divergências | — | 12/25 |
| TASK-BEN-01 | POST /beneficiarios: 4 campos, servidor define id/status/data_cadastro, 201+Location, 400/409/422 | — | 20/29 |
| TASK-ADR-026 | Gestão de segredos: zero credencial em código/testes; appsettings neutro; env var; .env.example | — | 20/29 |
| TASK-ARCH-01 | Clean Architecture: Controllers → Api/Controllers (Presentation unificada); audit de credenciais zerado | — | 20/29 |
| TASK-BEN-02 | GET /beneficiarios: envelope paginado, filtros status+plano_id, validação 400, default tamanho=20, ordenação estável | — | 24/29 |
| TASK-ARCH-02 | DDD: entidade por pasta em Dominio/Aplicacao/Contratos; shared kernel Dominio/Comum; migrations atualizadas | — | 24/29 |
| TASK-ARCH-03 | Clean Architecture por tipo: Dominio/Entidades+Enums+Excecoes (1 arquivo por exceção); Aplicacao/Servicos+Contratos (DTOs próprios) — corrige ARCH-02 | — | 24/29 |
| TASK-ARCH-04 | Testes espelhando a arquitetura: Integracao/{Beneficiarios,Planos}, Unitarios/Dominio (entidades+exceções), E2E/; 25 unitários novos GREEN, suíte pública intacta | — | 49/54 |
| TASK-ARCH-05 | DI por camada: Dependencias.cs por camada (AddInfraestrutura/AddAplicacao/AddApi); Program.cs só composition root; NormalizarCampo e PoliticaDaWeb movidos para Api/Dependencias | — | 49/54 |
| TASK-BEN-03 | GET /beneficiarios/{id}: ObterAsync no serviço + action Obter (200/404, padrão de Planos); POST com CreatedAtAction(nameof(Obter)) | — | 49/54 |
| TASK-BEN-04 | PUT /beneficiarios/{id}: AtualizarAsync + AtualizarDados (INATIVO congelado 409, cpf imutável, 422 plano inexistente); D20 decidido — spec 409, teste público ajustado + reativação | — | 54/55 |
| TASK-BEN-05 | DELETE /beneficiarios/{id}: ExcluidoEm+Excluir(), query filter no DbContext, migration, ExcluirAsync (404) + action (204); CPF de excluído ocupado via IgnoreQueryFilters | — | 55/55 |
| TASK-BEN-06 | Listagem sem N+1: planos da página resolvidos em uma única consulta IN (antes FindAsync por beneficiário); filtros/paginação estável já verdes desde BEN-02 | — | 55/55 |
| TASK-BEN-07 | Unicidade de CPF sob concorrência: índice único IX_Beneficiarios_Cpf + migration; SalvarAsync já convertia 23505→409; teste de 2 POSTs paralelos (201+409) — pergunta de compreensão nº 1 | — | 56/56 |
| TASK-BEN-08 | Validador de CPF completo: CpfValidator com algoritmo oficial (formato, dígitos verificadores, rejeição de sequências repetidas); 19 testes unitários + 2 de integração | 19b97d9 | 77/77 |
| TASK-BEN-09 | Regras de exclusão lógica de planos: validação via query filter (já implementado); 2 testes de integração como evidência | ff0fb74 | 79/79 |
| TASK-BEN-10 | Tratamento de erro centralizado: validação via middleware (já implementado); 4 testes de integração como evidência | 41faf44 | 79/79 |

<!-- Nova linha a cada task concluída, ver POST_TASK_WORKFLOW.md item 4 -->
