import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { NotificacaoToast } from './compartilhado/notificacao-toast';
import { StatusDaApi } from './compartilhado/status-da-api';

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
