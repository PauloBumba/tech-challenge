import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../nucleo/api';

export interface RegistroDeRequisicao {
  momento: string;
  metodo: string;
  rota: string;
  status: number;
  duracao_milissegundos: number;
}

@Injectable({ providedIn: 'root' })
export class LogsServico {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  /** Últimos logs, da requisição mais recente para a mais antiga (limite 50). */
  listar(): Observable<RegistroDeRequisicao[]> {
    return this.http.get<RegistroDeRequisicao[]>(`${this.base}/logs`, {
      params: { limite: '50' }
    });
  }

  /** Esvazia o buffer de logs da API, para a tela começar a rastrear do zero. */
  limpar(): Observable<void> {
    return this.http.delete<void>(`${this.base}/logs`);
  }
}