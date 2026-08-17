import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../nucleo/api';
import { Plano } from './plano';

export interface PlanoRequest {
  nome: string;
  codigo_registro_ans: string;
}

/**
 * Todo acesso à API passa por um serviço. Componente não chama HttpClient direto.
 */
@Injectable({ providedIn: 'root' })
export class PlanoServico {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  listar(): Observable<Plano[]> {
    return this.http.get<Plano[]>(`${this.base}/planos`);
  }

  criar(dados: PlanoRequest): Observable<Plano> {
    return this.http.post<Plano>(`${this.base}/planos`, dados);
  }

  atualizar(id: string, dados: PlanoRequest): Observable<Plano> {
    return this.http.put<Plano>(`${this.base}/planos/${id}`, dados);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/planos/${id}`);
  }
}
