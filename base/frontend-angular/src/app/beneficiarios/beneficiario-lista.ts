import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { mensagemDeErro } from '../nucleo/api';
import { Plano } from '../planos/plano';
import { PlanoServico } from '../planos/plano-servico';
import { Beneficiario, StatusBeneficiario } from './beneficiario';
import { BeneficiarioServico } from './beneficiario-servico';
import { BeneficiarioFormulario } from './beneficiario-formulario';
import { formatarCpf } from './cpf';

/**
 * Listagem de beneficiários: tabela com nome do plano resolvido via `GET /planos`
 * (nunca o plano_id cru), filtros combináveis e paginação (SPEC 9.3). O formulário
 * de cadastro/edição vive aqui dentro, e a exclusão só some da lista depois da
 * resposta de sucesso do DELETE (SPEC 9.5).
 */
@Component({
  selector: 'app-beneficiario-lista',
  imports: [BeneficiarioFormulario],
  templateUrl: './beneficiario-lista.html',
  styleUrl: './beneficiario-lista.css'
})
export class BeneficiarioLista {
  private readonly servico = inject(BeneficiarioServico);
  private readonly planoServico = inject(PlanoServico);
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

  protected readonly formularioAberto = signal(false);
  protected readonly beneficiarioEmEdicao = signal<Beneficiario | null>(null);

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

  protected abrirCadastro(): void {
    this.beneficiarioEmEdicao.set(null);
    this.formularioAberto.set(true);
  }

  protected abrirEdicao(beneficiario: Beneficiario): void {
    this.beneficiarioEmEdicao.set(beneficiario);
    this.formularioAberto.set(true);
  }

  protected fecharFormulario(): void {
    this.formularioAberto.set(false);
    this.beneficiarioEmEdicao.set(null);
  }

  protected aoSalvar(): void {
    this.fecharFormulario();
    this.carregar();
  }

  // A exclusão só remove a linha depois da resposta de sucesso do DELETE. No
  // `error` a linha continua na tela e a mensagem da API aparece para o usuário.
  protected excluir(beneficiario: Beneficiario): void {
    if (!window.confirm(`Excluir o beneficiário ${beneficiario.nome_completo}?`)) {
      return;
    }

    this.servico.excluir(beneficiario.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.carregar(),
      error: (resposta: HttpErrorResponse) => {
        this.erro.set(mensagemDeErro(resposta));
      }
    });
  }
}