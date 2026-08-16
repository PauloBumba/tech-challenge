# DECISIONS.md

Log cru de decisões, na hora em que são tomadas — não reconstruir de memória no fim (o próprio
README do desafio recomenda isso). Cada linha vira, quase literalmente, uma frase da seção
"Decisões" do README de entrega.

Formato:

```
### [TASK-ID] Título curto
- **Situação:** spec omissa / spec x teste divergem / escolha técnica livre
- **O que a spec diz:** ...
- **O que o teste espera (se aplicável):** ...
- **Decisão:** ...
- **Porquê:** ...
```

---

### [ADR-ARQ-01] Clean Architecture em camadas, não Vertical Slice
- **Situação:** escolha técnica livre — o desafio não impõe estilo arquitetural; o código base
  já nasceu em camadas (Dominio / Aplicacao / Controllers), e o README do desafio permite
  mudar estrutura de pastas desde que a SPEC continue cumprida e o motivo fique registrado
- **Decisão:** manter **Clean Architecture em camadas** (Presentation `Api/` → Application
  `Aplicacao/` → Domain `Dominio/` → Infrastructure `Infraestrutura/`), com cada camada
  subdividida por tipo de artefato. **Não** migrar para Vertical Slice (um feature folder com
  tudo dentro)
- **Porquê:** o módulo de Planos — o padrão da casa, citado na SPEC seção 8 como referência de
  "estrutura de camadas, tratamento de erro, validação e testes" — foi escrito em camadas;
  refatorar para Vertical Slice seria reinventar o padrão da casa sem motivo (AGENTS.md §2) e
  deixaria o diff do PR ilegível (README do desafio). Camadas em Clean Architecture já entregam
  o que a SPEC 7 exige: "regra de negócio não vive no controller; domínio isolado de framework
  e de acesso a dados"

### [ADR-TESTES-01] Organização dos testes seguindo a mesma arquitetura da aplicação
- **Situação:** escolha técnica livre — README do desafio permite mudar estrutura de pastas e
  adicionar testes (é avaliado); proíbe apenas apagar teste para a suíte ficar verde
- **O que a spec diz:** SPEC 7 — "os endpoints e correções que você implementar precisam de
  testes escritos por você"; o módulo de Planos é o padrão de camadas, tratamento de erro,
  validação **e testes**
- **Decisão:** o projeto de testes espelha a arquitetura da aplicação, com uma pasta por tipo
  de teste (unitário / integração / E2E) e, dentro de integração, subpastas que refletem as
  camadas e módulos da aplicação. A suíte pública existente é preservada (não é apagada nem
  enfraquecida — reorganização estrutural mantendo todos os casos, com motivo registrado)
- **Porquê:** o código de teste é avaliado na revisão do diff e na entrevista; organizá-lo com
  o mesmo critério da Clean Architecture (cada coisa no seu devido lugar) mantém o projeto
  coerente e legível, e facilita localizar o teste de uma regra pelo mesmo caminho do código
  que a implementa

### [TASK-BEN-07] Unicidade de CPF sob concorrência — constraint única no banco
- **Situação:** pergunta de compreensão nº 1 — como garantir que dois POSTs simultâneos com o
  mesmo CPF nunca criem dois beneficiários
- **O que a spec diz:** SPEC 4.1 — "a unicidade precisa ser garantida mesmo quando duas
  requisições de criação com o mesmo CPF chegam simultaneamente; em nenhuma hipótese podem
  existir dois beneficiários com o mesmo CPF"
- **Decisão:** **índice único no banco** (`HasIndex(b => b.Cpf).IsUnique()`) + tratamento da
  violação `23505` no `SalvarAsync` (já existia — `DbUpdateException` com `PostgresException`
  vira `ConflitoException` 409). A checagem aplicacional `GarantirCpfUnicoAsync` fica como
  resposta rápida para o caso serial, e o índice cobre o caso concorrente
