# TASK-BEN-02 — `GET /beneficiarios` com envelope paginado (SPEC 3)

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

`GET /beneficiarios` passou a responder o envelope paginado da SPEC 3:

```json
{ "dados": [...], "pagina": 1, "tamanho": 20, "total": 42 }
```

| Arquivo | Mudança |
| --- | --- |
| `Aplicacao/BeneficiarioServico.cs` | `ListarAsync(BeneficiarioFiltro)` aplica `status`+`plano_id` combináveis, conta `total`, pagina com `Skip/Take` estável, valida `pagina`≥1 e `tamanho` 1..100 (lança `ValidacaoException` → 400) |
| `Api/Controllers/BeneficiariosController.cs` | aceita query params `pagina`, `tamanho`, `status`, `plano_id`; retorna `PaginaBeneficiariosResponse` |
| `Api/Contratos/BeneficiarioContratos.cs` | novo `PaginaBeneficiariosResponse` (envelope) |

### Evidência RED → GREEN

RED: 4 testes de listagem falhavam no baseline (13 falhas → BEN-02 ×4).

GREEN: `dotnet test --no-restore` → **24/29**. Os 4 testes de listagem passaram:
`Listar_deve_devolver_envelope_paginado`, `Listar_deve_respeitar_pagina_e_tamanho`,
`Listar_deve_combinar_os_filtros_de_status_e_plano`, `Listar_sem_informar_tamanho_deve_devolver_20_itens_por_pagina`.

### Detalhe de binding descoberto na prática

O teste público usa `?plano_id={Guid}`, mas o model binding padrão do ASP.NET Core procuraria
`planoId`. Corrigido com `[FromQuery(Name = "plano_id")]` — sem isso, o filtro de plano era
silenciosamente ignorado (o teste retornava 7 em vez de 4).

## Decisões registradas

- Default `tamanho` = 20 (D19, teste público) em vez de 10 (spec) — já registrado na DIAG-02.
- Ordenação padrão: `data_cadastro` ascendente com `id` como desempate — registro novo em
  `DECISIONS.md`, exigido pela SPEC 3 ("escolha uma e registre a decisão").

## Uso de IA

Revisão: a IA implementou o envelope, filtros e validação seguindo o padrão de Planos.
Trecho não trivial: paginação com `Skip/Take` + ordenação estável; e o descobrimento do
binding `[FromQuery(Name = "plano_id")]` — o teste público falhava com 7 em vez de 4 e
a IA leu o comportamento real para achar a causa.