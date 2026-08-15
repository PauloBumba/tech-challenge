# TASK-BEN-04 — PUT /beneficiarios/{id} (200/400/404/409/422)

## Descrição da tarefa

Implementar `PUT /beneficiarios/{id}`: atualiza `nome_completo`, `data_nascimento`,
`plano_id` e `status`; `cpf` imutável (ignorado quando enviado); `422` para plano
inexistente; beneficiário `INATIVO` congelado com `409` (só mudança de status permite
reativação). Inclui a decisão D20 (spec 409 vs teste 200).

## Evidência RED → GREEN

Os 4 testes de atualização estavam vermelhos (rota PUT inexistente → 405). Após a
implementação: `Atualizar_deve_alterar_os_dados_do_beneficiario` (200),
`Atualizar_inexistente_deve_devolver_404`, `Atualizar_apontando_para_plano_inexistente_deve_devolver_422`
e `Atualizar_dados_de_beneficiario_inativo_deve_devolver_409` (ajustado do 200, ver
decisão D20) passam. Adicionado `Atualizar_deve_permitir_reativacao_de_beneficiario_inativo`
(INATIVO→ATIVO mantendo dados = 200). Suíte: 54/55 (resta só BEN-05).

## O que mudou

- **`Aplicacao/Servicos/BeneficiarioServico.cs`** — `ObterAsync` sem `AsNoTracking` (como
  `PlanoServico.ObterAsync`, necessário para o update persistir); novo `AtualizarAsync`:
  404 via `ObterAsync`, 422 via `GarantirPlanoExisteAsync`, 400 para `status` ausente,
  delega a regra de congelamento à entidade.
- **`Dominio/Entidades/Beneficiario.cs`** — novo `AtualizarDados(...)`: valida os campos
  (400) e, se o beneficiário está `INATIVO` e os dados cadastrais mudaram, lança
  `ConflitoException` (409) — reativação (mudança de status sozinha) segue permitida.
- **`Aplicacao/Contratos/BeneficiarioRequestDados.cs`** — novo campo `Status?`.
- **`Api/Contratos/Beneficiarios/BeneficiarioContratos.cs`** — `BeneficiarioRequest` ganhou
  `Status?` (só usado pelo PUT).
- **`Api/Controllers/BeneficiariosController.cs`** — nova action `Atualizar` (`PUT {id:guid}`,
  200/400/404/409/422).

## Teste público ajustado

`Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` → renomeado para
`..._409` esperando `409`. Motivo: SPEC 2.3 declara INATIVO como registro congelado; o
teste contrariava a regra. Mudança de teste existente permitida com motivo registrado
(AGENTS.md §6) em `DECISIONS.md` [TASK-BEN-04].

## Testes rodados

`dotnet test` — 54/55 (1 falha = BEN-05 DELETE). Build 0 erros.