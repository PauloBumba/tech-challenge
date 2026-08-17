import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CardMetrica } from '../compartilhado/card-metrica';
import { criarDistribuicao } from '../compartilhado/distribuicao';
import { DialogoDeConfirmacao } from '../compartilhado/dialogo-de-confirmacao';
import { GraficoRosca } from '../compartilhado/grafico-rosca';
import { IndicadorCarregamento } from '../compartilhado/indicador-carregamento';
import { Modal } from '../compartilhado/modal';
import { SeletorVisualizacao, Visualizacao } from '../compartilhado/seletor-visualizacao';
import { mensagemDeErro } from '../nucleo/api';
import { NotificacaoServico } from '../nucleo/notificacao-servico';
import { BeneficiarioServico } from '../beneficiarios/beneficiario-servico';
import { Plano } from './plano';
import { PlanoFormulario } from './plano-formulario';
import { PlanoServico } from './plano-servico';

@Component({
  selector: 'app-planos-lista',
  imports: [CardMetrica, DialogoDeConfirmacao, GraficoRosca, IndicadorCarregamento, Modal, PlanoFormulario, SeletorVisualizacao],
  templateUrl: './planos-lista.html',
  styleUrl: './planos-lista.css'
})
export class PlanosLista {
  private readonly servico = inject(PlanoServico);
  private readonly beneficiarioServico = inject(BeneficiarioServico);
  private readonly notificacaoServico = inject(NotificacaoServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly planos = signal<Plano[]>([]);
  protected readonly beneficiariosPorPlano = signal<Map<string, number>>(new Map());
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly modalNovoAberto = signal(false);
  protected readonly modalEdicaoAberto = signal(false);
  protected readonly planoParaEditar = signal<Plano | null>(null);
  protected readonly planoParaExcluir = signal<Plano | null>(null);

  // Filtros e busca
  protected readonly termoBusca = signal('');
  protected readonly filtroCodigoAns = signal('');
  protected readonly visualizacao = signal<Visualizacao>('tabela');

  // Computed para filtros
  protected readonly planosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLocaleLowerCase('pt-BR');
    const codigo = this.filtroCodigoAns().trim();
    
    return this.planos().filter(plano => {
      const matchNome = !termo || plano.nome.toLocaleLowerCase('pt-BR').includes(termo);
      const matchCodigo = !codigo || plano.codigo_registro_ans.includes(codigo);
      return matchNome && matchCodigo;
    });
  });

  // Métricas
  protected readonly totalPlanos = computed(() => this.planosFiltrados().length.toString());
  protected readonly planoMaisPopular = computed(() => {
    const distribuicao = this.beneficiariosPorPlano();
    let max = 0;
    let planoId = '';
    
    distribuicao.forEach((quantidade, id) => {
      if (quantidade > max) {
        max = quantidade;
        planoId = id;
      }
    });
    
    return this.planos().find(p => p.id === planoId)?.nome || '—';
  });

  protected readonly totalBeneficiarios = computed(() => {
    return Array.from(this.beneficiariosPorPlano().values()).reduce((soma, quantidade) => soma + quantidade, 0).toString();
  });

  // Distribuição para gráficos
  protected readonly distribuicaoPorPlano = computed(() => {
    return criarDistribuicao(
      this.planosFiltrados().map((plano, indice) => ({
        rotulo: plano.nome,
        total: this.beneficiariosPorPlano().get(plano.id) || 0,
        cor: ['#0f766e', '#0ea5e9', '#8b5cf6', '#f97316', '#ec4899'][indice % 5]
      }))
    );
  });

  protected readonly rotulosPorPlano = computed(() => this.distribuicaoPorPlano().map(grupo => grupo.rotulo));
  protected readonly valoresPorPlano = computed(() => this.distribuicaoPorPlano().map(grupo => grupo.total));
  protected readonly coresPorPlano = computed(() => this.distribuicaoPorPlano().map(grupo => grupo.cor));

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
          this.carregarBeneficiariosPorPlano();
        },
        error: (resposta: HttpErrorResponse) => {
          this.erro.set(mensagemDeErro(resposta));
          this.carregando.set(false);
        }
      });
  }

  private carregarBeneficiariosPorPlano(): void {
    this.beneficiarioServico
      .contarPorPlanos(this.planos().map((plano) => plano.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (distribuicao) => {
          this.beneficiariosPorPlano.set(distribuicao);
          this.carregando.set(false);
        },
        error: () => {
          this.beneficiariosPorPlano.set(new Map());
          this.carregando.set(false);
        }
      });
  }

  protected mudarVisualizacao(valor: Visualizacao): void {
    this.visualizacao.set(valor);
  }

  protected atualizarBusca(evento: Event): void {
    this.termoBusca.set((evento.target as HTMLInputElement).value);
  }

  protected atualizarFiltroCodigo(evento: Event): void {
    this.filtroCodigoAns.set((evento.target as HTMLInputElement).value);
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
