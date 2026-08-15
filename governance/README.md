# governance/

Processo de trabalho para o desafio técnico da 4Tech, adaptado do framework de governança de
IA do Sentinel Stack (AGENTS.md, TASKS.md, Princípio dos Pedaços, TDD, rastreabilidade de
decisões) — reduzido ao que faz sentido para um repositório solo de 7 dias, sem produção,
sem k8s, sem MCP.

## Hook de commit (opcional, mas recomendado)

Existe um hook em `.githooks/commit-msg` que bloqueia qualquer commit cuja mensagem referencie
uma TASK (`TASK-BEN-01: ...`) sem o `governance/ai-change-records/<TASK-ID>.md` correspondente
já existir. Ativar uma vez, depois de clonar:

```bash
bash .githooks/setup.sh
```

O hook só olha o sistema de arquivos local — nunca lê nem escreve nada rastreado pelo Git além
da mensagem de commit, então não afeta o PR nem precisa ser desativado antes de abri-lo. Se
quiser, `.githooks/` pode entrar no PR (não é um dos arquivos proibidos pelo desafio) como
evidência de processo — ou ficar de fora, sua escolha.

## Arquivos

| Arquivo | Para quê |
| --- | --- |
| `AGENTS.md` | Regras que qualquer IA usada no desafio segue: hierarquia de leitura, TDD, Princípio dos Pedaços, o que nunca fazer sem sua confirmação |
| `PROJECT_STATE.md` | Tabela de estado atual por módulo/endpoint, baseline tirado do SPEC.md seção 8 — atualizar a cada commit |
| `TASKS.md` | Backlog quebrado em tarefas pequenas e verificáveis, na ordem diagnóstico → backend → frontend → entrega |
| `TASK_CHECKLIST.md` | Checklist a rodar antes de começar qualquer TASK |
| `POST_TASK_WORKFLOW.md` | O que fazer depois que a TASK chega em GREEN, antes do commit |
| `AI_SESSION_CHECKPOINT.md` | Snapshot de fim de sessão, pra retomar no dia seguinte sem perder contexto |
| `AI_CHANGE_RECORD.md` | Índice das mudanças; detalhe de cada uma vai em `ai-change-records/<TASK-ID>.md` |
| `ai-change-records/` | Um arquivo por task: evidência RED→GREEN, arquivos alterados, commit |
| `DECISIONS.md` | Log de toda vez que a spec for omissa ou divergir do teste — alimenta a seção "Decisões" do README de entrega |
| `AI_USAGE.md` | Log de uso de IA por task — alimenta a seção "Uso de IA" e a resposta da pergunta de compreensão nº 3 |

## Fora do escopo (e por quê)

Do Sentinel Stack original, ficaram de fora `GOVERNANCE.md`, `PIPELINE.md`, `OPERATIONS.md`,
`DISASTER_RECOVERY.md`, `BACKUP.md`, `SLO.md`, `PRIVACY.md`, `AUDIT_CENTER.md`/`AUDIT_REPORT.md`
e `LLMS/`. São todos sobre produção, k8s, múltiplos agentes de IA e infraestrutura — nada disso
existe num desafio solo de 7 dias sem deploy real. Recriar isso aqui seria exatamente a
incoerência que o enunciado da 4Tech penaliza (declarar processo que não bate com o que foi
entregue).

## Por que essa pasta e não editar os arquivos do desafio

O README do desafio invalida a entrega se `README.md`, `SPEC.md`, `verificar.sh`, `LICENSE` ou
`.github/` forem alterados, e penaliza mexer na estrutura de pastas porque isso suja o diff que
o time lê na revisão. Esta pasta é nova, isolada, e não compete com nada disso — mas se preferir
manter o diff do PR absolutamente mínimo, ela pode ficar fora do fork (num repositório privado
seu à parte) e ser usada só como processo de trabalho, sem entrar no PR final.

## Onde isso entra no fluxo do `README.md`/`SPEC.md` do desafio

1. Você (ou a IA, seguindo `AGENTS.md`) preenche `PROJECT_STATE.md` na Fase 1 de diagnóstico.
2. Cada item vira uma ou mais linhas em `TASKS.md`.
3. Antes de cada TASK: `TASK_CHECKLIST.md`.
4. A TASK segue RED → GREEN → REFACTOR → commit (Seção 3 do `AGENTS.md`).
5. Depois de GREEN, antes do commit: `POST_TASK_WORKFLOW.md` — gera
   `ai-change-records/<TASK-ID>.md`, atualiza o índice em `AI_CHANGE_RECORD.md`,
   `TASKS.md` e `PROJECT_STATE.md`.
6. Toda ambiguidade de spec vira uma linha em `DECISIONS.md` no momento em que aparece.
7. Ao fechar uma sessão de trabalho: `AI_SESSION_CHECKPOINT.md`, pra retomar sem perder contexto.
8. No fim, `DECISIONS.md` e `AI_USAGE.md` viram, quase diretamente, as seções "Decisões" e
   "Uso de IA" do README de `participantes/<seu-identificador>/README.md`.