- **Porquê:** check-then-insert aplicacional tem corrida (T1 e T2 leem "livre", ambos inserem);
  a garantia real em PostgreSQL é a constraint de unicidade, que serializa a escrita e dispara
  `23505` para o segundo; o middleware converte em 409. É o mesmo mecanismo do
  `PlanoServico` (índice único + violação → 409). Teste de integração
  `Criar_com_mesmo_cpf_simultaneamente_so_deve_aceitar_um` prova: dois POSTs paralelos →
  201 + 409

### [TASK-ARCH-06] Padrão de commit: Conventional Commits + referência à TASK
- **Situação:** escolha de processo — a governança (`POST_TASK_WORKFLOW.md` §3) definia
  `<TASK-ID>: <descrição>` como formato de commit; o Paulo informou que o padrão da empresa é
  Conventional Commits
- **Decisão:** adotar **Conventional Commits** (`<tipo>(<escopo>): <descrição>`, tipos
  `feat`/`fix`/`refactor`/`test`/`docs`/`chore`...), **mantendo a referência à TASK** no final
  da descrição ou no corpo — ex.: `feat(beneficiarios): implementar PUT /beneficiarios/{id}
  (TASK-BEN-04)`. O `POST_TASK_WORKFLOW.md` §3 será atualizado para o novo formato
- **Porquê:** seguir a convenção da empresa conta na avaliação (o time lê o histórico e vira
  assunto de entrevista); a referência à TASK preserva a rastreabilidade exigida pelo
  AGENTS.md §3 ("um commit = uma sub-tarefa verificável, mensagem referencia a TASK") e pelo
  hook de commit do `governance/README.md`

### [TASK-BEN-04] Beneficiário INATIVO congelado — decidido: 409 (spec), teste público ajustado
- **Situação:** spec x teste divergem
- **O que a spec diz:** SPEC 2.3 — INATIVO é congelado, dados cadastrais não podem ser alterados
  (409); só mudança de `status` é permitida (reativação)
- **O que o teste espera:** `Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` — altera
  `nome_completo` de INATIVO e espera 200
- **Decisão:** **seguir a spec** — `PUT` sobre INATIVO com mudança cadastral responde `409`;
  mudança de `status` sozinha (reativação) continua `200`. O teste público
  `Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` foi **ajustado para esperar `409`**
  e o nome do método passou a `Atualizar_dados_de_beneficiario_inativo_deve_devolver_409`
  (mudança de teste existente permitida com motivo registrado, AGENTS.md §6). Adicionado teste
  próprio de reativação (INATIVO→ATIVO mantendo os dados = 200)
- **Porquê:** a SPEC é a fonte da verdade (AGENTS.md §2) e descreve a regra de negócio com
  clareza ("registro congelado"); a 4Tech pontua quem percebe a inconsistência e decide com
  justificativa — e o teste público contrariava a regra. O README de entrega registrará esta
  divergência na seção de decisões

### [TASK-BEN-03] GET /beneficiarios/{id} no padrão de Planos
- **Situação:** endpoint novo a implementar — o README do desafio manda seguir o padrão existente
- **Decisão:** implementar `ObterAsync` no serviço + action `Obter` no controller, espelhando
  `PlanoServico.ObterAsync`/`PlanosController.Obter` (mesma exceção `NaoEncontradoException`,
  mesmo `ProducesResponseType`); o POST passou a usar `CreatedAtAction(nameof(Obter), ...)`
  no lugar do `Created(...)` explícito, exatamente como previa a decisão [TASK-BEN-01]
- **Porquê:** nenhuma ação é "padrão novo do zero" (README); o motivo da troca do Location já
  estava registrado e a action `Obter` agora existe

### [TASK-BEN-03] Validação: manter no domínio (não adotar FluentValidation nem value object)
- **Situação:** escolha técnica — cogitada a adoção de FluentValidation no HTTP e de `Cpf` como
  value object (DDD)
- **Decisão:** **manter a validação na entidade** (`DefinirDados` + `ValidacaoException` com
  `DetalheErro` por campo), como Planos já faz; não adicionar FluentValidation nem value
  objects novos
