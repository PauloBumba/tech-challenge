import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { API_BASE } from '../nucleo/api';
import { Beneficiario, PaginaDeBeneficiarios, StatusBeneficiario } from './beneficiario';

export interface BeneficiarioFiltro {
  pagina: number;
  tamanho: number;
  status: StatusBeneficiario | null;
  planoId: string | null;
}

export interface BeneficiarioDados {
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  plano_id: string;
}

export interface BeneficiarioDadosEdicao {
  nome_completo: string;
  data_nascimento: string;
  plano_id: string;
  status: StatusBeneficiario;
}

/**
 * Todo acesso à API de beneficiários passa por um serviço. Componente não chama
 * HttpClient direto — mesmo padrão do PlanoServico.
 */
@Injectable({ providedIn: 'root' })
export class BeneficiarioServico {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  listar(filtro: BeneficiarioFiltro): Observable<PaginaDeBeneficiarios> {
    let parametros = new HttpParams()
      .set('pagina', String(filtro.pagina))
      .set('tamanho', String(filtro.tamanho));

    if (filtro.status) {
      parametros = parametros.set('status', filtro.status);
    }

    if (filtro.planoId) {
      parametros = parametros.set('plano_id', filtro.planoId);
    }

    return this.http.get<PaginaDeBeneficiarios>(`${this.base}/beneficiarios`, {
      params: parametros
    });
  }

  /**
   * Conta beneficiários de cada plano pelo `total` do envelope, filtrando por
   * `plano_id`. A API limita `tamanho` a 100, então não dá para puxar a lista
   * inteira e agrupar no cliente — o total já vem agregado no filtro.
   */
  contarPorPlanos(planoIds: string[]): Observable<Map<string, number>> {
    if (planoIds.length === 0) {
      return of(new Map());
    }

    return forkJoin(
      planoIds.map((planoId) =>
        this.listar({ pagina: 1, tamanho: 1, status: null, planoId }).pipe(
          map((pagina) => [planoId, pagina.total] as const),
          catchError(() => of([planoId, 0] as const))
        )
      )
    ).pipe(map((pares) => new Map(pares)));
  }

  obter(id: string): Observable<Beneficiario> {
    return this.http.get<Beneficiario>(`${this.base}/beneficiarios/${id}`);
  }

  criar(dados: BeneficiarioDados): Observable<Beneficiario> {
    return this.http.post<Beneficiario>(`${this.base}/beneficiarios`, dados);
  }

  atualizar(id: string, dados: BeneficiarioDadosEdicao): Observable<Beneficiario> {
    return this.http.put<Beneficiario>(`${this.base}/beneficiarios/${id}`, dados);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/beneficiarios/${id}`);
  }
}
