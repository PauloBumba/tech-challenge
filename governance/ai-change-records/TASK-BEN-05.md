# TASK-BEN-05 — DELETE /beneficiarios/{id} (exclusão lógica, 204/404)

## Descrição da tarefa

Implementar `DELETE /beneficiarios/{id}`: exclusão lógica no modelo de Planos — marcado como
excluído, some da listagem e do `total`, `GET/{id}`/`PUT`/`DELETE` respondem 404, CPF continua
ocupado.

## Evidência RED → GREEN

`Excluir_deve_ser_logico_e_tirar_o_beneficiario_das_consultas` estava vermelho (405 —
rota DELETE inexistente). Após a implementação, ele e
`Cpf_de_beneficiario_excluido_deve_continuar_ocupado` passam. Suíte completa: **55/55 GREEN**.

## O que mudou

- **`Dominio/Entidades/Beneficiario.cs`** — novo campo `ExcluidoEm` (DateTime?) + método
  `Excluir()` (marca `ExcluidoEm = DateTime.UtcNow`), espelhando `Plano`.
- **`Infraestrutura/AppDbContext.cs`** — `HasQueryFilter(b => b.ExcluidoEm == null)` em
  Beneficiarios (excluídos somem de todas as consultas: Obter/Listar → 404/fora da listagem).
- **`Infraestrutura/Migrations/`** — nova migration `AdicionarExclusaoLogicaBeneficiario`
  adiciona a coluna `ExcluidoEm` (nullable) + snapshot atualizado.
- **`Aplicacao/Servicos/BeneficiarioServico.cs`** — novo `ExcluirAsync` (404 via `ObterAsync`,
  marca excluído, salva); `GarantirCpfUnicoAsync` agora usa `IgnoreQueryFilters()` — CPF de
  excluído continua ocupado (SPEC 2.3), como `PlanoServico.GarantirUnicidadeAsync`.
- **`Api/Controllers/BeneficiariosController.cs`** — nova action `Excluir` (`DELETE {id:guid}`,
  `204`/`404`).

## Testes rodados

`dotnet test` — 55/55 (suíte inteira verde, incluindo os 25 unitários). Build 0 erros.