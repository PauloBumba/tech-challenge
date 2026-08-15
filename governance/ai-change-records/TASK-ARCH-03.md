# TASK-ARCH-03 — Clean Architecture por tipo (correção da TASK-ARCH-02)

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

A TASK-ARCH-02 organizou a camada `Dominio/` **por agregado** (`Dominio/Planos`,
`Dominio/Beneficiarios`, `Dominio/Comum`). Isso é DDD, mas não é a convenção da Clean
Architecture: nesta, a camada de domínio é subdividida **por tipo de artefato** — uma camada
para entidades, outra para enums, outra para exceções. Correção aplicada sob pedido explícito
do Paulo.

### Antes (TASK-ARCH-02 — por agregado)

```
Dominio/Planos/Plano.cs            Dominio/Beneficiarios/Beneficiario.cs
Dominio/Beneficiarios/StatusBeneficiario.cs   Dominio/Comum/Excecoes.cs
```

### Depois (TASK-ARCH-03 — por tipo)

```
Dominio/
├── Entidades/                    ← entidades
│   ├── Plano.cs
│   └── Beneficiario.cs
├── Enums/                        ← enums
│   └── StatusBeneficiario.cs
└── Excecoes/                     ← exceções de domínio (um arquivo por tipo)
    ├── DetalheErro.cs
    ├── ExcecaoDeDominio.cs
    ├── ValidacaoException.cs
    ├── NaoEncontradoException.cs
    ├── ConflitoException.cs
    └── NaoProcessavelException.cs
```

Aplicação do mesmo critério de "cada coisa no seu devido lugar" na camada `Aplicacao/`:

```
Aplicacao/
├── Servicos/                     ← serviços (PlanoServico, BeneficiarioServico)
└── Contratos/                    ← DTOs de entrada/filtro/página
    ├── PlanoRequestDados.cs
    ├── BeneficiarioRequestDados.cs
    ├── BeneficiarioFiltro.cs
    └── PaginaDeBeneficiarios.cs
```

Os DTOs que viviam colados no fim dos arquivos de serviço saíram para `Aplicacao/Contratos/`,
cada um no seu arquivo (SOLID — um tipo por arquivo).

Namespaces acompanham as pastas: `Desafio.Api.Dominio.Entidades`, `Desafio.Api.Dominio.Enums`,
`Desafio.Api.Dominio.Excecoes`, `Desafio.Api.Aplicacao.Servicos`, `Desafio.Api.Aplicacao.Contratos`.

## Arquivos alterados

- Movidos: `Dominio/Planos/Plano.cs` → `Dominio/Entidades/Plano.cs`; `Dominio/Beneficiarios/Beneficiario.cs`
  → `Dominio/Entidades/Beneficiario.cs`; `Aplicacao/Planos/PlanoServico.cs` e
  `Aplicacao/Beneficiarios/BeneficiarioServico.cs` → `Aplicacao/Servicos/`
- `Dominio/Enums/StatusBeneficiario.cs` — enum extraído de `Beneficiario.cs`
- `Dominio/Excecoes/` — `Excecoes.cs` (um arquivo com 6 tipos) dividido em um arquivo por tipo
- `Aplicacao/Contratos/` — DTOs extraídos dos arquivos de serviço
- Usings ajustados: `Program.cs`, controllers, middleware, `AppDbContext.cs`, `CargaInicial.cs`,
  contratos
- Migrations atualizadas: snapshot e Designer trocam `Desafio.Api.Dominio.Beneficiarios.Beneficiario`
  e `Desafio.Api.Dominio.Planos.Plano` por `Desafio.Api.Dominio.Entidades.*`

## Evidência

- `dotnet build` → 0 erros (aviso pré-existente CS8629 em `Beneficiario.cs:92-93`, fora de escopo).
- `dotnet test` → **24/29**, mesma contagem da TASK-BEN-02 (5 falhas: BEN-03 ×1, BEN-04 ×3,
  BEN-05 ×1). Sem regressão — a reorganização é puramente estrutural.

## Decisão registrada

Ver `governance/DECISIONS.md` — [TASK-ARCH-03] camada de domínio por tipo de artefato
(Entidades/Enums/Excecoes), corrigindo a abordagem por agregado da TASK-ARCH-02.

## Uso de IA

Revisão: a IA executou a correção estrutural sob pedido explícito do Paulo ("usa o pensamento de
Clean Architecture — teria uma camada para enum, outra para entidade, outra para exceção").
Nenhuma lógica nova; apenas movimentação de arquivos, ajuste de namespaces/usings e divisão de
tipos em arquivos individuais. A suíte seguiu 24/29.