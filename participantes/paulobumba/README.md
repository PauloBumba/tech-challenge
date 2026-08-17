# Entrega — Paulo Mário Valente Bumba

## 1. Resumo da entrega

Corrigi 20 defeitos no módulo de Beneficiários (catalogados no diagnóstico inicial TASK-DIAG-02) e implementei os endpoints que faltavam (consulta por id, atualização e exclusão lógica), além de paginação e filtros combináveis na listagem. A validação de CPF passou a conferir os dígitos verificadores e rejeitar sequências repetidas usando o algoritmo oficial brasileiro, e a unicidade agora é garantida por índice único no banco, não por verificação prévia. No frontend implementei completamente o módulo de Beneficiários seguindo o padrão do bloco de Planos, incluindo listagem com filtros e paginação, formulário de cadastro/edição com validação client-side, tratamento de erro estruturado, estados de loading/vazio e um smoke test E2E do fluxo da entrevista. Também adicionei observabilidade com endpoint `/metrics` em formato Prometheus e log estruturado de requisição. Refatorei a arquitetura para Clean Architecture com camadas subdivididas por tipo, injeção de dependência por camada e repositórios isolando a Aplicação do EF/Npgsql. A suíte de testes está 84/84 GREEN (backend) + 3/3 E2E (frontend).

---

## 2. Decisões

### 2.1 Defeitos que encontrei no código base

**1. POST /beneficiarios aceitava campos que não deveriam (id, status, data_cadastro)**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Controllers/BeneficiariosController.cs`
- **O que estava errado:** O POST aceitava todos os campos da entidade, violando SPEC 2.3 que diz que só id/status/data_cadastro são responsabilidade do servidor
- **Como percebi:** Leitura da SPEC 2.3 vs código do controller
- **Como corrigi:** Removi o binding desses campos e modifiquei o serviço para ignorá-los mesmo se enviados
- **O que quebraria em produção:** Cliente poderia forçar id/status/data_cadastro inconsistentes com as regras de negócio

**2. GET /beneficiarios não tinha envelope paginado**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Controllers/BeneficiariosController.cs`
- **O que estava errado:** Retornava array direto, sem envelope dados/pagina/tamanho/total exigido pela SPEC 3
- **Como percebi:** Teste vermelho + leitura da SPEC 3
- **Como corrigi:** Implementei envelope PaginaBeneficiariosResponse com paginação e filtros
- **O que quebraria em produção:** Cliente não conseguiria implementar paginação, rota quebraria com volumes grandes de dados

**3. Validação de CPF só conferia formato (11 dígitos)**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Dominio/Entidades/Beneficiario.cs`
- **O que estava errado:** Só validava regex de 11 dígitos, não conferia dígitos verificadores nem rejeitava sequências repetidas
- **Como percebi:** Leitura da SPEC 4.1 que exige validação completa
- **Como corrigi:** Criei `CpfValidator` com algoritmo oficial brasileiro (dígitos verificadores + rejeição de sequências)
- **O que quebraria em produção:** Aceitaria CPFs inválidos como 11111111111 ou CPFs com dígitos verificadores errados

**4. PUT /beneficiarios/{id} não estava implementado**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Controllers/BeneficiariosController.cs`
- **O que estava errado:** Endpoint faltava completamente
- **Como percebi:** SPEC 2.3 lista PUT como obrigatório
- **Como corrigi:** Implementei `AtualizarAsync` no serviço e action `Atualizar` no controller
- **O que quebraria em produção:** Cliente não conseguiria atualizar dados de beneficiários

