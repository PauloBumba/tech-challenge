# AGENTS.md — Desafio Técnico 4Tech

Fonte única de instruções para qualquer agente de IA (Claude, Copilot, Cursor etc.) usado neste
repositório durante o desenvolvimento do desafio. Adaptado do processo do Sentinel Stack, com
tudo que não se aplica a um repositório solo de 7 dias removido (produção, k8s, MCP, multi-tenant,
AI Jail). O que sobrou é o que realmente importa aqui: rastreabilidade e compreensão real do
código, porque é isso que a 4Tech avalia na revisão e na entrevista.

---

## 0. Contexto que muda tudo em relação ao Sentinel Stack

- Não existe "produção" aqui. Existe um PR e uma entrevista.
- O critério de aprovação não é "testes verdes" — é "Paulo consegue explicar qualquer linha
  entregue, mesmo a gerada por IA". Ver `SPEC.md` / `README.md` do desafio, seção "Sobre o uso
  de IA": declarar uso intenso e explicar tudo com segurança conta a favor; fingir reprova.
- O módulo de Planos (`PlanoServico`, `PlanosController`) é o padrão da casa. Nenhuma
  implementação nova em Beneficiários pode inventar um padrão diferente sem motivo registrado.
- Toda decisão onde a spec, o teste e o código divergem precisa virar uma linha em
  `governance/DECISIONS.md` (ver Seção 4) — isso alimenta diretamente a seção "Decisões" do
  README de entrega, que pesa mais do que parece na avaliação.

## 1. Hierarquia de leitura obrigatória

Antes de qualquer tarefa:

1. `SPEC.md` — fonte da verdade sobre comportamento esperado (não pode ser editado)
2. `AGENTS.md` — este arquivo
3. `governance/PROJECT_STATE.md` — o que já está pronto, o que falta, o que está quebrado
4. `governance/TASKS.md` — backlog quebrado em pedaços pequenos
5. `governance/AI_SESSION_CHECKPOINT.md` — se houve sessão anterior, retomar por aqui
6. Código do módulo de Planos (`Dominio/Plano.cs`, `Aplicacao/PlanoServico.cs`,
   `Controllers/PlanosController.cs`) — é o padrão a seguir para Beneficiários

Antes de iniciar cada TASK individual: `governance/TASK_CHECKLIST.md`. Depois de cada GREEN,
antes do commit: `governance/POST_TASK_WORKFLOW.md`.

## 2. Regras universais

- O `SPEC.md` é a fonte da verdade. Se o pedido do usuário conflitar com ele, o agente sinaliza
  antes de agir — não decide sozinho e não segue em silêncio.
- Nenhum padrão do módulo de Planos é reinventado sem motivo. Se mudar, o motivo vai para
  `governance/DECISIONS.md`.
- Toda tarefa é rastreável a uma entrada em `governance/TASKS.md`.
- Proibido vibe coding: nenhum trecho entra no projeto sem que Paulo consiga explicá-lo depois.
  Se o agente gerar algo não trivial (concorrência, expressões regulares, LINQ complexo), deixa
  um comentário curto explicando o "porquê", não só o "o quê" — e registra em
  `governance/AI_USAGE.md` (Seção 5) como candidato a pergunta 3 do README.

## 3. Fluxo de desenvolvimento (TDD como mecanismo, não formalidade)

```
TESTE (RED) → IMPLEMENTAÇÃO MÍNIMA (GREEN) → REFACTOR → COMMIT → PROJECT_STATE
```

- Escreve o teste antes, roda e confirma que falha (RED). Isso é a evidência de que o teste
  testa algo de verdade.
- Implementa o mínimo para passar (GREEN). Não implementa "enquanto está aqui" — isso é escopo
  além do pedido, e o desafio deixa claro que escopo extra não vale ponto.
- Refatora com os testes verdes, sem comportamento novo.
- Um commit = uma sub-tarefa verificável (um defeito corrigido, um endpoint, uma validação).
  Mensagem de commit referencia a TASK de `governance/TASKS.md` e explica o porquê, não só o quê
  — o histórico é lido na revisão e vira assunto de entrevista.

## 4. Princípio dos Pedaços (Divide and Conquer)

```
SPEC → Módulo (Planos/Beneficiários) → Endpoint/Regra → TASK → Commit → Teste
```

Regra de ouro: se a tarefa não cabe em uma frase objetiva ("corrigir X em Y para que Z"), está
grande demais e precisa ser dividida.

Uma TASK nunca mistura: banco + endpoint + frontend ao mesmo tempo; dois defeitos não
relacionados; um defeito e uma feature nova.

## 5. Registro de decisões (o que mais pesa na avaliação)

Toda vez que a spec for omissa, a spec e o teste divergirem, ou uma escolha técnica não-trivial
for feita, isso vira uma linha em `governance/DECISIONS.md` no formato:

```
- **[onde]** spec diz X / teste espera Y (se aplicável) → decidido: Z, porque W.
```

No fim, essas linhas vão quase literalmente para a seção "Decisões" do README de entrega. Não
esperar o fim do desafio para escrever — registrar na hora, como o próprio README do desafio
recomenda.

## 6. Ações que o agente nunca faz sem Paulo confirmar explicitamente

- `git push` / abrir o Pull Request para a 4Tech
- Editar `README.md`, `SPEC.md`, `verificar.sh`, `LICENSE` ou qualquer coisa em `.github/`
  (invalida a entrega)
- Apagar ou enfraquecer um teste existente só para ficar verde (é o oposto do que o desafio
  quer — mudar teste existente é permitido, mas só com motivo registrado em `DECISIONS.md`)
- Refatorar o módulo de Planos sem motivo explícito registrado
- Publicar imagem no Docker Hub / mexer em `participantes/<id>/`

## 7. Checklist antes de qualquer commit

- [ ] Teste correspondente existe e passou de RED para GREEN
- [ ] `dotnet test` completo continua verde (não só o teste novo)
- [ ] Segue o padrão de camadas do módulo de Planos (Dominio / Aplicacao / Controllers)
- [ ] Nenhuma regra de negócio vazou para o Controller
- [ ] Se algo na spec era ambíguo: linha nova em `governance/DECISIONS.md`
- [ ] Se o trecho é complexo o suficiente para virar pergunta 3 da entrevista: comentário +
      linha em `governance/AI_USAGE.md`

## 8. Continuidade entre sessões

Se a sessão de IA for reiniciada, reler nesta ordem: `governance/PROJECT_STATE.md` →
`governance/TASKS.md` → `governance/AI_SESSION_CHECKPOINT.md`. Não assumir nada que não esteja
escrito nesses arquivos ou no Git — a conversa anterior é efêmera. Ao encerrar uma sessão,
atualizar `governance/AI_SESSION_CHECKPOINT.md` antes de parar.

## 9. Rastro de auditoria

Toda TASK concluída gera um arquivo em `governance/ai-change-records/<TASK-ID>.md` (a partir
de `_TEMPLATE.md`) com a evidência RED→GREEN e os arquivos alterados, e ganha uma linha no
índice `governance/AI_CHANGE_RECORD.md`. Isso é o que sustenta, na entrevista, qualquer
pergunta do tipo "por que esse commit ficou assim" sem depender de memória.

---

*Adaptado do `AGENTS.md` do Sentinel Stack. Removido: MCP, AI Jail, produção/k8s, multi-tenant,
governança de infraestrutura — nada disso existe neste contexto de desafio solo de 7 dias.*
