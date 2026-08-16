import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../nucleo/api';

/** Resposta de `GET /health` da API: 200 com banco ok, 503 se o banco cair. */
export interface EstadoDaApi {
  status: string;
  banco: string;
}

/**
 * Consulta o health check da API (`GET /health`). Usado pelo indicador no topo
 * da tela para o usuário saber na hora se a API está no ar — sem isso, uma API
 * fora do ar virava tabela vazia ou mensagem de erro só depois de carregar.
 */
@Injectable({ providedIn: 'root' })
export class HealthServico {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  obter(): Observable<EstadoDaApi> {
    return this.http.get<EstadoDaApi>(`${this.base}/health`);
  }
}