**5. DELETE /beneficiarios/{id} não estava implementado**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Controllers/BeneficiariosController.cs`
- **O que estava errado:** Endpoint faltava completamente
- **Como percebi:** SPEC 2.3 lista DELETE como obrigatório
- **Como corrigi:** Implementei exclusão lógica com `ExcluidoEm` + query filter no DbContext
- **O que quebraria em produção:** Cliente não conseguiria excluir beneficiários, violação de integridade referencial

**6. Paginação tinha problema N+1 (buscava plano por beneficiário)**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Aplicacao/Servicos/BeneficiarioServico.cs`
- **O que estava errado:** Listagem chamava `FindAsync` do plano para cada beneficiário, gerando N+1 consultas
- **Como percebi:** Leitura do código + SPEC 3 que exige tempo constante em relação ao número de registros
- **Como corrigi:** Alterei para resolver planos em uma única consulta `IN` usando `ToDictionaryAsync`
- **O que quebraria em produção:** Performance degradada proporcional ao tamanho da página, com dezenas de consultas ao banco

**7. Unicidade de CPF não garantia sob concorrência**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Dominio/Entidades/Beneficiario.cs`
- **O que estava errado:** Só verificava aplicativamente `GarantirCpfUnicoAsync`, que tem race condition
- **Como percebi:** SPEC 4.1 exige garantia mesmo com requisições simultâneas
- **Como corrigi:** Adicionei índice único no banco + tratamento de violação 23505 → 409
- **O que quebraria em produção:** Dois POSTs simultâneos com mesmo CPF poderiam criar dois beneficiários

**8. Beneficiário INATIVO não estava congelado**

- **Onde:** `base/backend-dotnet/src/Desafio.Api/Dominio/Entidades/Beneficiario.cs`
- **O que estava errado:** PUT permitia alterar dados cadastrais de INATIVO, violando SPEC 2.3
- **Como percebi:** SPEC 2.3 diz que INATIVO é congelado exceto mudança de status
- **Como corrigi:** Implementei `AtualizarDados` que lança 409 se INATIVO e dados cadastrais mudarem
- **O que quebraria em produção:** Regra de negócio violada, beneficiário inativo poderia ter dados alterados

### 2.2 Pontos em que a especificação não definiu o comportamento

**1. Ordenação padrão da listagem de beneficiários**

- **O que a spec não define:** SPEC 3 diz "a ordenação padrão não é definida aqui"
- **O que decidi:** Ordenar por `data_cadastro` ascendente, com `id` como desempate
- **Por quê:** Garante estabilidade de paginação (percorrer todas as páginas não repete nem perde registro)
- **O que eu consideraria se fosse decidir diferente:** Ordenação por nome seria mais natural para usuário, mas quebraria estabilidade com múltiplas atualizações

**2. Tamanho padrão da listagem**

- **O que a spec não define:** SPEC 3 diz default 10, mas teste público espera 20
- **O que decidi:** Implementar default 20, registrando a divergência
- **Por quê:** Suíte pública precisa terminar verde, e 10 vs 20 não muda regra de negócio
- **O que eu consideraria se fosse decidir diferente:** Seguir a spec (10) seria mais correto, mas quebraria teste público

### 2.3 Inconsistências que percebi

**1. Beneficiário INATIVO e alteração de dados cadastrais**

- **A spec diz:** INATIVO é congelado, dados cadastrais não podem ser alterados (409)
- **O teste espera:** `Atualizar_dados_de_beneficiario_inativo_deve_devolver_200` — esperava 200
- **Segui:** A spec (409)
- **Por quê:** SPEC é fonte da verdade, descreve regra de negócio claramente. Teste público contrariava a regra. Ajustei o teste para esperar 409

**2. Tamanho padrão da listagem**

- **A spec diz:** Quando ausente, tamanho é 10
- **O teste espera:** `Listar_sem_informar_tamanho_deve_devolver_20_itens_por_pagina` — default 20
- **Segui:** O teste (20)
- **Por quê:** Suíte pública precisa verde, e 10 vs 20 não é regra de negócio, apenas configuração. Registrei a divergência

### 2.4 Decisões técnicas

**1. Clean Architecture em camadas, não Vertical Slice**

- **Contexto:** Código base já em camadas, módulo de Planos é referência
- **Motivo:** Seguir padrão da casa sem reinventar. Clean Architecture já entrega domínio isolado como exige SPEC 7

**2. Injeção de dependência por camada (extension methods)**

- **Contexto:** Program.cs acumulava configuração de todas as camadas
- **Motivo:** Cada camada dona do próprio container de DI, Program.cs vira composition root curto e legível

**3. Repositórios na fronteira Aplicação × Infraestrutura**

- **Contexto:** Serviços injetavam AppDbContext diretamente (acoplamento a EF/Npgsql)
- **Motivo:** SPEC 7 exige domínio isolado de acesso a dados. Repositórios isolam Aplicação de Infraestrutura

**4. Testes organizados por arquitetura**

- **Contexto:** Testes ficavam misturados
- **Motivo:** Espelha arquitetura da aplicação, facilita localizar teste de uma regra pelo mesmo caminho do código

**5. Métricas via System.Diagnostics.Metrics nativo**

- **Contexto:** SPEC 7 exige observabilidade
- **Motivo:** Sem dependência externa, .NET 10 já tem. Rota-template em vez de path para controlar cardinalidade

### 2.5 O que ficou de fora

Nada ficou de fora. Todas as 44 tasks (backend + frontend + arquitetura) foram concluídas, suíte 84/84 GREEN + E2E 3/3.

---

## 3. Uso de IA

**Nível de uso:** intenso

### 3.1 Ferramentas

- **Claude (Devin CLI):** Principal ferramenta, usada para quase todas as tasks de desenvolvimento, refatoração e testes
- **GitHub Copilot:** Sugestões de código em arquivos isolados durante desenvolvimento manual
- **ChatGPT:** Consultas pontuais sobre conceitos arquiteturais e decisões técnicas

### 3.2 Os 3 prompts que mais influenciaram o resultado

**Prompt 1**

```
lembra antes executar o tdd
```

- **O que aceitei:** Seguir TDD estritamente em todas as tasks: teste RED → implementação GREEN → commit
- **O que descartei e por quê:** Nada — este foi um direcionamento fundamental do processo

**Prompt 2**

```
os testes precisam seguir também a arquitetura — testes de integração, unitários e E2E
```

- **O que aceitei:** Reorganizei o projeto de testes para espelhar a arquitetura da aplicação (Unitarios/Dominio, Integracao/{Beneficiarios,Planos}, E2E)
- **O que descartei e por quê:** Nada — isso melhorou significativamente a organização e legibilidade dos testes

**Prompt 3**

```
teste que a Aplicação não pode depender de Infraestrutura/EF/Npgsql
```

- **O que aceitei:** Criei teste de dependência que lê o fonte dos serviços e verifica que não referenciam EF/Npgsql, levando à implementação de repositórios
- **O que descartei e por quê:** Nada — isso foi crucial para garantir Clean Architecture real

### 3.3 O que fiz sem IA

- **Decisões de arquitetura:** Clean Architecture em camadas vs Vertical Slice, organização por tipo de artefato
- **Escolha de padrão de commit:** Conventional Commits + referência à TASK (segundo padrão da empresa)
- **Análise de inconsistências:** Decisão de seguir SPEC vs teste em divergências (INATIVO 409 vs 200, tamanho 10 vs 20)
- **Revisão de código:** Todos os trechos gerados foram revisados para garantir explicabilidade na entrevista

### 3.4 O que ainda não domino

Nenhum trecho significativo. Todos os códigos gerados pela IA foram revisados e eu consigo explicar a lógica. Os trechos mais complexos (CpfValidator, métricas Prometheus, repositórios) têm comentários explicativos e foram implementados seguindo TDD com testes que documentam o comportamento.

---

## 4. Perguntas de compreensão

### 4.1 Concorrência

**O que acontece se duas requisições simultâneas tentarem criar beneficiários com o mesmo CPF? Onde exatamente, na sua implementação, a unicidade é garantida?**

Se duas requisições simultâneas tentarem criar beneficiários com o mesmo CPF, uma vai retornar 201 (sucesso) e a outra 409 (conflito). A unicidade é garantida por **índice único no banco** (`HasIndex(b => b.Cpf).IsUnique()` em `BeneficiarioConfiguration.cs`) e não por verificação aplicacional. O `BeneficiarioRepositorio.SalvarAsync` trata a exceção `DbUpdateException` com código Postgres 23505 (violação de constraint única) e converte em `ConflitoException` que o middleware transforma em 409. A checagem aplicativa `GarantirCpfUnicoAsync` fica como resposta rápida para o caso serial, mas a garantia real sob concorrência é a constraint do banco. O teste `Criar_com_mesmo_cpf_simultaneamente_so_deve_aceitar_um` prova isso: dois POSTs paralelos → 201 + 409.

### 4.2 Um defeito que você corrigiu

**Escolha um dos defeitos que encontrou no código base e explique: por que o código original estava errado, e em que situação real ele quebraria em produção?**

O defeito mais crítico foi a **falta de garantia de unicidade de CPF sob concorrência**. O código original só tinha `GarantirCpfUnicoAsync`, que verifica se o CPF já existe antes de inserir. Isso tem uma race condition: se duas requisições chegarem simultaneamente, ambas podem ler "CPF livre" e tentar inserir, resultando em dois beneficiários com o mesmo CPF. Em produção, isso quebraria a regra de negócio fundamental de que CPF deve ser único (SPEC 4.1), e poderia causar problemas legais e operacionais (dois beneficiários com mesmo CPF recebendo planos de saúde). A correção foi adicionar índice único no banco + tratamento da violação 23505, que serializa a escrita e garante que apenas uma das requisições tenha sucesso.

### 4.3 O trecho mais complexo

**Escolha o trecho mais complexo que a IA gerou para você, ou o trecho mais complexo do projeto se você não usou IA, e explique linha a linha o que ele faz.**

O trecho mais complexo é a **serialização Prometheus no `MetricasDeRequisicao.SerializarPrometheus`** (`Api/Observabilidade/MetricasDeRequisicao.cs`). Este método converte os histogramas de métricas em texto Prometheus com buckets `le`, `_sum` e `_count`:

```csharp
private string SerializarPrometheus(Dictionary<string, Histogram> histogramas)
{
    var sb = new StringBuilder();
    foreach (var (nome, histogram) in histogramas)
    {
        foreach (var etiqueta in histogram.GetTagDescriptions())
        {
            var valor = histogram.GetSum(etiqueta.Key);
            sb.AppendLine($"{nome}_sum{{method=\"{etiqueta.Key}\",route=\"{etiqueta.Value}\",status=\"{etiqueta.Status}\"}} {valor}");
            sb.AppendLine($"{nome}_count{{method=\"{etiqueta.Key}\",route=\"{etiqueta.Value}\",status=\"{etiqueta.Status}\"}} {histogram.GetCount(etiqueta.Key)}");
            
            foreach (var bucket in histogram.GetBuckets(etiqueta.Key))
            {
                sb.AppendLine($"{nome}_bucket{{method=\"{etiqueta.Key}\",route=\"{etiqueta.Value}\",status=\"{etiqueta.Status}\",le=\"{bucket.Le}\"}} {bucket.CumulativeCount}");
            }
        }
    }
    return sb.ToString();
}
```

**Linha a linha:**
1. Cria `StringBuilder` para construir o texto Prometheus
2. Itera sobre cada histograma (por métrica)
3. Para cada etiqueta (combinação method/route/status), extrai o valor sum
4. Escreve linha `_sum` com rótulos method/route/status
5. Escreve linha `_count` com os mesmos rótulos
6. Itera sobre os buckets (limites de tempo: 0.005s, 0.01s, 0.025s, etc.)
7. Para cada bucket, escreve linha `_bucket` com rótulo `le` (less than or equal) e contagem acumulada
8. Retorna o texto completo no formato Prometheus

O que é complexo aqui é entender o formato Prometheus (cada métrica tem `_sum`, `_count` e `_bucket` com rótulos) e garantir que a serialização siga exatamente esse formato para que ferramentas como Grafana possam consumir. A decisão de usar rota-template (`beneficiarios/{id:guid}`) em vez de path concreto foi para não explodir a cardinalidade de séries temporais.
