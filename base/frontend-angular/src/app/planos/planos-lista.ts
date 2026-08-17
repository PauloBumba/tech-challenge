import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IndicadorCarregamento } from '../compartilhado/indicador-carregamento';
import { mensagemDeErro } from '../nucleo/api';
import { NotificacaoServico } from '../nucleo/notificacao-servico';
import { Plano } from './plano';
import { PlanoFormulario } from './plano-formulario';
import { PlanoServico } from './plano-servico';

@Component({
  selector: 'app-planos-lista',
  imports: [IndicadorCarregamento, PlanoFormulario],
  templateUrl: './planos-lista.html',
  styleUrl: './planos-lista.css'
})
export class PlanosLista {
  private readonly servico = inject(PlanoServico);
  private readonly notificacaoServico = inject(NotificacaoServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly planos = signal<Plano[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly modalNovoAberto = signal(false);
  protected readonly modalEdicaoAberto = signal(false);
  protected readonly planoParaEditar = signal<Plano | null>(null);
  protected readonly planoParaExcluir = signal<Plano | null>(null);

  constructor() {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    // takeUntilDestroyed cancela a inscrição quando o componente sai da tela.
    // Sem isso, navegar entre rotas vaza subscription.
    this.servico
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (planos) => {
          this.planos.set(planos);
          this.carregando.set(false);
        },
        error: (resposta: HttpErrorResponse) => {
          this.erro.set(mensagemDeErro(resposta));
          this.carregando.set(false);
        }
      });
  }

  protected solicitarEdicao(plano: Plano): void {
    this.planoParaEditar.set(plano);
    this.modalEdicaoAberto.set(true);
  }

  protected solicitarExclusao(plano: Plano): void {
    this.planoParaExcluir.set(plano);
  }

  protected confirmarExclusao(): void {
    const plano = this.planoParaExcluir();
    if (!plano) return;
    this.servico.excluir(plano.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificacaoServico.sucesso('Plano excluído com sucesso!');
        this.planoParaExcluir.set(null);
        this.carregar();
      },
      error: (resposta: HttpErrorResponse) => {
        this.erro.set(mensagemDeErro(resposta));
        this.planoParaExcluir.set(null);
      }
    });
  }
}
