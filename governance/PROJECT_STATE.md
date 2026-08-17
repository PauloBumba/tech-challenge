# PROJECT_STATE.md

Atualizar a cada commit (Seção 3 do `AGENTS.md`). Tamanho fixo — resumo, não histórico
completo (histórico completo é o Git + `governance/AI_CHANGE_RECORD.md`).

**Última atualização:** 2026-08-16
**Última TASK concluída:** TASK-ENT-04 (README de entrega completo)
**Testes:** `dotnet test` — **84/84 GREEN**; frontend `npm run build` GREEN + `npm run e2e` GREEN; verificar.sh — **37/37 ok**

### Backend — `Desafio.Api`

||| Item | Situação inicial | Situação atual | Task |
||| --- | --- | --- | --- |
||| Health check | pronto | pronto | — |
||| Planos (CRUD completo) | pronto, referência de padrão | pronto | — |
||| Beneficiários `POST` | existe, com defeitos | corrigido (GREEN) | TASK-BEN-01 |
||| Beneficiários `GET /beneficiarios` (listagem) | existe, com defeitos | corrigido (GREEN) | TASK-BEN-02 |
||| Beneficiários `GET /beneficiarios/{id}` | não implementado | implementado (GREEN) | TASK-BEN-03 |
||| Beneficiários `PUT /beneficiarios/{id}` | não implementado | implementado (GREEN) | TASK-BEN-04 |
||| Beneficiários `DELETE /beneficiarios/{id}` | não implementado | implementado (GREEN) | TASK-BEN-05 |
||| Paginação e filtros (`pagina`, `tamanho`, `status`, `plano_id`) | não implementados | implementados (GREEN, sem N+1) | TASK-BEN-06 |
||| Concorrência de CPF único | não verificado | garantido (índice único + 23505→409) | TASK-BEN-07 |
||| Validador de CPF completo (dígitos verificadores, sequências repetidas) | parcial (só formato) | implementado (GREEN) | TASK-BEN-08 |
||| Regras de exclusão lógica (plano/beneficiário) | a validar | validado (GREEN) | TASK-BEN-09 |
||| Tratamento de erro centralizado (400/404/409/422/500) | existe para Planos, a validar para Beneficiários | validado (GREEN) | TASK-BEN-10 |
||| Testes escritos para o que for implementado | — | pendente | (por task) |
||| Infraestrutura organizada por tipo | misturada | subdividida (Persistence/Configuration) | TASK-INF-01 |
||| Aplicação invertendo dependência (serviços sem EF/Npgsql) | serviços acoplados ao AppDbContext | repositórios + teste de dependência GREEN | TASK-ARCH-07 |
||| Observabilidade (métricas + log de requisição) | inexistente | `/metrics` Prometheus válido + log estruturado de requisição GREEN | TASK-OBS-01, TASK-OBS-02 |

|| Item | Situação inicial | Situação atual | Task |
|| --- | --- | --- | --- |
|| Listagem de Planos | pronta, referência de padrão | pronta | — |
|| Listagem de Beneficiários (filtros + paginação) | faltando | pronta (filtros combináveis, paginação, nome do plano via GET /planos) | TASK-FE-01 |
|| Formulário de cadastro/edição de Beneficiários | faltando | pronto (reactive forms, validação client-side, CPF não editável na edição) | TASK-FE-02 |
|| Tratamento de erro da API na UI (400/409/422) | faltando | pronto (mensagemDeErro na tela, sem console.log) | TASK-FE-03 |
|| Estados de loading / lista vazia | faltando | pronto (loading/erro/vazio; exclusão só some após sucesso do DELETE) | TASK-FE-04 |
|| Visual (CSS) | cru | polido (badges de status, hover/focus, campo inválido; sem biblioteca — SPEC 9 não pontua design) | TASK-FE-05 |
|| Teste E2E do frontend (navegador) | faltando | pronto (Playwright, smoke do fluxo da entrevista); revelou e corrigiu NG0203 | TASK-FE-06 |
|| Indicador de saúde da API no front | faltando | pronto (GET /health a cada 30s; online/indisponível no topo) | TASK-FE-07 |

### Entrega

|| Item | Situação | Task |
|| --- | --- | --- |
|| Imagens multi-arch publicadas no Docker Hub | pronto | TASK-ENT-01 |
|| `participantes/<id>/` (docker-compose.yml, info.json, README.md) | pronto | TASK-ENT-02 |
|| `./verificar.sh` passando | pronto (37/37 ok) | TASK-ENT-03 |
|| README de entrega (Resumo, Decisões, Uso de IA, Perguntas) | pronto | TASK-ENT-04 |

## Bloqueios atuais

Nenhum registrado ainda.
