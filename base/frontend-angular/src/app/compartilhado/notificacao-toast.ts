import { Component, inject } from '@angular/core';
import { NotificacaoServico, TipoNotificacao } from '../nucleo/notificacao-servico';

@Component({
  selector: 'app-notificacao-toast',
  template: `
    <div class="container-notificacoes">
      @for (notificacao of servico.notificacoesVisiveis(); track notificacao.id) {
        <div 
          class="notificacao" 
          [class.sucesso]="notificacao.tipo === 'sucesso'"
          [class.erro]="notificacao.tipo === 'erro'"
          [class.info]="notificacao.tipo === 'info'"
          role="alert"
        >
          <span class="icone">{{ getIcone(notificacao.tipo) }}</span>
          <span class="mensagem">{{ notificacao.mensagem }}</span>
          <button 
            type="button" 
            class="botao-fechar" 
            (click)="servico.remover(notificacao.id)"
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './notificacao-toast.css'
})
export class NotificacaoToast {
  protected readonly servico = inject(NotificacaoServico);

  protected getIcone(tipo: TipoNotificacao): string {
    switch (tipo) {
      case 'sucesso': return '✓';
      case 'erro': return '✕';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }
}