- **Porquê:** é o padrão da casa (SPEC 8 cita Planos como referência de validação) e já cumpre
  a SPEC 7 ("regra de negócio não vive no controller"); adotar FluentValidation/VO em
  Beneficiários sem que Planos use seria "inventar padrão novo do zero" (README ~313) e
  duplicaria a validação; escopo extra sem bônus no desafio

### [TASK-ARCH-05] Injeção de dependência por camada (composition root)
- **Situação:** escolha técnica livre — o `Program.cs` vinha acumulando a configuração de
  todas as camadas (DbContext, serviços, CORS, JSON, model state, Swagger)
- **Decisão:** cada camada expõe um extension method que registra a própria dependência:
  `AddInfraestrutura` (DbContext), `AddAplicacao` (serviços), `AddApi` (Presentation:
  CORS/JSON/model state/Swagger); `Program.cs` vira apenas o composition root que os chama
- **Porquê:** mantém cada camada dona do próprio container de DI (dependência visível no
  filesystem), deixa o `Program.cs` curto e legível, e novos serviços/DTOs são registrados no
  arquivo `Dependencias` da própria camada — sem poluir o composition root. Mudança
  estrutural: suíte idêntica (49/54)

### [TASK-ARCH-03] Camada de domínio por tipo de artefato (correção da TASK-ARCH-02)
- **Situação:** correção de abordagem — TASK-ARCH-02 organizou `Dominio/` por agregado
  (`Planos`/`Beneficiarios`/`Comum`); o Paulo apontou que o pensamento Clean Architecture
  subdivide a camada de domínio **por tipo**, não por agregado
- **Decisão:** `Dominio/Entidades/` (Plano, Beneficiario), `Dominio/Enums/`
  (StatusBeneficiario), `Dominio/Excecoes/` (um arquivo por exceção, ex-shared kernel
  `Comum/Excecoes.cs` dividido); `Aplicacao/` separa `Servicos/` de `Contratos/` (DTOs de
  entrada/filtro/página saíram dos arquivos de serviço para um arquivo por tipo);
  namespaces acompanham pastas; migrations atualizadas
- **Porquê:** Clean Architecture organiza o domínio pela natureza do artefato (entidade, enum,
  exceção), e a aplicação pela função (serviço vs. contrato) — é a convenção que o Paulo pede;
  SOLID ganha "um tipo por arquivo" também para os DTOs. Mudança puramente estrutural:
  `dotnet test` seguiu 24/29, sem regressão

### [TASK-ARCH-02] DDD: entidade por pasta (agregado por módulo) — **substituído pela TASK-ARCH-03**
- **Situação:** escolha técnica livre — o desafio não impõe organização de pastas
- **Decisão:** cada agregado (Plano, Beneficiario) tem a própria pasta em cada camada
  (`Dominio/Planos|Beneficiarios`, `Aplicacao/Planos|Beneficiarios`,
  `Api/Contratos/Planos|Beneficiarios`); exceções de domínio formam o shared kernel
  `Dominio/Comum/`; namespaces acompanham as pastas; migrations atualizadas (o snapshot do
  EF Core guarda o nome completo das entidades)
- **Porquê:** DDD — agrupar por agregado deixa a fronteira do domínio visível no filesystem e
  "cada coisa no seu devido lugar"; o shared kernel centraliza as exceções reutilizadas por
  todos os agregados (SOLID); a suíte seguiu 24/29, provando que é mudança estrutural pura

### [TASK-BEN-02] Ordenação padrão da listagem de beneficiários
- **Situação:** escolha técnica livre — SPEC 3 diz "a ordenação padrão não é definida aqui"
- **Decisão:** ordenar por `data_cadastro` ascendente, com `id` como desempate
- **Porquê:** garante estabilidade de paginação (SPEC exige: percorrer todas as páginas não
  repete nem perde registro) mesmo com dois registros criados no mesmo instante

