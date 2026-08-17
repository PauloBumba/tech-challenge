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
import { Plano } from './plano';
import { PlanoServico } from './plano-servico';

/**
 * Formulário de cadastro e edição de planos. Usa reactive forms para a
 * validação client-side (obrigatórios, tamanho) e mapeia os erros da API
 * em mensagem na tela via `mensagemDeErro`.
 */
@Component({
  selector: 'app-plano-formulario',
  imports: [ReactiveFormsModule],
  templateUrl: './plano-formulario.html',
  styleUrl: './plano-formulario.css'
})
export class PlanoFormulario implements OnInit {
  private readonly servico = inject(PlanoServico);
  private readonly notificacaoServico = inject(NotificacaoServico);
  private readonly destroyRef = inject(DestroyRef);

  // null = cadastro; preenchido = edição.
  @Input() plano: Plano | null = null;

  @Output() salvo = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly formulario = new FormGroup({
    nome: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(60)
    ]),
    codigo_registro_ans: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])
  });

  ngOnInit(): void {
    if (this.plano) {
      this.preencherParaEdicao();
    }
  }

  private preencherParaEdicao(): void {
    this.formulario.patchValue({
      nome: this.plano!.nome,
      codigo_registro_ans: this.plano!.codigo_registro_ans
    });
  }

  protected salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const resultado = this.plano
      ? this.servico.atualizar(this.plano.id, {
          nome: valores.nome ?? '',
          codigo_registro_ans: valores.codigo_registro_ans ?? ''
        })
      : this.servico.criar({
          nome: valores.nome ?? '',
          codigo_registro_ans: valores.codigo_registro_ans ?? ''
        });

    this.enviando.set(true);
    this.erro.set(null);

    resultado.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificacaoServico.sucesso(
          this.plano ? 'Plano atualizado com sucesso!' : 'Plano cadastrado com sucesso!'
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
