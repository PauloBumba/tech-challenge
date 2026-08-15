# TASK-BEN-03 — GET /beneficiarios/{id} (200/404)

## Descrição da tarefa

Implementar `GET /beneficiarios/{id}` seguindo o padrão de Planos (`PlanoServico.ObterAsync`
+ action `Obter`): `200` com o beneficiário, `404` quando não existe. Aproveitar para trocar
o `Created(...)` do POST pelo `CreatedAtAction(nameof(Obter), ...)` — troca prevista na
decisão [TASK-BEN-01] do `DECISIONS.md`.

## Evidência RED → GREEN

O teste público `Obter_deve_devolver_o_beneficiario` estava vermelho (rota inexistente).
Após a implementação, `Obter_deve_devolver_o_beneficiario` e
`Obter_inexistente_deve_devolver_404` passam.

## O que mudou

- **`Aplicacao/Servicos/BeneficiarioServico.cs`** — novo `ObterAsync(Guid, CancellationToken)`:
  `FirstOrDefaultAsync(b => b.Id == id)` com `AsNoTracking`, lançando `NaoEncontradoException`
  quando vazio (404 via middleware). Espelha `PlanoServico.ObterAsync`. O query filter de
  `AppDbContext` já exclui beneficiários logicamente excluídos das consultas, então o GET
  responde 404 para excluídos (SPEC 2.3, quando o DELETE existir).
- **`Api/Controllers/BeneficiariosController.cs`** — nova action `Obter` (`HttpGet("{id:guid}")`,
  `200`/`404`, produz `BeneficiarioResponse`). O `POST` passou a usar
  `CreatedAtAction(nameof(Obter), new { id = beneficiario.Id }, ...)` no lugar do
  `Created(...)` explícito.

## Testes rodados

`dotnet test` — 49/54. As 5 falhas restantes são todas da fase 2 (BEN-04/BEN-05). Nota: o
teste `Atualizar_inexistente_deve_devolver_404` passou a falhar com 405 porque a rota
`/beneficiarios/{id}` agora existe (GET) mas o PUT ainda não — comportamento transitório que
se resolve na TASK-BEN-04.

## Decisão registrada

Nenhuma nova decisão — apenas a execução da troca prevista em [TASK-BEN-01]
(`CreatedAtAction`), agora que a action `Obter` existe.