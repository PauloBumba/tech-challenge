# TASK_CHECKLIST.md

Checklist obrigatório antes de começar qualquer TASK de `TASKS.md`. Referenciado por
`AGENTS.md`, Seção 7.

## 1. Leitura

- [ ] Li a linha da TASK em `TASKS.md` e ela cabe numa frase objetiva
- [ ] Li a parte correspondente do `SPEC.md` (não só a tabela da seção 8 — o texto da regra)
- [ ] Conferi `PROJECT_STATE.md`: essa TASK depende de alguma outra ainda `todo`?
- [ ] Se for TASK de Beneficiários, abri o equivalente em Planos como referência de padrão

## 2. Escopo

- [ ] A TASK mexe em só um módulo (não banco + endpoint + frontend juntos)
- [ ] A TASK corrige/implementa uma coisa, não "aproveita e já resolve" outra coisa não pedida
      (escopo extra não vale ponto no desafio — SPEC/README, "O que não pesa")
- [ ] Se a TASK depender de uma decisão que a spec não define, isso já está identificado
      (vai para `DECISIONS.md` antes do commit, não depois)

## 3. TDD

- [ ] Teste escrito primeiro
- [ ] Rodei a suíte e confirmei que o teste novo falha (RED) — guardo o output pro
      `AI_CHANGE_RECORD`
- [ ] Só depois disso implemento o mínimo pra passar

## 4. Antes de marcar como pronta

- [ ] `dotnet test` completo continua verde (não só o teste novo)
- [ ] Segue camadas do padrão de Planos (Dominio / Aplicacao / Controllers), nada de regra de
      negócio no Controller
- [ ] Log estruturado, sem interpolação de string, se a TASK gerar log novo (SPEC 7)
- [ ] Sem chamada bloqueante dentro de método `async` (SPEC 7)

Se qualquer item não puder ser confirmado, a TASK fica em `doing`/`red` — não vira commit.
