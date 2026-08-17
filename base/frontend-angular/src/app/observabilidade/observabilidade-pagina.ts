import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IndicadorCarregamento } from '../compartilhado/indicador-carregamento';
import { mensagemDeErro } from '../nucleo/api';
import { HealthServico } from '../nucleo/health-servico';
import { lerMetricasDeRota, MetricaDeRota, MetricasServico } from './metricas-servico';

@Component({
  selector: 'app-observabilidade-pagina',
  imports: [DatePipe, IndicadorCarregamento],
  templateUrl: './observabilidade-pagina.html',
  styleUrl: './observabilidade-pagina.css'
})
export class ObservabilidadePagina implements OnInit {
  private readonly servico = inject(MetricasServico);
  private readonly health = inject(HealthServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly metricas = signal<MetricaDeRota[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly atualizadoEm = signal<Date | null>(null);
  protected readonly apiOnline = signal(false);
  protected readonly bancoOnline = signal(false);

  ngOnInit(): void {
    this.carregar();
    const intervalo = setInterval(() => this.carregar(false), 15_000);
    this.destroyRef.onDestroy(() => clearInterval(intervalo));
  }

  protected carregar(exibirCarregamento = true): void {
    if (exibirCarregamento) this.carregando.set(true);
    this.erro.set(null);
    this.servico.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (texto) => {
        this.metricas.set(lerMetricasDeRota(texto));
        this.atualizadoEm.set(new Date());
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.erro.set(mensagemDeErro(resposta));
        this.carregando.set(false);
      }
    });
    this.health.obter().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (estado) => { this.apiOnline.set(estado.status === 'ok'); this.bancoOnline.set(estado.banco === 'ok'); },
      error: () => { this.apiOnline.set(false); this.bancoOnline.set(false); }
    });
  }

  protected totalDeRequisicoes(): number {
    return this.metricas().reduce((total, metrica) => total + metrica.requisicoes, 0);
  }

  protected totalDeErros(): number {
    return this.metricas()
      .filter((metrica) => metrica.status >= 400)
      .reduce((total, metrica) => total + metrica.requisicoes, 0);
  }

  protected percentual(metrica: MetricaDeRota): number {
    const maior = this.metricas()[0]?.requisicoes ?? 1;
    return Math.max(4, Math.round((metrica.requisicoes / maior) * 100));
  }
}
