import { Component, Input } from '@angular/core';

/** Mensagem de carregamento reutilizável e anunciada por leitores de tela. */
@Component({
  selector: 'app-indicador-carregamento',
  template: '<p class="indicador" role="status">{{ mensagem }}</p>',
  styles: `
    .indicador { margin: 0; color: #667085; }
  `
})
export class IndicadorCarregamento {
  @Input() mensagem = 'Carregando...';
}
