# TASK-BEN-06 — Listagem sem N+1 (tempo constante, SPEC 3)

## Descrição da tarefa

Garantir o requisito da SPEC 3: "a listagem precisa responder em tempo constante em relação
ao número de registros retornados: a quantidade de consultas ao banco não pode crescer com a
quantidade de itens da página". Filtros combináveis e paginação estável já existiam (BEN-02);
o problema era o N+1 no carregamento dos planos.

## Evidência RED → GREEN

A suíte já estava GREEN (55/55) — a mudança é de performance, sem mudança de comportamento
visível. A verificação é estrutural: o `foreach` que chamava `db.Planos.FindAsync` por
beneficiário virou uma única consulta `IN`. Suíte segue 55/55 GREEN.

## O que mudou

- **`Aplicacao/Servicos/BeneficiarioServico.cs`** — `ListarAsync` agora coleta os
  `PlanoId` distintos da página e resolve os planos com **uma** consulta
  `Where(idsDePlanos.Contains(p.Id))` + `ToDictionaryAsync`, em vez de um `FindAsync` por
  beneficiário (que fazia 1 + N consultas). Os demais filtros (`status`, `plano_id`),
  paginação estável (`data_cadastro`+`id`) e o `CountAsync` para o `total` permaneceram.

## Testes rodados

`dotnet test` — 55/55 GREEN (mesma suíte, comportamento inalterado).

## Decisão registrada

Nenhuma decisão nova — a ordenação/paginação já estavam decididas na TASK-BEN-02.