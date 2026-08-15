# TASK-BEN-01 — Corrigir/completar `POST /beneficiarios`

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

- `src/Desafio.Api/Dominio/Beneficiario.cs` — reescrito no padrão de `Plano.cs`: construtor
  valida os 4 campos, `Id`/`Status`/`DataCadastro` com setter privado (nunca vêm do cliente),
  `Status` nasce `ATIVO`, `DataCadastro` gravada no servidor, validações de nome (3–120),
  CPF (11 dígitos), data de nascimento passada, plano obrigatório → 400 com `DetalheErro`.
- `src/Desafio.Api/Aplicacao/BeneficiarioServico.cs` (novo) — no padrão de `PlanoServico`:
  `CriarAsync` valida plano existente (422), CPF único (409) e salva tratando violação de
  unicidade; `ListarAsync` preserva o comportamento atual (a correção do envelope é a BEN-02).
- `src/Desafio.Api/Api/Contratos/BeneficiarioContratos.cs` (novo) — `BeneficiarioRequest` com
  **só os 4 campos aceitos** e `BeneficiarioResponse` no padrão de `PlanoContratos`.
- `src/Desafio.Api/Controllers/BeneficiariosController.cs` — passa a depender de
  `BeneficiarioServico` (SPEC 7: regra de negócio fora do controller), `POST` responde 201 com
  header `Location` (URL explícita — ver decisão), sem tocar no `_db`.
- `src/Desafio.Api/Program.cs` — registro de `BeneficiarioServico` no DI.
- `tests/Desafio.Api.Tests/BeneficiariosTests.cs` — 4 testes novos: campos `id`/`status`/
  `data_cadastro` enviados pelo cliente são ignorados; nome ausente → 400; CPF fora do formato →
  400; data de nascimento futura → 400.

## Evidência RED → GREEN

RED (testes novos + os 3 de POST que já apontavam o defeito):

```
Com falha! – Com falha:     5, Aprovado:     2, Ignorado:     0, Total:     7
# filtro FullyQualifiedName~BeneficiariosTests.Criar
# 5 falhas: 201+Location, 409 cpf duplicado, 422 plano inexistente,
#           data_futura 400, campos id/status/data_cadastro ignorados
```

GREEN (suíte completa):

```
Com falha! – Com falha:     9, Aprovado:    20, Ignorado:     0, Total:    29
# 12/25 → 20/29. As 7 falhas de Criar viraram GREEN.
# As 9 restantes pertencem a BEN-02 (listagem, 4), BEN-03 (Obter, 1),
# BEN-04 (PUT, 3) e BEN-05 (DELETE, 1).
```

## Decisão registrada

- `Location` sem a action `Obter` → `Created` com URL explícita; motivo em `../DECISIONS.md`
  (não implementar a BEN-03 dentro da BEN-01).

## Uso de IA

IA como par (sugestão + revisão) — o padrão de camadas foi copiado de `PlanoServico`/
`Plano.cs`; a decisão do `Location` foi tomada para respeitar o escopo da TASK. Nada que Paulo
não consiga explicar; candidato a pergunta 3: validação centralizada em `DefinirDados` com
`DetalheErro`.