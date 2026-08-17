import { Component, Input } from '@angular/core';

/** Card semântico reutilizável para dados de qualquer página índice. */
@Component({
  selector: 'app-card-metrica',
  template: `
    <article class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p class="text-sm font-medium text-gray-500">{{ titulo }}</p>
      <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900">{{ valor }}</p>
      @if (descricao) { <p class="mt-2 text-xs text-gray-500">{{ descricao }}</p> }
    </article>
  `
})
export class CardMetrica {
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) valor = '—';
  @Input() descricao = '';
}
