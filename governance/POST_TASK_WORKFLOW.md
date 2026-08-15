# POST_TASK_WORKFLOW.md

O que acontece depois que uma TASK chega em GREEN, antes do commit. Referenciado por
`AGENTS.md`, Seção 3 e 7.

## 1. Apresentação do resultado

O agente (ou você, revisando o próprio trabalho) resume, em poucas linhas:
- o que mudou (arquivos)
- o teste que estava RED e agora está GREEN (comando + resultado)
- se alguma decisão de spec omissa/divergente foi tomada no caminho

## 2. Confirmação

Antes de commitar: `dotnet test` completo rodou verde, não só o teste novo. Se algo mais
quebrou, a TASK não está pronta — trata o que quebrou antes de seguir.

## 3. Commit

Mensagem no formato Conventional Commits (padrão da empresa), com a referência à TASK para
rastreabilidade:

```
<tipo>(<escopo>): <o que mudou, em poucas palavras>

<porquê, se não for óbvio>

TASK: <TASK-ID>
```

Tipos: `feat` (endpoint/regra nova), `fix` (correção), `refactor` (estrutura sem mudança de
comportamento), `test`, `docs`, `chore`. Escopo: módulo/área (`beneficiarios`, `planos`,
`arquitetura`, `testes`...). Exemplo:

```
feat(beneficiarios): implementar PUT /beneficiarios/{id}

AtualizarAsync congela dados cadastrais de INATIVO (409, SPEC 2.3), permitindo
só reativação; cpf imutável; 422 para plano inexistente.

TASK: TASK-BEN-04
```

Um commit = uma TASK. Não acumula duas TASKs num commit só, mesmo que pareçam relacionadas —
isso é o que deixa o histórico legível na revisão.

## 4. Registro

- [ ] Se a TASK envolveu decisão de spec: linha nova em `DECISIONS.md`
- [ ] Se envolveu IA em algo não trivial: linha nova em `AI_USAGE.md`
- [ ] Novo arquivo em `ai-change-records/<TASK-ID>.md` (ver `AI_CHANGE_RECORD.md`)
- [ ] Linha da TASK atualizada em `TASKS.md` (`todo` → `done`)
- [ ] Linha correspondente atualizada em `PROJECT_STATE.md`

## 5. Próximo passo

Volta pro `TASK_CHECKLIST.md` pra próxima TASK. Se for parar por hoje, atualiza
`AI_SESSION_CHECKPOINT.md` antes de fechar.
