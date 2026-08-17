import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { mensagemDeErro } from '../nucleo/api';
import { NotificacaoServico } from '../nucleo/notificacao-servico';
import { Plano } from '../planos/plano';
import { Beneficiario, StatusBeneficiario } from './beneficiario';
import { BeneficiarioServico } from './beneficiario-servico';
import { apenasDigitos, cpfValido, formatarCpf } from './cpf';

/**
 * Formulário de cadastro e edição de beneficiários. Usa reactive forms para a
 * validação client-side (obrigatórios, formato de CPF, data no passado — SPEC
 * 9.4) e mapeia os erros da API em mensagem na tela via `mensagemDeErro`.
 */
@Component({
  selector: 'app-beneficiario-formulario',
  imports: [ReactiveFormsModule],
  templateUrl: './beneficiario-formulario.html',
  styleUrl: './beneficiario-formulario.css'
})
export class BeneficiarioFormulario implements OnInit {
  private readonly servico = inject(BeneficiarioServico);
  private readonly notificacaoServico = inject(NotificacaoServico);
  private readonly destroyRef = inject(DestroyRef);

  // null = cadastro; preenchido = edição (CPF vira somente leitura).
  @Input() beneficiario: Beneficiario | null = null;
  @Input() planos: Plano[] = [];

  @Output() salvo = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  protected readonly statuses: StatusBeneficiario[] = ['ATIVO', 'INATIVO'];
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    nome_completo: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(120)
    ]),
    cpf: new FormControl('', [Validators.required, cpfFormatoValido()]),
    data_nascimento: new FormControl('', [Validators.required, dataNoPassado()]),
    plano_id: new FormControl('', [Validators.required]),
    status: new FormControl<StatusBeneficiario>('ATIVO', [Validators.required])
  });

  // Inputs só estão disponíveis no ngOnInit, não no construtor.
  ngOnInit(): void {
    if (this.beneficiario) {
      this.preencherParaEdicao();
    }

    // Configurar máscara de CPF automática enquanto digita
    this.formulario.controls.cpf.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(valor => {
      if (valor && !this.beneficiario) {
        const valorMascarado = this.aplicarMascaraCpf(valor);
        if (valor !== valorMascarado) {
          this.formulario.controls.cpf.setValue(valorMascarado, { emitEvent: false });
        }
      }
    });
  }

  private preencherParaEdicao(): void {
    this.formulario.patchValue({
      nome_completo: this.beneficiario!.nome_completo,
      cpf: formatarCpf(this.beneficiario!.cpf),
      data_nascimento: this.beneficiario!.data_nascimento,
      plano_id: this.beneficiario!.plano_id,
      status: this.beneficiario!.status
    });

    // CPF não é editável na edição (SPEC 9.4).
    this.formulario.controls.cpf.disable();
  }

  private aplicarMascaraCpf(valor: string): string {
    // Remove tudo que não é dígito
    const digitos = valor.replace(/\D/g, '');
    
    // Aplica a máscara: 000.000.000-00
    if (digitos.length <= 3) {
      return digitos;
    } else if (digitos.length <= 6) {
      return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    } else if (digitos.length <= 9) {
      return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    } else {
      return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
    }
  }

  protected salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const resultado = this.beneficiario
      ? this.servico.atualizar(this.beneficiario.id, {
          nome_completo: valores.nome_completo ?? '',
          data_nascimento: valores.data_nascimento ?? '',
          plano_id: valores.plano_id ?? '',
          status: valores.status ?? 'ATIVO'
        })
      : this.servico.criar({
          nome_completo: valores.nome_completo ?? '',
          cpf: apenasDigitos(valores.cpf ?? ''),
          data_nascimento: valores.data_nascimento ?? '',
          plano_id: valores.plano_id ?? ''
        });

    this.enviando.set(true);
    this.erro.set(null);

    resultado.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificacaoServico.sucesso(
          this.beneficiario ? 'Beneficiário atualizado com sucesso!' : 'Beneficiário cadastrado com sucesso!'
        );
        this.salvo.emit();
      },
      error: (resposta: HttpErrorResponse) => {
        this.erro.set(mensagemDeErro(resposta));
        this.enviando.set(false);
      }
    });
  }
}

/** O CPF precisa ser válido (formato + dígitos verificadores). */
function cpfFormatoValido(): ValidatorFn {
  return (controle) =>
    cpfValido(controle.value ?? '') ? null : { cpf_invalido: true };
}

/** Data de nascimento precisa estar no passado. */
function dataNoPassado(): ValidatorFn {
  return (controle) => {
    const valor = controle.value;
    if (!valor) {
      return null;
    }

    const hoje = new Date().toISOString().slice(0, 10);
    return valor > hoje ? { data_futura: true } : null;
  };
}