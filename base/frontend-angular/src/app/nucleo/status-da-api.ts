import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HealthServico } from './health-servico';

/**
 * Indicador de saúde da API no topo da tela. Consulta `GET /health` na carga e
 * em intervalos; mostra verde quando a API e o banco respondem, vermelho com
 * "API indisponível" quando falha. Cobre erro de rede/CORS (status 0), que o
 * `mensagemDeErro` da listagem também sinaliza — aqui fica visível de antemão.
 */
@Component({
  selector: 'app-status-da-api',
  template: `
    <p class="status-da-api" [class.ok]="ok()" [class.falha]="!ok()">
      <span class="bola" aria-hidden="true"></span>
      @if (checando()) {
        Verificando API...
      } @else if (ok()) {
        API online
      } @else {
        API indisponível
      }
    </p>
  `,
  styles: `
    .status-da-api {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
    }

    .status-da-api.ok {
      background: #ecfdf3;
      color: #027a48;
    }

    .status-da-api.falha {
      background: #fef3f2;
      color: #b42318;
    }

    .bola {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      background: currentColor;
    }
  `
})
export class StatusDaApi implements OnInit {
  private readonly servico = inject(HealthServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ok = signal(false);
  protected readonly checando = signal(true);

  ngOnInit(): void {
    this.checar();

    // A cada 30s revalida — se a API cair/voltar, o indicador acompanha.
    const intervalo = setInterval(() => this.checar(), 30_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalo));
  }

  private checar(): void {
    this.servico.obter().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.ok.set(true);
        this.checando.set(false);
      },
      error: () => {
        // Qualquer falha (503 de banco, rede, CORS) marca o front como offline.
        this.ok.set(false);
        this.checando.set(false);
      }
    });
  }
}