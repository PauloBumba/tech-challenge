import { Component, Input } from '@angular/core';

/** Card semântico reutilizável para dados de qualquer página índice. */
@Component({
  selector: 'app-card-metrica',
  template: `
    <article class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p class="flex items-center justify-between gap-2 text-sm font-medium text-gray-500">
        <span class="flex items-center gap-2">
          @if (icone) { <span class="grid size-8 shrink-0 place-items-center rounded-lg" [class.bg-emerald-50]="iconeCor === 'verde'" [class.text-emerald-600]="iconeCor === 'verde'" [class.bg-amber-50]="iconeCor === 'ambar'" [class.text-amber-600]="iconeCor === 'ambar'" [class.bg-rose-50]="iconeCor === 'vermelho'" [class.text-rose-600]="iconeCor === 'vermelho'" [class.bg-gray-100]="iconeCor === 'cinza'" [class.text-gray-500]="iconeCor === 'cinza'" [innerHTML]="icone"></span> }
          {{ titulo }}
        </span>
      </p>
      <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900">{{ valor }}</p>
      @if (descricao) { <p class="mt-2 text-xs text-gray-500">{{ descricao }}</p> }
    </article>
  `
})
export class CardMetrica {
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) valor = '—';
  @Input() descricao = '';
  @Input() icone = '';
  @Input() iconeCor: 'verde' | 'ambar' | 'vermelho' | 'cinza' = 'cinza';
}
