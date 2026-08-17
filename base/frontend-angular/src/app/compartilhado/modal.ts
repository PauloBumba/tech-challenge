import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Janela modal reutilizável: sobreposição que fecha ao clicar fora e painel
 * central com o conteúdo projetado. Acessível com `role="dialog"` e
 * `aria-modal`; o rótulo da janela é obrigatório.
 */
@Component({
  selector: 'app-modal',
  template: `
    <div class="sobreposicao" role="presentation" (click)="fechado.emit()">
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="rotulo"
        (click)="$event.stopPropagation()"
      >
        <ng-content />
      </section>
    </div>
  `
})
export class Modal {
  @Input({ required: true }) rotulo = '';
  @Output() fechado = new EventEmitter<void>();
}