### [TASK-ARCH-01] Organização de pastas em camadas Clean Architecture
- **Situação:** escolha técnica livre — o desafio não impõe estrutura de pastas; o padrão de
  Planos existia (Dominio / Aplicacao / Controllers)
- **Decisão:** a camada de apresentação (Presentation) passou a viver inteira em `Api/`
  (`Api/Controllers/`, `Api/Middlewares/`, `Api/Contratos/`); `Aplicacao/` = Application,
  `Dominio/` = Domain, `Infraestrutura/` = Infrastructure, `Program.cs` = composition root
- **Porquê:** antes `Controllers/` ficava na raiz do projeto, separado dos middlewares e
  contratos que pertencem à mesma camada lógica (Presentation). Unificar as pastas deixa a
  dependência visível no filesystem (Presentation → Application → Domain, com Infrastructure
  plugada embaixo), o que é exatamente o que Clean Architecture pede — sem mudar nenhuma
  regra de negócio nem o padrão dos serviços (TDD manteve a suíte idêntica: 20/29)
- **Zero credencial em código/testes confirmado na mesma task:** o único `Password` do
  fonte está em `appsettings.Development.json` (dev-only, ADR-026); testes usam senha
  aleatória do Testcontainers

### [ADR-026] Gestão de segredos — adaptação ao desafio
- **Situação:** escolha técnica — política ADR-026 (Sentinel Stack) aplicada ao repositório do desafio
- **O que a spec diz:** SPEC/README não mencionam segredos; não é requisito do desafio
- **Decisão:** zero credencial em código e em testes; `appsettings.json` neutro (connection string
  vazia); credencial dev-only em `appsettings.Development.json`; produção/entrega só por variável
  de ambiente (`ConnectionStrings__Postgres`); `.env.example` documenta as variáveis sem valores
  reais; composes usam interpolação `${VAR:-desafio}` com default dev-only
- **Porquê:** o `verificar.sh` (intocável) sobe a stack sem `.env`, então o compose não pode exigir
  secret externo; `desafio/desafio` é credencial local sem valor em produção. Aplica-se o ADR-026
  onde é possível sem quebrar o contrato da entrega, e a exceção fica documentada em vez de escondida

### [TASK-BEN-01] Header Location do POST sem a action Obter
- **Situação:** escolha técnica — padrão de Planos usa `CreatedAtAction(nameof(Obter), ...)`
- **O que a spec diz:** SPEC 2.3 — `POST` retorna `201` com header `Location`
- **Decisão:** usar `Created($"/beneficiarios/{id}", ...)` (URL montada explicitamente) em vez de
  `CreatedAtAction`, com comentário no código apontando para a TASK-BEN-03
- **Porquê:** `CreatedAtAction` exige a action `Obter` para gerar a URL; `Obter` é a TASK-BEN-03 e
  implementá-la aqui seria escopo além do pedido (AGENTS.md §4). A URL do `Location` é o padrão
  `$"/beneficiarios/{id}"`, o mesmo que o `CreatedAtAction` geraria; na BEN-03 a troca é opcional

### [TASK-DIAG-02] Beneficiário INATIVO e alteração de dados cadastrais
- **Situação:** spec x teste divergem
- **O que a spec diz:** SPEC 2.3 — INATIVO é congelado, dados cadastrais não podem ser alterados
  (409); só mudança de `status` é permitida
- **O que o teste espera:** `Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` — altera
  `nome_completo` de INATIVO e espera 200
- **Decisão:** a definir na TASK-BEN-04 (spec 409 vs teste 200); o teste público atual contraria
  a regra de negócio da spec, e TASK-BEN-04 (agenda) segue a spec. Decisão registrada na
  DIAG-02 para não ser tomada de memória
- **Porquê:** TASK-BEN-04 prevê "INATIVO congelado exceto mudança de status" conforme a spec;
  se a suíte pública não for ajustada, o teste fica vermelho — mudar teste existente só com
  motivo registrado (AGENTS.md §6)

