import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { StatusDaApi } from './nucleo/status-da-api';
import { NotificacaoToast } from './compartilhado/notificacao-toast';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, StatusDaApi, NotificacaoToast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly menuAberto = signal(false);

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }
}
