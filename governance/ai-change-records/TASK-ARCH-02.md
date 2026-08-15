# TASK-ARCH-02 — Organização em DDD (entidade por pasta)

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

Reorganização de pastas em DDD, mantendo as camadas da Clean Architecture já aplicadas na
TASK-ARCH-01. Cada agregado/entidade passou a ter a sua própria pasta em cada camada, e as
exceções de domínio viraram um shared kernel.

### Antes

```
Dominio/{Plano,Beneficiario,Excecoes}.cs        Aplicacao/{Plano,Beneficiario}Servico.cs
```

### Depois

```
src/Desafio.Api/
├── Api/                          ← Presentation
│   ├── Controllers/
│   ├── Middlewares/
│   └── Contratos/
│       ├── Planos/PlanoContratos.cs
│       ├── Beneficiarios/BeneficiarioContratos.cs
│       ├── ErroResponse.cs
│       └── JsonPadrao.cs
├── Aplicacao/                    ← Application (um agregado por pasta)
│   ├── Planos/PlanoServico.cs
│   └── Beneficiarios/BeneficiarioServico.cs
├── Dominio/                      ← Domain (um agregado por pasta)
│   ├── Planos/Plano.cs
│   ├── Beneficiarios/Beneficiario.cs
│   └── Comum/Excecoes.cs         ← shared kernel (exceções de domínio)
├── Infraestrutura/               ← Infrastructure
└── Program.cs                    ← composition root
```

Namespaces acompanham as pastas: `Desafio.Api.Dominio.Planos`, `Desafio.Api.Dominio.Beneficiarios`,
`Desafio.Api.Dominio.Comum`, `Desafio.Api.Aplicacao.Planos`, `Desafio.Api.Aplicacao.Beneficiarios`,
`Desafio.Api.Api.Contratos.Planos`, `Desafio.Api.Api.Contratos.Beneficiarios`.

## Arquivos alterados

- Movidos (7 arquivos): `Plano.cs`, `Beneficiario.cs`, `Excecoes.cs`, `PlanoServico.cs`,
  `BeneficiarioServico.cs`, `PlanoContratos.cs`, `BeneficiarioContratos.cs`
- Usings ajustados: `Program.cs`, controllers, middleware, `AppDbContext.cs`, `CargaInicial.cs`
- Migrations atualizadas: o snapshot e o Designer do EF Core guardam o nome completo das
  entidades (`Desafio.Api.Dominio.Plano` → `Desafio.Api.Dominio.Planos.Plano` etc.)

## Evidência

- `dotnet build --no-restore` → 0 erros.
- `dotnet test --no-restore` → **24/29**, mesma contagem da TASK-BEN-02 (5 falhas: BEN-03 ×1,
  BEN-04 ×3, BEN-05 ×1). Sem regressão — a reorganização é puramente estrutural.

## Decisão registrada

Ver `governance/DECISIONS.md` — [TASK-ARCH-02] DDD: entidade por pasta nas camadas, exceções
no shared kernel `Dominio/Comum/`.

## Uso de IA

Revisão: a IA executou a movimentação de arquivos e ajustes de namespaces sob orientação do
Paulo (pedido explícito de DDD + SOLID). Nenhuma lógica nova; a atualização das migrations
guardou nomes de entidades que o EF Core compara em runtime — por isso o teste continuou verde.