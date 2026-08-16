# AI_USAGE.md

Log cru de uso de IA por task, preenchido durante o trabalho — vira insumo direto da seção
"Uso de IA" do README de entrega e um candidato natural para a pergunta de compreensão nº 3
("o trecho mais complexo que a IA gerou").

Formato:

```
### [TASK-ID]
- **Nível de uso:** gerado do zero pela IA / IA como par (sugestão + revisão) / só revisão / sem IA
- **Prompt que mais influenciou o resultado:** (resumo, não precisa ser literal)
- **Trecho não trivial gerado:** arquivo + o que faz, em uma frase
- **Ainda não explicaria com segurança:** sim/não — se sim, o quê e por quê
```

---

### [ADR-026]
- **Nível de uso:** só revisão — política de segredos adaptada pelo Paulo, aplicada com revisão da IA
- **Prompt que mais influenciou o resultado:** "não pode ter credencial no código ou teste"
- **Trecho não trivial gerado:** `AppDbContextFactory.cs` — remoção do fallback hardcoded e erro
  orientando a definir `ConnectionStrings__Postgres`
- **Ainda não explicaria com segurança:** não

---

### [TASK-ARCH-03]
- **Nível de uso:** só revisão — a correção estrutural foi pedida explicitamente pelo Paulo
  ("usa o pensamento de Clean Architecture — teria uma camada para enum, outra para entidade,
  outra para exceção")
- **Prompt que mais influenciou o resultado:** "esta errado ... usa o pensamento de clean
  architecture ... uma camada para enum outra para entidade ou para exceção"
- **Trecho não trivial gerado:** `Dominio/Excecoes/*.cs` — divisão do `Excecoes.cs` monolítico
  em um arquivo por exceção (um tipo por arquivo, SOLID), mantendo o namespace unificado
- **Ainda não explicaria com segurança:** não

---

### [TASK-ARCH-04]
- **Nível de uso:** IA como par — a IA executou a reorganização estrutural e escreveu os
  testes unitários do domínio sob pedido explícito do Paulo
- **Prompt que mais influenciou o resultado:** "os testes precisam seguir também a arquitetura
  — testes de integração, unitários e E2E"
- **Trecho não trivial gerado:** `Unitarios/Dominio/Entidades/BeneficiarioTests.cs` — a Theory
  de casos-limite (nome curto/longo, CPF fora do formato) espelha exatamente as regras que o
  `DefinirDados` da entidade valida, com o detalhe `DetalheErro(campo, regra)` por campo
- **Ainda não explicaria com segurança:** não

---

### [TASK-ARCH-05]
- **Nível de uso:** só revisão — o padrão de composition root por camada foi pedido pelo Paulo
  ("cria uma injeção de dependência por camada e depois registrar isso no program pra não
  poluir o program.cs")
- **Prompt que mais influenciou o resultado:** "cria uma injeção de dependência por camada e
  depois registrar isso no program"
- **Trecho não trivial gerado:** `Api/Dependencias.cs` — `AddApi` concentra toda a configuração
  de apresentação (CORS, JSON, model state → `ErroResponse`, Swagger) e expõe a constante
  `PoliticaDaWeb` consumida pelo `Program.cs`
- **Ainda não explicaria com segurança:** não

---

### [TASK-BEN-04]
- **Nível de uso:** IA como par — o Paulo decidiu a divergência D20 (INATIVO congelado → 409)
  e a IA implementou `AtualizarAsync`/`AtualizarDados`
- **Prompt que mais influenciou o resultado:** decisão do Paulo "seguir a spec (409)" para o
  conflito entre SPEC 2.3 (INATIVO congelado) e o teste público (esperava 200)
- **Trecho não trivial gerado:** `AtualizarDados` na entidade — a regra que compara os dados
  cadastrais atuais com os recebidos e lança `ConflitoException` (409) só quando o
  beneficiário está `INATIVO`, permitindo a reativação (mudança de status sozinha)
- **Ainda não explicaria com segurança:** não

---

### [TASK-BEN-08]
- **Nível de uso:** IA como par — a IA implementou o validador completo de CPF seguindo TDD
- **Prompt que mais influenciou o resultado:** "lembra antes executar o tdd" — seguiu TDD
  estritamente: teste RED → implementação GREEN → commit
- **Trecho não trivial gerado:** `CpfValidator.CalcularDigitoVerificador` — algoritmo oficial
  do CPF brasileiro (peso 10→2 e 11→2, resto < 2 → 0 senão 11-resto) com comentário explicando
  o algoritmo
- **Ainda não explicaria com segurança:** não

---

### [TASK-BEN-09]
- **Nível de uso:** validação apenas — funcionalidade já estava implementada via query filter
- **Prompt que mais influenciou o resultado:** "09" — prosseguir com TASK-BEN-09
- **Trecho não trivial gerado:** nenhum — apenas testes de validação
- **Ainda não explicaria com segurança:** não

---

### [TASK-BEN-10]
- **Nível de uso:** validação apenas — funcionalidade já estava implementada via middleware
- **Prompt que mais influenciou o resultado:** "10" — prosseguir com TASK-BEN-10
- **Trecho não trivial gerado:** nenhum — apenas testes de validação
- **Ainda não explicaria com segurança:** não

---

### [TASK-INF-01]
- **Nível de uso:** refatoração estrutural — subdivisão por tipo seguindo Clean Architecture
- **Prompt que mais influenciou o resultado:** "sim" — usuário solicitou reorganização de Infraestrutura
- **Trecho não trivial gerado:** nenhum — apenas criação de pastas e atualização de namespaces
- **Ainda não explicaria com segurança:** não

---

### [TASK-ARCH-07]
- **Nível de uso:** IA como par — a IA extraiu as interfaces/implementações de repositório e a
  Fluent API por entidade sob pedido explícito do Paulo (teste de dependência RED primeiro)
- **Prompt que mais influenciou o resultado:** "teste que a Aplicação não pode depender de
  Infraestrutura/EF/Npgsql" — gerou o `RegraDeDependenciaTests` que lê o fonte dos serviços
- **Trecho não trivial gerado:** `BeneficiarioRepositorio.SalvarAsync` — conversão de
  `DbUpdateException` (Postgres 23505) em `ConflitoException`; e `ListarAsync` resolvendo os
  planos da página em uma única consulta `IN` (anti-N+1 herdado de TASK-BEN-06)
- **Ainda não explicaria com segurança:** não

---

### [TASK-FE-01 a TASK-FE-04] Módulo de Beneficiários no frontend (listagem, formulário, erros, estados)
- **Nível de uso:** IA como par — o Paulo pediu foco no frontend ("vamos no front end"); a IA
  construiu o módulo seguindo o padrão do bloco de Planos (modelo tipado, serviço isolado com
  `API_BASE` injetado, `mensagemDeErro`, `takeUntilDestroyed`)
- **Prompt que mais influenciou o resultado:** "vamos no front end pode ser" + foco em
  TASK-FE-01 a TASK-FE-04
- **Trecho não trivial gerado:** `beneficiarios/cpf.ts` — `cpfValido` espelhando o algoritmo
  oficial do CPF (dígitos verificadores, peso 10→2 e 11→2, resto < 2 → 0 senão 11-resto,
  rejeição de sequências repetidas), mesmo comportamento do `CpfValidator` do backend; e
  `beneficiario-formulario.ts` — validators customizados (`cpfFormatoValido`, `dataNoPassado`)
  em reactive forms
- **Ainda não explicaria com segurança:** não

---

### [TASK-FE-05] Polish de CSS (visual coerente sem mudar comportamento)
- **Nível de uso:** IA como par — pedido explícito do Paulo ("dar um design na interface,
  ux/ui"); a IA poliu reutilizando a paleta existente (azul #1d4ed8, vermelho #b42318), sem
  introduzir biblioteca de componentes
- **Prompt que mais influenciou o resultado:** "qual pira de dar o design na interface, ux/ui"
- **Trecho não trivial gerado:** badges de status com classes `status ATIVO/INATIVO` e campo
  inválido com `[class.invalido]` — CSS puro, sem lógica nova de componente
- **Ainda não explicaria com segurança:** não

---

### [TASK-FE-06] Infra E2E com Playwright (revelou e corrigiu bug NG0203)
- **Nível de uso:** IA como par — pedido do Paulo para ter E2E no frontend; a infra Playwright
  foi montada e o smoke test do fluxo da entrevista foi escrito pela IA
- **Prompt que mais influenciou o resultado:** "implementar E2E" (opção escolhida no questionário)
- **Trecho não trivial gerado:** o **diagnóstico do NG0203** — `takeUntilDestroyed()` sem
  `DestroyRef` chamado em handler de clique lança `inject()` fora de injection context e faz o
  cadastro/edição/exclusão nunca acontecerem no navegador real (o build verde não pegava isso);
  correção: `inject(DestroyRef)` + `takeUntilDestroyed(this.destroyRef)` nos 3 componentes. E o
  gerador de CPF aleatório válido no spec (mesmo algoritmo do `CpfValidator`, para não colidir
  com CPF de excluído logicamente que continua ocupado — TASK-BEN-05)
- **Ainda não explicaria com segurança:** não
