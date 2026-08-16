# TASK-FE-04 — Loading, lista vazia e exclusão só após sucesso do DELETE

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-15

## O que mudou

- `beneficiario-lista.html` — estados condicionais: `carregando()` ("Carregando beneficiários..."),
  `erro()` (mensagem da API no lugar da tabela) e lista vazia ("Nenhum beneficiário encontrado."),
  seguindo o mesmo padrão do `planos-lista.html`
- `beneficiario-lista.ts` — `excluir()` chama `servico.excluir(id)` e só recarrega a lista no
  `next` (resposta de sucesso). No `error` o item continua na tela e `mensagemDeErro` avisa o
  usuário (SPEC 9.5: "a exclusão só some da lista depois da resposta de sucesso; se o DELETE
  falhar, o item continua lá e o usuário é avisado")
- `window.confirm()` antes de excluir evita exclusão acidental

## Evidência RED → GREEN

Frontend sem teste automatizado na suíte pública (SPEC 9.7). Evidência de compilação:

```
$ npm run build
# ANTES: sem estados de loading/vazio/exclusão assíncrona
```

```
$ npm run build
# DEPOIS: Application bundle generation complete — 0 erros TS
```

## Decisão registrada (se houve)

Nenhuma — comportamento segue SPEC 9.5 e o padrão do bloco de Planos.

## Uso de IA (se houve)

Revisão apenas — ver `../AI_USAGE.md` [TASK-FE-04].