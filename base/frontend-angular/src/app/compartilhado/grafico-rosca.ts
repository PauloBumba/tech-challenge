import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { Chart, DoughnutController, ArcElement, Legend, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Legend, Tooltip);

/** Gráfico de rosca reutilizável: usa dados recebidos da API e devolve o rótulo clicado. */
@Component({
  selector: 'app-grafico-rosca',
  template: `<section class="rounded-xl border border-slate-100 bg-white p-4"><div class="mb-3"><h4 class="font-semibold text-slate-900">{{ titulo }}</h4><p class="mt-1 text-xs text-slate-500">Clique em uma fatia para filtrar a lista.</p></div><div class="relative mx-auto h-48 max-w-[17rem]"><canvas #canvas [attr.aria-label]="titulo" role="img"></canvas><strong class="pointer-events-none absolute inset-0 grid place-items-center text-2xl text-slate-800">{{ total }}</strong></div></section>`
})
export class GraficoRosca implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) titulo = '';
  @Input() rotulos: string[] = [];
  @Input() valores: number[] = [];
  @Input() cores: string[] = [];
  @Output() itemSelecionado = new EventEmitter<string>();
  @ViewChild('canvas') private canvas?: ElementRef<HTMLCanvasElement>;
  private grafico?: Chart<'doughnut', number[], string>;

  get total(): number { return this.valores.reduce((soma, valor) => soma + valor, 0); }

  ngAfterViewInit(): void { this.renderizar(); }
  ngOnChanges(): void { this.renderizar(); }
  ngOnDestroy(): void { this.grafico?.destroy(); }

  private renderizar(): void {
    if (!this.canvas) return;
    this.grafico?.destroy();
    this.grafico = new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: { labels: this.rotulos, datasets: [{ data: this.valores, backgroundColor: this.cores, borderColor: '#ffffff', borderWidth: 4, hoverOffset: 8 }] },
      options: {
        cutout: '68%',
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'circle', padding: 14, font: { family: 'Inter, system-ui', size: 12 } },
            // A legenda é uma segunda forma explícita de selecionar cada categoria.
            onClick: (_, item) => this.itemSelecionado.emit(item.text)
          },
          tooltip: { padding: 10, callbacks: { label: contexto => ` ${contexto.label}: ${contexto.parsed}` } }
        },
        onHover: (evento, elementos) => {
          const alvo = evento.native?.target as HTMLCanvasElement | null;
          if (alvo) alvo.style.cursor = elementos.length ? 'pointer' : 'default';
        },
        onClick: (_, elementos) => { const indice = elementos[0]?.index; if (indice !== undefined) this.itemSelecionado.emit(this.rotulos[indice]); }
      }
    });
  }
}
