import { Component, Input } from '@angular/core';

export type TipoDeServico = 'api' | 'banco' | 'frontend';

/** Ícone SVG de cada serviço monitorado, em traço consistente com o restante da interface. */
const ICONES: Record<TipoDeServico, string> = {
  api: `<svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h2M11 16.5h2"/></svg>`,
  banco: `<svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>`,
  frontend: `<svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M6 8h.01M9 8h.01M12 8h.01M6 12h12"/><path d="M2 20h20"/></svg>`
};

/**
 * Card de saúde de um serviço (API, banco, frontend) com ícone e estado visual:
 * verde pulsante quando online, cinza quando verificando, vermelho quando fora.
 */
@Component({
  selector: 'app-indicador-status',
  template: `
    <article
      class="relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 shadow-sm transition"
      [class.border-emerald-200]="online"
      [class.bg-emerald-50]="online"
      [class.border-rose-200]="oficialmenteOffline"
      [class.bg-rose-50]="oficialmenteOffline"
      [class.border-gray-200]="verificando"
      [class.bg-white]="verificando"
      role="status"
    >
      <span
        class="absolute inset-y-0 left-0 w-1"
        [class.bg-emerald-500]="online"
        [class.bg-rose-500]="oficialmenteOffline"
        [class.bg-gray-300]="verificando"
        aria-hidden="true"
      ></span>
      <span
        class="grid size-12 shrink-0 place-items-center rounded-xl"
        [class.bg-emerald-100]="online"
        [class.text-emerald-700]="online"
        [class.bg-rose-100]="oficialmenteOffline"
        [class.text-rose-700]="oficialmenteOffline"
        [class.bg-gray-100]="verificando"
        [class.text-gray-500]="verificando"
        [innerHTML]="icone"
      ></span>
      <span class="min-w-0 flex-1">
        <span class="block text-sm font-medium text-gray-500">{{ nome }}</span>
        <span class="mt-0.5 flex items-center gap-2">
          <span class="relative flex size-2.5" aria-hidden="true">
            @if (online) {
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            }
            <span class="relative inline-flex size-2.5 rounded-full" [class.bg-emerald-500]="online" [class.bg-rose-500]="oficialmenteOffline" [class.bg-gray-300]="verificando"></span>
          </span>
          <strong class="text-sm font-semibold text-gray-900">{{ rotulo }}</strong>
        </span>
      </span>
    </article>
  `
})
export class IndicadorStatus {
  @Input({ required: true }) nome = '';
  @Input() online = false;
  @Input() verificando = false;
  @Input() tipo: TipoDeServico = 'api';

  protected get icone(): string {
    return ICONES[this.tipo];
  }

  protected get rotulo(): string {
    if (this.verificando) return 'Verificando...';
    return this.online ? 'Online' : 'Indisponível';
  }

  protected get oficialmenteOffline(): boolean {
    return !this.verificando && !this.online;
  }
}