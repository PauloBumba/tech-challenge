import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../nucleo/api';

export interface MetricaDeRota {
  metodo: string;
  rota: string;
  status: number;
  requisicoes: number;
}

@Injectable({ providedIn: 'root' })
export class MetricasServico {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE);

  listar(): Observable<string> {
    return this.http.get(`${this.base}/metrics`, { responseType: 'text' });
  }
}

/** Converte apenas a série de contagem exposta pela API em dados próprios da tela. */
export function lerMetricasDeRota(prometheus: string): MetricaDeRota[] {
  const linhas = prometheus.split('\n');
  const metricas: MetricaDeRota[] = [];
  const padrao = /^http_requisicoes_total\{metodo="([^"]+)",rota="([^"]+)",status="(\d+)"\}\s+(\d+)$/;

  for (const linha of linhas) {
    const resultado = linha.match(padrao);
    if (!resultado) continue;
    metricas.push({
      metodo: resultado[1],
      rota: resultado[2],
      status: Number(resultado[3]),
      requisicoes: Number(resultado[4])
    });
  }

  return metricas.sort((a, b) => b.requisicoes - a.requisicoes || a.rota.localeCompare(b.rota));
}
