import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Diálogo de confirmação reutilizável para exclusões. Destaca o nome do
 * registro e só emite `confirmado` quando o usuário confirma — a operação em
 * si fica a cargo do componente pai, que remove o diálogo ao concluir.
 */
@Component({
  selector: 'app-dialogo-de-confirmacao',
  template: `
    <div class="sobreposicao" role="presentation">
      <section
        class="dialogo-confirmacao"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-labelledby]="idTitulo"
      >
        <div class="icone-alerta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01" /></svg>
        </div>
        <div>
          <h3 [id]="idTitulo">{{ titulo }}</h3>
          <p>Você está prestes a excluir <strong>{{ nome }}</strong>.{{ descricao }}</p>
        </div>
        <footer>
          <button type="button" class="botao" (click)="cancelado.emit()">Cancelar</button>
          <button type="button" class="botao perigo com-icone" (click)="confirmado.emit()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" /></svg>
            {{ rotuloConfirmar }}
          </button>
        </footer>
      </section>
    </div>
  `
})
export class DialogoDeConfirmacao {
  private static proximoId = 0;

  protected readonly idTitulo = `titulo-exclusao-${DialogoDeConfirmacao.proximoId++}`;

  @Input({ required: true }) titulo = '';
  @Input({ required: true }) nome = '';
  @Input({ required: true }) descricao = '';
  @Input() rotuloConfirmar = 'Excluir';
  @Output() confirmado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();
}
