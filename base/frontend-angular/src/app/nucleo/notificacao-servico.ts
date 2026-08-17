import { Injectable, signal, computed, effect, inject, DestroyRef } from '@angular/core';

export type TipoNotificacao = 'sucesso' | 'erro' | 'info';

export interface Notificacao {
  id: string;
  mensagem: string;
  tipo: TipoNotificacao;
}

@Injectable({ providedIn: 'root' })
export class NotificacaoServico {
  private readonly notificacoes = signal<Notificacao[]>([]);
  private readonly destroyRef = inject(DestroyRef);

  readonly notificacoesVisiveis = computed(() => this.notificacoes());

  constructor() {
    // Efeito para remover notificações automaticamente após 5 segundos
    effect(() => {
      const notificacoes = this.notificacoes();
      for (const notificacao of notificacoes) {
        const timeout = setTimeout(() => {
          this.remover(notificacao.id);
        }, 5000);
        
        // Limpar timeout quando o componente for destruído
        this.destroyRef.onDestroy(() => clearTimeout(timeout));
      }
    });
  }

  mostrar(mensagem: string, tipo: TipoNotificacao = 'info'): void {
    const id = crypto.randomUUID();
    this.notificacoes.update(atual => [...atual, { id, mensagem, tipo }]);
  }

  sucesso(mensagem: string): void {
    this.mostrar(mensagem, 'sucesso');
  }

  erro(mensagem: string): void {
    this.mostrar(mensagem, 'erro');
  }

  info(mensagem: string): void {
    this.mostrar(mensagem, 'info');
  }

  remover(id: string): void {
    this.notificacoes.update(atual => atual.filter(n => n.id !== id));
  }

  limpar(): void {
    this.notificacoes.set([]);
  }
}