### [TASK-DIAG-02] Tamanho padrão da listagem de beneficiários
- **Situação:** spec x teste divergem
- **O que a spec diz:** SPEC 3 — `tamanho` quando ausente é `10`
- **O que o teste espera:** teste público `Listar_sem_informar_tamanho_deve_devolver_20_itens_por_pagina` — default `20`
- **Decisão:** implementar default `20`, registrando a divergência; a spec prevê que especificações
  reais são inconsistentes e manda decidir e registrar
- **Porquê:** a suíte pública precisa terminar verde (SPEC 7) e o teste é explícito sobre o
  comportamento; `10` vs `20` não muda regra de negócio nenhuma. Registrado na DIAG-02, decidido
  na TASK-BEN-02

### [TASK-BEN-08] Validador de CPF completo — algoritmo oficial brasileiro
- **Situação:** implementação de regra de negócio — SPEC 4.1 exige validação completa de CPF
- **O que a spec diz:** SPEC 4.1 — "exatamente 11 dígitos numéricos, sem pontuação; os dois dígitos
  verificadores precisam ser válidos; sequências de dígitos repetidos são inválidas mesmo quando
  os dígitos verificadores fecham"
- **Decisão:** criar `CpfValidator` em `Dominio/Validadores/` com validação de formato (regex),
  rejeição de sequências repetidas e cálculo dos dígitos verificadores usando o algoritmo oficial
  do CPF brasileiro (peso 10→2 e 11→2, resto < 2 → 0 senão 11-resto). Integrar na entidade
  `Beneficiario` substituindo a validação simples de formato
- **Porquê:** antes só se validava formato (11 dígitos) via regex gerada; a SPEC exige validação
  completa, e o algoritmo oficial é o que a Receita Federal usa — garante que CPFs com dígitos
  verificadores inválidos ou sequências repetidas sejam rejeitados. Segue Clean Architecture:
  validador no domínio, testes unitários + integração

### [TASK-BEN-09] Regras de exclusão lógica de planos — já implementada via query filter
- **Situação:** validação de funcionalidade existente — SPEC 4.2 descreve o comportamento de
  exclusão lógica de planos e vínculos com beneficiários
- **O que a spec diz:** SPEC 4.2 — "Plano excluído logicamente conta como inexistente para
  novos vínculos; não pode ser referenciado por novos beneficiários nem por atualizações.
  Beneficiários que já apontavam para o plano no momento da exclusão continuam válidos e
  permanecem vinculados a ele"
- **Decisão:** funcionalidade já estava implementada corretamente via query filter em
  `AppDbContext` (`HasQueryFilter(p => p.ExcluidoEm == null)` em Planos). Adicionados testes
  de integração como evidência: plano excluído → 422 para novos vínculos, beneficiários
  existentes continuam acessíveis e mantêm o vínculo
- **Porquê:** o query filter do EF Core já garante o comportamento descrito na SPEC: planos
  excluídos não aparecem em consultas normais (`GarantirPlanoExisteAsync` usa `db.Planos`
  e respeita o filter), mas beneficiários não têm filter dependente de Plano, então continuam
  acessíveis mesmo quando o plano é excluído. Nenhuma mudança de código necessária, apenas
  validação por testes

### [TASK-BEN-10] Tratamento de erro centralizado — já implementado via middleware
- **Situação:** validação de funcionalidade existente — SPEC 5 exige tratamento de erro
  centralizado com corpo JSON estruturado
- **O que a spec diz:** SPEC 5 — "Respostas de erro têm corpo JSON descrevendo o problema,
  com detalhamento suficiente para o cliente identificar qual campo foi recusado e por quê.
  O tratamento é centralizado: erros não previstos não podem vazar stack trace nem detalhes
  internos ao cliente, e resultam em 500 com corpo no mesmo formato dos demais erros"
- **Decisão:** funcionalidade já estava implementada corretamente via `TratamentoDeErroMiddleware`
  (captura `ExcecaoDeDominio` e `Exception`, converte em `ErroResponse` com estrutura JSON).
  Adicionados testes de integração como evidência: 400/404/409/422 retornam corpo JSON com campo
  `erro` e array `detalhes`
