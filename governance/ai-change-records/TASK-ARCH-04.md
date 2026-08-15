# TASK-ARCH-04 — Testes espelhando a arquitetura (unitário / integração / E2E)

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

O projeto de testes passou a espelhar a arquitetura da aplicação: uma pasta por **tipo de
teste** (`Unitarios` / `Integracao` / `E2E`) e, em integração, subpastas por módulo. A suíte
pública foi **preservada integralmente** — nenhum teste apagado ou enfraquecido, apenas movido
(reorganização estrutural, motivo registrado em `DECISIONS.md` [ADR-TESTES-01]).

### Antes

```
tests/Desafio.Api.Tests/
├── ApiFixture.cs            ← infra de integração (Testcontainers + WebApplicationFactory)
├── Auxiliares.cs            ← helpers (PlanosSeed, GeradorDeCpf, Http)
├── BeneficiariosTests.cs    ← 29 testes públicos, soltos na raiz
└── PlanosTests.cs
```

### Depois

```
tests/Desafio.Api.Tests/
├── Integracao/                        ← testes com banco real (Testcontainers)
│   ├── ApiFixture.cs                  ← fixture compartilhada
│   ├── Auxiliares.cs                  ← helpers (PlanosSeed renomeado para evitar colisão
│   │                                    com o namespace Integracao.Planos)
│   ├── Beneficiarios/BeneficiariosTests.cs
│   └── Planos/PlanosTests.cs
├── Unitarios/                          ← testes puros, sem banco nem HTTP
│   └── Dominio/
│       ├── Entidades/
│       │   ├── BeneficiarioTests.cs   ← regras de validação da entidade
│       │   └── PlanoTests.cs          ← regras de validação + exclusão lógica
│       └── Excecoes/
│           └── ExcecaoDeDominioTests.cs  ← mapa tipo de exceção → StatusCode
└── E2E/                               ← cenários full-stack (API + banco + web)
    └── README.md                      ← infra prevista para a fase frontend (TASK-FE)
```

Namespaces acompanham as pastas: `Desafio.Api.Tests.Integracao`,
`Desafio.Api.Tests.Integracao.Beneficiarios`, `Desafio.Api.Tests.Integracao.Planos`,
`Desafio.Api.Tests.Unitarios.Dominio.Entidades`, `Desafio.Api.Tests.Unitarios.Dominio.Excecoes`.

## Arquivos alterados

- Movidos (4): `ApiFixture.cs`, `Auxiliares.cs`, `BeneficiariosTests.cs`, `PlanosTests.cs`
- Novo (4): `BeneficiarioTests.cs`, `PlanoTests.cs`, `ExcecaoDeDominioTests.cs` (unitários),
  `E2E/README.md`
- Helper `Planos` → `PlanosSeed` (colidiria com o namespace `Integracao.Planos`)

## Evidência

- `dotnet test` → **49/54**: 29 de integração (mesmas 24 verdes + 5 pendentes BEN-03/04/05) +
  25 unitários novos, todos GREEN. Nenhuma regressão e nenhum teste público enfraquecido.

## Decisões registradas

- `DECISIONS.md` — [ADR-TESTES-01] organização dos testes seguindo a arquitetura.
- `DECISIONS.md` — [ADR-ARQ-01] Clean Architecture em camadas, não Vertical Slice (o código
  base já nasceu em camadas; a SPEC 8 cita Planos como padrão da casa).

## Uso de IA

Revisão: a IA executou a reorganização e escreveu os testes unitários do domínio sob pedido
explícito do Paulo ("os testes precisam seguir também a arquitetura"). A regra de validação
das entidades foi traduzida direto do código existente; os casos (nome curto, CPF fora do
formato, data futura, plano ausente) espelham o que o `TratamentoDeErroMiddleware` já
centraliza.