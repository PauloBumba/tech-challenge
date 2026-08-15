# TASK-ARCH-05 — DI por camada via composition root

## Descrição da tarefa

Extrair a configuração do container de injeção de dependência do `Program.cs` para um
extension method por camada, mantendo o `Program.cs` apenas como composition root que chama
`AddInfraestrutura`, `AddAplicacao` e `AddApi`. Evitar que o `Program.cs` polua com a
configuração de cada camada.

## Evidência RED → GREEN

Mudança estrutural (comportamento inalterado). Evidência: build com 0 erros e suíte idêntica
antes/depois — 49/54 (5 falhas = pendências BEN-03/BEN-04/BEN-05, não relacionadas).

## O que mudou

- **Novo `src/Desafio.Api/Api/Dependencias.cs`** — `DependenciasDaApi.AddApi`: CORS (policy
  `web`, origem `http://localhost:4200`), `AddControllers` + `JsonPadrao`, `ApiBehaviorOptions`
  (model state inválido → `ErroResponse` 400), Swagger/OpenAPI.
- **Novo `src/Desafio.Api/Aplicacao/Dependencias.cs`** — `DependenciasDaAplicacao.AddAplicacao`:
  registra `PlanoServico` e `BeneficiarioServico` (scoped).
- **Novo `src/Desafio.Api/Infraestrutura/Dependencias.cs`** — `DependenciasDaInfraestrutura.AddInfraestrutura`:
  `AddDbContext<AppDbContext>` com Npgsql lendo `ConnectionStrings:Postgres`.
- **`src/Desafio.Api/Program.cs`** — enxugado: registros removidos, passa a chamar os três
  `Add*`; `NormalizarCampo` movido para `Api/Dependencias.cs` (privado); a constante
  `PoliticaDaWeb` agora é `DependenciasDaApi.PoliticaDaWeb`. `PrepararBancoAsync` permanece no
  composition root.

## Testes rodados

`dotnet build` (0 erros, 2 avisos pré-existentes CS8629) e `dotnet test` — 49/54, idêntico ao
estado anterior.

## Decisão registrada

`DECISIONS.md` → [TASK-ARCH-05] Composition root por camada.