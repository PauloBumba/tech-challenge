# PROJECT_STATE.md

Atualizar a cada commit (Seção 3 do `AGENTS.md`). Tamanho fixo — resumo, não histórico
completo (histórico completo é o Git + `governance/AI_CHANGE_RECORD.md`).

**Última atualização:** 2026-08-14
**Última TASK concluída:** TASK-BEN-08 (validador de CPF completo — algoritmo oficial brasileiro)
**Testes:** `dotnet test` — **77/77 GREEN** (suíte inteira)

### Backend — `Desafio.Api`

|| Item | Situação inicial | Situação atual | Task |
|| --- | --- | --- | --- |
|| Health check | pronto | pronto | — |
|| Planos (CRUD completo) | pronto, referência de padrão | pronto | — |
|| Beneficiários `POST` | existe, com defeitos | corrigido (GREEN) | TASK-BEN-01 |
|| Beneficiários `GET /beneficiarios` (listagem) | existe, com defeitos | corrigido (GREEN) | TASK-BEN-02 |
|| Beneficiários `GET /beneficiarios/{id}` | não implementado | implementado (GREEN) | TASK-BEN-03 |
|| Beneficiários `PUT /beneficiarios/{id}` | não implementado | implementado (GREEN) | TASK-BEN-04 |
|| Beneficiários `DELETE /beneficiarios/{id}` | não implementado | implementado (GREEN) | TASK-BEN-05 |
|| Paginação e filtros (`pagina`, `tamanho`, `status`, `plano_id`) | não implementados | implementados (GREEN, sem N+1) | TASK-BEN-06 |
|| Concorrência de CPF único | não verificado | garantido (índice único + 23505→409) | TASK-BEN-07 |
|| Validador de CPF completo (dígitos verificadores, sequências repetidas) | parcial (só formato) | implementado (GREEN) | TASK-BEN-08 |
|| Regras de exclusão lógica (plano/beneficiário) | a validar | pendente | TASK-BEN-09 |
|| Tratamento de erro centralizado (400/404/409/422/500) | existe para Planos, a validar para Beneficiários | pendente | TASK-BEN-10 |
|| Testes escritos para o que for implementado | — | pendente | (por task) |

### Frontend — `frontend-angular`

| Item | Situação inicial | Situação atual | Task |
| --- | --- | --- | --- |
| Listagem de Planos | pronta, referência de padrão | pronta | — |
| Listagem de Beneficiários (filtros + paginação) | faltando | pendente | TASK-FE-01 |
| Formulário de cadastro/edição de Beneficiários | faltando | pendente | TASK-FE-02 |
| Tratamento de erro da API na UI (400/409/422) | faltando | pendente | TASK-FE-03 |
| Estados de loading / lista vazia | faltando | pendente | TASK-FE-04 |

### Entrega

| Item | Situação | Task |
| --- | --- | --- |
| Imagens multi-arch publicadas no Docker Hub | pendente | TASK-ENT-01 |
| `participantes/<id>/` (docker-compose.yml, info.json, README.md) | pendente | TASK-ENT-02 |
| `./verificar.sh` passando | pendente | TASK-ENT-03 |
| README de entrega (Resumo, Decisões, Uso de IA, Perguntas) | pendente | TASK-ENT-04 |

## Bloqueios atuais

Nenhum registrado ainda.
