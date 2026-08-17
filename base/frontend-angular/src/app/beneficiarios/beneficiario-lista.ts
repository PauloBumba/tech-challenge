import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BadgeStatus } from '../compartilhado/badge-status';
import { GraficoRosca } from '../compartilhado/grafico-rosca';
import { IndicadorCarregamento } from '../compartilhado/indicador-carregamento';
import { SeletorVisualizacao, Visualizacao } from '../compartilhado/seletor-visualizacao';
import { mensagemDeErro } from '../nucleo/api';
import { NotificacaoServico } from '../nucleo/notificacao-servico';
import { Plano } from '../planos/plano';
import { PlanoServico } from '../planos/plano-servico';
import { Beneficiario, StatusBeneficiario } from './beneficiario';
import { BeneficiarioFormulario } from './beneficiario-formulario';
import { BeneficiarioServico } from './beneficiario-servico';
import { formatarCpf } from './cpf';

/**
 * Listagem de beneficiários: tabela com nome do plano resolvido via `GET /planos`
 * (nunca o plano_id cru), filtros combináveis e paginação (SPEC 9.3). O formulário
 * de cadastro/edição vive aqui dentro, e a exclusão só some da lista depois da
 * resposta de sucesso do DELETE (SPEC 9.5).
 */
@Component({
  selector: 'app-beneficiario-lista',
  imports: [BadgeStatus, BeneficiarioFormulario, GraficoRosca, IndicadorCarregamento, SeletorVisualizacao],
  templateUrl: './beneficiario-lista.html',
  styleUrl: './beneficiario-lista.css'
})
export class BeneficiarioLista {
  private readonly servico = inject(BeneficiarioServico);
  private readonly planoServico = inject(PlanoServico);
  private readonly notificacaoServico = inject(NotificacaoServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly beneficiarios = signal<Beneficiario[]>([]);
  protected readonly planos = signal<Plano[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly pagina = signal(1);
  protected readonly tamanho = signal(20);
  protected readonly total = signal(0);

  protected readonly filtroStatus = signal<StatusBeneficiario | null>(null);
  protected readonly filtroPlanoId = signal<string | null>(null);
  protected readonly termoBusca = signal('');
  protected readonly visualizacao = signal<Visualizacao>('tabela');
  protected readonly modalNovoAberto = signal(false);
  protected readonly modalEdicaoAberto = signal(false);
  protected readonly beneficiarioParaEditar = signal<Beneficiario | null>(null);
  protected readonly beneficiarioParaExcluir = signal<Beneficiario | null>(null);
  protected readonly arrastado = signal<Beneficiario | null>(null);
  protected readonly beneficiariosFiltrados = computed(() => {
    const termo = this.termoBusca().trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.beneficiarios();
    const somenteDigitos = termo.replace(/\D/g, '');
    return this.beneficiarios().filter(beneficiario =>
      beneficiario.nome_completo.toLocaleLowerCase('pt-BR').includes(termo) ||
      (somenteDigitos.length > 0 && beneficiario.cpf.replace(/\D/g, '').includes(somenteDigitos)));
  });
  protected readonly distribuicaoPorStatus = computed(() => this.criarDistribuicao(
    ['ATIVO', 'INATIVO'].map((rotulo, indice) => ({ rotulo, total: this.beneficiariosFiltrados().filter(b => b.status === rotulo).length, cor: indice === 0 ? '#14b8a6' : '#f59e0b' }))));
  protected readonly distribuicaoPorPlano = computed(() => this.criarDistribuicao(
    this.planos().map((plano, indice) => ({ rotulo: plano.nome, total: this.beneficiariosFiltrados().filter(b => b.plano_id === plano.id).length, cor: ['#0f766e', '#0ea5e9', '#8b5cf6', '#f97316', '#ec4899'][indice % 5] }))));
  protected readonly rotulosPorStatus = computed(() => this.distribuicaoPorStatus().map(grupo => grupo.rotulo));
  protected readonly valoresPorStatus = computed(() => this.distribuicaoPorStatus().map(grupo => grupo.total));
  protected readonly coresPorStatus = computed(() => this.distribuicaoPorStatus().map(grupo => grupo.cor));
  protected readonly rotulosPorPlano = computed(() => this.distribuicaoPorPlano().map(grupo => grupo.rotulo));
  protected readonly valoresPorPlano = computed(() => this.distribuicaoPorPlano().map(grupo => grupo.total));
  protected readonly coresPorPlano = computed(() => this.distribuicaoPorPlano().map(grupo => grupo.cor));

  protected mudarVisualizacao(valor: Visualizacao): void { this.visualizacao.set(valor); }

  constructor() {
    this.carregarPlanos();
    this.carregar();
  }

  private carregarPlanos(): void {
    this.planoServico.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (planos) => this.planos.set(planos)
    });
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.servico
      .listar({
        pagina: this.pagina(),
        tamanho: this.tamanho(),
        status: this.filtroStatus(),
        planoId: this.filtroPlanoId()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.beneficiarios.set(resultado.dados);
          this.total.set(resultado.total);
          this.carregando.set(false);
        },
        error: (resposta: HttpErrorResponse) => {
          this.erro.set(mensagemDeErro(resposta));
          this.carregando.set(false);
        }
      });
  }

  /** Aplicar um filtro volta para a página 1 — filtrar nunca esvazia a tela. */
  protected filtrar(): void {
    this.pagina.set(1);
    this.carregar();
  }

  protected mudarPagina(nova: number): void {
    if (nova < 1 || nova > this.totalDePaginas()) {
      return;
    }

    this.pagina.set(nova);
    this.carregar();
  }

  protected totalDePaginas(): number {
    const tamanho = this.tamanho();
    return tamanho > 0 ? Math.ceil(this.total() / tamanho) : 1;
  }

  protected nomeDoPlano(planoId: string): string {
    return this.planos().find((plano) => plano.id === planoId)?.nome ?? '—';
  }

  protected formatarCpf(cpf: string): string {
    return formatarCpf(cpf);
  }

  protected atualizarBusca(evento: Event): void {
    this.termoBusca.set((evento.target as HTMLInputElement).value);
  }

  protected filtrarPorSituacao(status: string): void {
    this.filtroStatus.set(status as StatusBeneficiario);
    this.filtrar();
  }

  protected filtrarPorPlano(nome: string): void {
    this.filtroPlanoId.set(this.planos().find(plano => plano.nome === nome)?.id ?? null);
    this.filtrar();
  }

  private criarDistribuicao(grupos: { rotulo: string; total: number; cor: string }[]) {
    const total = grupos.reduce((soma, grupo) => soma + grupo.total, 0);
    let inicio = 0;
    return grupos.filter(grupo => grupo.total > 0).map(grupo => {
      const percentual = total ? (grupo.total / total) * 100 : 0;
      const resultado = { ...grupo, percentual, inicio };
      inicio += percentual;
      return resultado;
    });
  }

  // A exclusão só remove a linha depois da resposta de sucesso do DELETE. No
  // `error` a linha continua na tela e a mensagem da API aparece para o usuário.
  protected solicitarEdicao(beneficiario: Beneficiario): void {
    this.beneficiarioParaEditar.set(beneficiario);
    this.modalEdicaoAberto.set(true);
  }

  protected solicitarExclusao(beneficiario: Beneficiario): void {
    this.beneficiarioParaExcluir.set(beneficiario);
  }

  protected confirmarExclusao(): void {
    const beneficiario = this.beneficiarioParaExcluir();
    if (!beneficiario) return;
    this.servico.excluir(beneficiario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notificacaoServico.sucesso('Beneficiário excluído com sucesso!');
        this.beneficiarioParaExcluir.set(null);
        this.carregar();
      },
      error: (resposta: HttpErrorResponse) => {
        this.erro.set(mensagemDeErro(resposta));
        this.beneficiarioParaExcluir.set(null);
      }
    });
  }

  protected moverParaStatus(beneficiario: Beneficiario, status: StatusBeneficiario): void {
    this.arrastado.set(null);
    if (beneficiario.status === status) return;
    this.servico.atualizar(beneficiario.id, {
      nome_completo: beneficiario.nome_completo,
      data_nascimento: beneficiario.data_nascimento,
      plano_id: beneficiario.plano_id,
      status
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.carregar(),
      error: (resposta: HttpErrorResponse) => this.erro.set(mensagemDeErro(resposta))
    });
  }
}
