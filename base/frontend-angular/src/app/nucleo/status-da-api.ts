import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HealthServico } from './health-servico';

/**
 * Indicador de saúde no topo da tela. Consulta `GET /health` na carga e em
 * intervalos; mostra o estado da API e do banco de dados com ícones próprios.
 * Cobre erro de rede/CORS (status 0), que o `mensagemDeErro` também sinaliza.
 */
@Component({
  selector: 'app-status-da-api',
  template: `
    <p class="status-da-api" [class.ok]="apiOk()" [class.falha]="!apiOk()" [class.checando]="checando()" role="status">
      <span class="servico">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h2M11 16.5h2"/></svg>
        <span>@if (checando()) { API... } @else { API {{ apiOk() ? 'online' : 'offline' }} }</span>
      </span>
      <span class="divisoria" aria-hidden="true"></span>
      <span class="servico" [class.falha]="apiOk() && !bancoOk()">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>
        <span>@if (checando()) { Banco... } @else { Banco {{ bancoOk() ? 'online' : 'offline' }} }</span>
      </span>
    </p>
  `,
  styles: `
    .status-da-api {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 999px;
    }

    .status-da-api.ok { background: #ecfdf3; color: #027a48; }
    .status-da-api.falha { background: #fef3f2; color: #b42318; }
    .status-da-api.checando { background: #f2f4f7; color: #667085; }

    .servico { display: inline-flex; align-items: center; gap: 0.35rem; }
    .divisoria { width: 1px; height: 1rem; background: currentColor; opacity: 0.3; }
    .servico.falha { color: #b42318; }
  `
})
export class StatusDaApi implements OnInit {
  private readonly servico = inject(HealthServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly apiOk = signal(false);
  protected readonly bancoOk = signal(false);
  protected readonly checando = signal(true);

  ngOnInit(): void {
    this.checar();

    // A cada 30s revalida — se a API/banco cair ou voltar, o indicador acompanha.
    const intervalo = setInterval(() => this.checar(), 30_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalo));
  }

  private checar(): void {
    this.servico.obter().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (estado) => {
        this.apiOk.set(estado.status === 'ok');
        this.bancoOk.set(estado.banco === 'ok');
        this.checando.set(false);
      },
      error: () => {
        // Qualquer falha (rede, CORS, API fora) marca ambos como offline.
        this.apiOk.set(false);
        this.bancoOk.set(false);
        this.checando.set(false);
      }
    });
  }
}