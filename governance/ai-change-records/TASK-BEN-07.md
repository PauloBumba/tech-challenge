# TASK-BEN-07 — Unicidade de CPF sob concorrência (constraint única)

## Descrição da tarefa

Garantir a SPEC 4.1: duas requisições de criação com o mesmo CPF chegando simultaneamente
nunca criam dois beneficiários. Decidir o mecanismo (constraint única + tratamento de
violação vs. lock aplicacional) e registrar em `DECISIONS.md` — pergunta de compreensão nº 1.

## Evidência RED → GREEN

Novo teste `Criar_com_mesmo_cpf_simultaneamente_so_deve_aceitar_um` (dois POSTs paralelos,
espera `201 + 409`). RED: sem índice único, ambos retornavam `201` (Created, Created).
GREEN após `HasIndex(b => b.Cpf).IsUnique()` + migration: `201 + 409`.

## O que mudou

- **`Infraestrutura/AppDbContext.cs`** — `HasIndex(b => b.Cpf).IsUnique()` em Beneficiarios
  (antes só a verificação aplicacional existia, com corrida).
- **`Infraestrutura/Migrations/`** — nova migration `IndiceUnicoCpfBeneficiario` + snapshot.
- **`Aplicacao/Servicos/BeneficiarioServico.cs`** — sem mudança: `SalvarAsync` já tratava a
  violação `23505` → `ConflitoException` (409); o índice faz essa violação passar a ocorrer de
  fato na corrida.
- **`tests/.../BeneficiariosTests.cs`** — novo teste de concorrência (POSTs paralelos).

## Testes rodados

`dotnet test` — 56/56 GREEN (novo teste de concorrência incluído).

## Decisão registrada

`DECISIONS.md` → [TASK-BEN-07]: constraint única no banco (mecanismo de Planos) — a checagem
aplicacional cobre o caso serial; o índice único cobre a corrida.