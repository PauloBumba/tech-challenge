import { Component, Input } from '@angular/core';

/** Representação visual consistente da situação de um beneficiário. */
@Component({
  selector: 'app-badge-status',
  template: '<span class="status" [class]="\'status \' + status">{{ status }}</span>',
  styles: `
    .status { display: inline-block; padding: .15rem .55rem; border-radius: 999px; font-size: .8rem; font-weight: 600; }
    .ATIVO { background: #ecfdf3; color: #027a48; }
    .INATIVO { background: #f2f4f7; color: #475467; }
  `
})
export class BadgeStatus {
  @Input({ required: true }) status!: 'ATIVO' | 'INATIVO';
}
