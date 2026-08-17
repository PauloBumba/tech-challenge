import { Component, EventEmitter, Input, Output } from '@angular/core';

export type Visualizacao = 'tabela' | 'grade' | 'kanban';

/** Alternância reutilizável entre tabela, cartões e kanban nas páginas índice. */
@Component({ selector: 'app-seletor-visualizacao', template: `<div class="flex rounded-lg border border-gray-200 bg-white p-1"><button type="button" class="rounded px-3 py-1.5 text-sm" [class.bg-admin-600]="valor === 'tabela'" [class.text-white]="valor === 'tabela'" (click)="alterar('tabela')">Tabela</button><button type="button" class="rounded px-3 py-1.5 text-sm" [class.bg-admin-600]="valor === 'grade'" [class.text-white]="valor === 'grade'" (click)="alterar('grade')">Grade</button><button type="button" class="rounded px-3 py-1.5 text-sm" [class.bg-admin-600]="valor === 'kanban'" [class.text-white]="valor === 'kanban'" (click)="alterar('kanban')">Kanban</button></div>` })
export class SeletorVisualizacao {
  @Input() valor: Visualizacao = 'tabela';
  @Output() valorChange = new EventEmitter<Visualizacao>();
  protected alterar(valor: Visualizacao): void { this.valorChange.emit(valor); }
}
