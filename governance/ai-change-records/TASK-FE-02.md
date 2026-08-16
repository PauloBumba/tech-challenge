# TASK-FE-02 — Formulário de cadastro/edição com validação client-side

**Commit:** (hash, preencher depois de commitar)
**Data:** 2026-08-15

## O que mudou

- `src/app/beneficiarios/beneficiario-formulario.ts|html|css` (novos) — `BeneficiarioFormulario`
  com reactive forms (`FormGroup`): campos obrigatórios (`Validators.required`), nome com
  `minLength(3)`/`maxLength(120)`, CPF com `cpfFormatoValido` (formato + dígitos verificadores),
  data de nascimento com `dataNoPassado`
- `src/app/beneficiarios/cpf.ts` (novo) — `cpfValido`/`apenasDigitos`/`formatarCpf`,
  espelhando o `CpfValidator` do backend (`Dominio/Validadores/CpfValidator.cs`): 11 dígitos,
  rejeição de sequências repetidas, dígitos verificadores (peso 10→2 e 11→2)
- `@Input() beneficiario` null = cadastro (POST), preenchido = edição (PUT); na edição o CPF
  vira `disable()` (SPEC 9.4: "o CPF não é editável na edição")
- Cadastro envia `nome_completo`/`cpf`/`data_nascimento`/`plano_id`; edição envia
  `nome_completo`/`data_nascimento`/`plano_id`/`status`

## Evidência RED → GREEN

Frontend sem teste automatizado na suíte pública (SPEC 9.7). Evidência de compilação:

```
$ npm run build
# ANTES: formulário ausente
```

```
$ npm run build
# DEPOIS: Application bundle generation complete — 0 erros TS
```

## Decisão registrada (se houve)

Nenhuma — validação client-side segue SPEC 9.4 e espelha a regra do domínio.

## Uso de IA (se houve)

IA como par — ver `../AI_USAGE.md` [TASK-FE-02].