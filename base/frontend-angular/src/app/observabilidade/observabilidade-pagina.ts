import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { IndicadorCarregamento } from '../compartilhado/indicador-carregamento';
import { IndicadorStatus } from '../compartilhado/indicador-status';
import { mensagemDeErro } from '../nucleo/api';
import { HealthServico } from '../nucleo/health-servico';
import { LogsServico, RegistroDeRequisicao } from './logs-servico';
import { lerMetricasDeRota, MetricaDeRota, MetricasServico } from './metricas-servico';

export type FiltroDeLog = 'todos' | 'sucesso' | 'erro';

@Component({
  selector: 'app-observabilidade-pagina',
  imports: [DatePipe, DecimalPipe, IndicadorCarregamento, IndicadorStatus],
  templateUrl: './observabilidade-pagina.html',
  styleUrl: './observabilidade-pagina.css'
})
export class ObservabilidadePagina implements OnInit {
  private readonly servico = inject(MetricasServico);
  private readonly logsServico = inject(LogsServico);
  private readonly health = inject(HealthServico);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly metricas = signal<MetricaDeRota[]>([]);
  protected readonly logs = signal<RegistroDeRequisicao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly atualizadoEm = signal<Date | null>(null);
  protected readonly apiOnline = signal(false);
  protected readonly bancoOnline = signal(false);

  protected readonly filtroDeLog = signal<FiltroDeLog>('todos');
  protected readonly termoDeRota = signal('');
  protected readonly logsFiltrados = computed(() => {
    const termo = this.termoDeRota().trim().toLocaleLowerCase('pt-BR');
    return this.logs().filter((log) => {
      const ehSucesso = log.status < 400;
      if (this.filtroDeLog() === 'sucesso' && !ehSucesso) return false;
      if (this.filtroDeLog() === 'erro' && ehSucesso) return false;
      if (termo && !log.rota.toLocaleLowerCase('pt-BR').includes(termo)) return false;
      return true;
    });
  });

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
    this.logsServico.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (logs) => this.logs.set(logs),
      error: () => this.logs.set([])
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

  protected mudarFiltroDeLog(filtro: FiltroDeLog): void {
    this.filtroDeLog.set(filtro);
  }

  protected atualizarTermoDeRota(evento: Event): void {
    this.termoDeRota.set((evento.target as HTMLInputElement).value);
  }

  protected limparLogs(): void {
    this.logsServico.limpar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.logs.set([]),
      error: () => this.carregar()
    });
  }

  protected classeDeStatus(status: number): string {
    if (status >= 500) return 'status-5xx';
    if (status >= 400) return 'status-4xx';
    if (status >= 300) return 'status-3xx';
    return 'status-2xx';
  }
}
