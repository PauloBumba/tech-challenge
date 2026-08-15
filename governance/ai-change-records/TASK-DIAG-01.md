# TASK-DIAG-01 — Rodar `dotnet test` no estado base

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

Nenhum código alterado — TASK de diagnóstico (Fase 1, `AGENTS.md`). Apenas execução da suíte
pública no estado base e coleta de evidência para a primeira entrada de `PROJECT_STATE.md`.

## Evidência (baseline RED)

Comando: `dotnet test --no-restore` (em `base/backend-dotnet`)

```
Com falha! – Com falha:    13, Aprovado:    12, Ignorado:     0, Total:    25, Duração: 872 ms - Desafio.Api.Tests.dll (net10.0)
```

Bloqueio inicial: 25 falhas por `Docker.DotNet.DockerApiException (Unauthorized)` — credencial
Docker Hub inválida em cache local (`~/.docker/config.json`) bloqueando o pull anônimo da imagem
PostgreSQL via Testcontainers. Correção: `docker logout`. Depois disso a suíte rodou de verdade.

### 13 falhas e porquê (todas em `BeneficiariosTests`)

| Teste | Esperado | Real | Causa |
| --- | --- | --- | --- |
| `Criar_deve_devolver_201_com_header_location` | Created | OK | `POST` não retorna 201 nem `Location` |
| `Criar_com_cpf_ja_cadastrado_deve_devolver_409` | Conflict | BadRequest | CPF duplicado não vira 409 |
| `Criar_com_plano_inexistente_deve_devolver_422` | UnprocessableEntity | InternalServerError | plano inexistente não vira 422; vaza 500 |
| `Obter_deve_devolver_o_beneficiario` | OK | NotFound | `GET /{id}` não implementado |
| `Atualizar_deve_alterar_os_dados_do_beneficiario` | OK | NotFound | `PUT` não implementado |
| `Atualizar_apontando_para_plano_inexistente_deve_devolver_422` | UnprocessableEntity | NotFound | `PUT` não implementado |
| `Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` | OK | NotFound | `PUT` não implementado |
| `Excluir_deve_ser_logico_e_tirar_o_beneficiario_das_consultas` | NoContent | NotFound | `DELETE` não implementado |
| `Cpf_de_beneficiario_excluido_deve_continuar_ocupado` | Conflict | BadRequest | CPF excluído não continua ocupado / erro vira 400 |
| `Listar_deve_devolver_envelope_paginado` | envelope | array | `GET /beneficiarios` responde array, não envelope `dados/pagina/tamanho/total` |
| `Listar_deve_respeitar_pagina_e_tamanho` | envelope | array | idem |
| `Listar_sem_informar_tamanho_deve_devolver_20_itens_por_pagina` | envelope | array | idem |
| `Listar_deve_combinar_os_filtros_de_status_e_plano` | envelope | array | idem |

12 testes aprovados (Planos + Health), 13 reprovados (todos de Beneficiários).

## Decisão registrada

Nenhuma nova — confirma decisões já registradas na TASK-DIAG-02 (leitura estática).

## Uso de IA

Revisão apenas — este registro e a leitura dos arquivos foram feitos pela IA, mas nenhum trecho
de código foi gerado nesta TASK.