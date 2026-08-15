# TASK-DIAG-02 — Leitura estática do módulo Beneficiários contra SPEC

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

Nenhum código alterado — TASK de diagnóstico (Fase 1). Leitura linha a linha de
`Dominio/Beneficiario.cs` e `Controllers/BeneficiariosController.cs` (mais a infraestrutura que
eles tocam: `AppDbContext`, migration `Inicial`, `Excecoes.cs`, middleware de erro, `Program.cs`)
contra `SPEC.md` seções 1, 2.3, 3, 4 e o padrão de Planos.

## Defeitos encontrados (19 itens)

Legenda: **T** = há teste público vermelho apontando; **S** = só visível por leitura (spec × código).

### Modelo `Beneficiario.cs` — SPEC 1

| # | Defeito | Spec | Evidência |
| --- | --- | --- | --- |
| D1 | Todos os campos com `set` público (`Id`, `NomeCompleto`, `Cpf`, `Status`, `PlanoId`, `DataCadastro`) | id/status/data_cadastro são definidos pelo servidor | S — `[FromBody] Beneficiario` expõe isso ao cliente |
| D2 | Sem validação de `nome_completo` (3–120, obrigatório) | SPEC 1 | S |
| D3 | Sem validação de CPF (11 dígitos + verificadores + sem repetidos) | SPEC 4.1 | S (parcial: controller só checa `.Length == 11`) |
| D4 | Sem validação de `data_nascimento` (data passada) | SPEC 1 | S |
| D5 | **Não existe campo `ExcluidoEm`** em `Beneficiario` | SPEC 2.3 DELETE lógico | S — exclusão lógica é impossível sem o campo |
| D6 | `data_cadastro` não é gravada pelo servidor (fica `default(DateTime)` se não enviada) | SPEC 1 | S |

### Controller — SPEC 2.3 / 4

| # | Defeito | Spec | Evidência |
| --- | --- | --- | --- |
| D7 | `POST` retorna `Ok` (200) e sem header `Location` | 201 + Location | T — `Criar_deve_devolver_201_com_header_location` |
| D8 | `POST` recebe o objeto de domínio como corpo — aceita `id`/`status`/`data_cadastro` do cliente | aceita apenas 4 campos | S |
| D9 | CPF duplicado → `BadRequest` (400), corpo string solta | 409 | T — `Criar_com_cpf_ja_cadastrado_deve_devolver_409` |
| D10 | Plano inexistente → violação de FK vira 500 | 422 | T — `Criar_com_plano_inexistente_deve_devolver_422` |
| D11 | `GET /beneficiarios` responde array, sem envelope `dados/pagina/tamanho/total`, sem paginação/filtros | SPEC 3 | T — 4 testes de listagem |
| D12 | Resolução do plano por `FindAsync` em loop (uma consulta por plano distinto) | SPEC 3 "tempo constante" | S — frágil, dependente do cache do contexto |
| D13 | `GET /{id}`, `PUT`, `DELETE` inexistentes → 404 automático | SPEC 2.3 | T — `Obter`, `Atualizar_*`, `Excluir_*` |
| D14 | Validação de CPF só por tamanho (`.Length == 11`) | SPEC 4.1 | S (coberto por D3) |
| D15 | Chamada bloqueante `_db.Beneficiarios.Any(...)` dentro de método `async` | SPEC 7 | S |
| D16 | Controller acessa `AppDbContext` direto, sem serviço | SPEC 7 / padrão `PlanoServico` | S |
| D17 | Erro de CPF duplicado como string, não `ErroResponse` estruturado | SPEC 5 | S (coberto por D9) |
| D18 | **Sem índice único no banco para `Cpf`** na migration | SPEC 4.1 unicidade sob concorrência | S |

### Divergências spec × teste (viram decisão)

| # | Divergência |
| --- | --- |
| D19 | Default de `tamanho`: SPEC 3 diz **10**; teste público `Listar_sem_informar_tamanho_deve_devolver_20_itens_por_pagina` espera **20** |
| D20 | Beneficiário `INATIVO`: SPEC 2.3 diz que é **congelado** — tentativa de alterar dados cadastrais responde **409** (só mudança de `status` é permitida); teste público `Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` espera **200** com nome alterado. TASK-BEN-04 segue a SPEC ("INATIVO congelado exceto mudança de status"), então é o teste que contraria a regra — decidir em TASK-BEN-04 |

## Decisão registrada

- D19 → registrada em `../DECISIONS.md` (spec × teste divergem): seguir o teste público (20),
  porque a suíte pública precisa terminar verde (SPEC 7) e o teste é explícito; a spec é omissa
  no sentido de que 10 é um valor sugerido, não uma regra de negócio.
- D20 → divergência sinalizada em `../DECISIONS.md`; decisão na TASK-BEN-04 (spec: 409; teste: 200).
- Demais itens: nenhuma decisão nova — mapeiam diretamente para TASK-BEN-01 a 09.

## Uso de IA

Revisão apenas — leitura estática e catalogação feitas pela IA; nenhum código gerado.
Itens D3/D14 (validador de CPF) e D12 (N+1) são candidatos a pergunta 3 do README de entrega.