- **Porquê:** o middleware centralizado já captura todas as exceções de domínio (`ValidacaoException`,
  `ConflitoException`, `NaoEncontradoException`, `NaoProcessavelException`) e retorna resposta
  JSON estruturada; exceções não previstas resultam em 500 com `ErroInterno` sem vazar stack trace.
  Nenhuma mudança de código necessária, apenas validação por testes

### [TASK-INF-01] Reorganização de Infraestrutura — subdivisão por tipo
- **Situação:** refatoração estrutural — Clean Architecture exige subdivisão por tipo de artefato
- **O que o padrão diz:** ADR-ARQ-01 estabelece que camadas devem ser subdivididas por tipo de
  artefato (como TASK-ARCH-03 fez com Dominio e Aplicacao)
- **Decisão:** camada `Infraestrutura` subdividida em `Persistence/` (AppDbContext, AppDbContextFactory,
  CargaInicial, Migrations) e `Configuration/` (Dependencias). Namespaces atualizados em todos
  os arquivos afetados (Dominio, Aplicacao, Api, Program.cs, Tests)
- **Porquê:** segue o mesmo princípio de separação por tipo aplicado nas TASKs anteriores,
  tornando a arquitetura mais consistente e organizada. Cada tipo de infraestrutura tem sua
  própria pasta, facilitando manutenção e expansão futura

### [TASK-ARCH-07] Repositórios na fronteira Aplicação × Infraestrutura
- **Situação:** escolha técnica — serviços da Aplicação injetavam `AppDbContext` diretamente
  (acoplamento a EF/Npgsql, contraria a Clean Architecture que isola domínio/aplicação de
  acesso a dados — SPEC 7)
- **O que a spec diz:** SPEC 7 — "domínio isolado de framework e de acesso a dados"; a Aplicação
  não pode conhecer a camada de infraestrutura
- **Decisão:** **interfaces de repositório em `Aplicacao/Repositorios/`** (`IPlanoRepositorio`,
  `IBeneficiarioRepositorio`) e **implementações em `Infraestrutura/Persistence/Repositorios/`**
  que encapsulam o `AppDbContext`. Serviços dependem só das interfaces; o DI registra
  `AddScoped<IX, X>()`. Um teste de dependência (`RegraDeDependenciaTests`) lê o fonte de
  `Aplicacao/Servicos/*.cs` e falha se aparecer `using Desafio.Api.Infraestrutura`,
  `Microsoft.EntityFrameworkCore` ou `Npgsql`
- **Porquê:** a Clean Architecture exige que a Aplicação declare a própria porta (interface) e a
  Infraestrutura a implemente — a seta da dependência aponta de Infra para Aplicação. Isso deixa
  a regra visível no código e a torna testável (é a mesma motivação do teste RED que iniciou a
  task). Sem mudança de comportamento: suíte passou de 79/79 para 80/80 (só o teste novo de
  arquitetura foi adicionado)

### [TASK-ARCH-07] Fluent API por entidade em `IEntityTypeConfiguration<T>`
- **Situação:** escolha técnica — a configuração Fluent API do EF Core estava toda no
  `OnModelCreating` do `AppDbContext` (um arquivo monolítico acumulando configurações de Planos
  e Beneficiários)
- **Decisão:** extrair a Fluent API para uma classe **por entidade** em
  `Infraestrutura/Persistence/Configuracoes/` (`PlanoConfiguration.cs`,
  `BeneficiarioConfiguration.cs`), registradas via `ApplyConfigurationsFromAssembly`
- **Porquê:** SOLID (Single Responsibility) — cada entidade tem a própria configuração no próprio
  arquivo, em vez de tudo centralizado no DbContext; segue o mesmo critério de "um tipo por
  arquivo" já adotado em Dominio/Aplicacao (TASK-ARCH-03) e Infraestrutura (TASK-INF-01)
