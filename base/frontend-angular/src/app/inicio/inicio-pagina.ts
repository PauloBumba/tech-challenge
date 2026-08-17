import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { BeneficiarioServico } from '../beneficiarios/beneficiario-servico';
import { CardMetrica } from '../compartilhado/card-metrica';
import { HealthServico } from '../nucleo/health-servico';
import { PlanoServico } from '../planos/plano-servico';
import { lerMetricasDeRota, MetricasServico } from '../observabilidade/metricas-servico';

/** Página inicial: resumo exclusivamente de consultas reais à aplicação. */
@Component({
  selector: 'app-inicio-pagina',
  imports: [CardMetrica, RouterLink],
  template: `
    <section class="space-y-6">
      <header class="relative overflow-hidden rounded-2xl bg-sidebar px-6 py-7 text-white shadow-sm sm:px-8">
        <div class="absolute -right-16 -top-24 size-64 rounded-full border-[28px] border-teal-400/10"></div><div class="absolute right-24 top-12 size-3 rounded-full bg-teal-300/70"></div>
        <div class="relative max-w-2xl"><p class="text-sm font-semibold text-teal-300">Visão geral</p><h2 class="mt-1 text-3xl font-bold tracking-tight">Bom ter você por aqui.</h2><p class="mt-3 text-sm leading-6 text-slate-300">Acompanhe cadastros, disponibilidade e o tráfego da aplicação em uma única visão. Todos os indicadores abaixo vêm da API em tempo real.</p></div>
      </header>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <app-card-metrica titulo="Beneficiários" [valor]="totalBeneficiarios()" descricao="Total retornado pela listagem" icone="<svg class=&quot;size-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.8&quot; aria-hidden=&quot;true&quot;><path d=&quot;M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75&quot;/></svg>" iconeCor="verde" />
        <app-card-metrica titulo="Planos ativos" [valor]="totalPlanos()" descricao="Planos disponíveis na API" icone="<svg class=&quot;size-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.8&quot; aria-hidden=&quot;true&quot;><path d=&quot;M4 19.5V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15.5M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5A2.5 2.5 0 0 1 6.5 17H20M8 6h8M8 10h8&quot;/></svg>" iconeCor="ambar" />
        <app-card-metrica titulo="Requisições observadas" [valor]="totalRequisicoes()" descricao="Contador atual da API" icone="<svg class=&quot;size-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.8&quot; aria-hidden=&quot;true&quot;><path d=&quot;M3 3v18h18M7 16v-5M12 16V7M17 16v-8&quot;/></svg>" iconeCor="cinza" />
        <app-card-metrica titulo="Banco de dados" [valor]="banco()" descricao="Resultado do health check" icone="<svg class=&quot;size-4&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.8&quot; aria-hidden=&quot;true&quot;><ellipse cx=&quot;12&quot; cy=&quot;5&quot; rx=&quot;8&quot; ry=&quot;3&quot;/><path d=&quot;M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5&quot;/><path d=&quot;M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3&quot;/></svg>" [iconeCor]="corDoBanco()" />
      </div>
      <div class="grid gap-6 xl:grid-cols-5">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3"><div class="flex items-start justify-between gap-3"><div><h3 class="font-semibold text-slate-900">Tráfego por rota</h3><p class="mt-1 text-sm text-slate-500">Requisições já registradas pela API.</p></div><a routerLink="/observabilidade" class="text-sm font-semibold text-admin-600 hover:text-admin-700">Ver detalhes →</a></div>
          @if (rotasMaisAcessadas().length) {<div class="mt-6 space-y-5">@for (metrica of rotasMaisAcessadas(); track metrica.metodo + metrica.rota + metrica.status) {<div><div class="mb-2 flex items-center justify-between gap-3 text-sm"><span class="truncate font-medium text-slate-700"><span class="mr-2 rounded bg-admin-50 px-1.5 py-0.5 text-xs font-semibold text-admin-700">{{ metrica.metodo }}</span>{{ metrica.rota }}</span><strong class="text-slate-900">{{ metrica.requisicoes }}</strong></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-gradient-to-r from-admin-600 to-teal-400 transition-all" [style.width.%]="percentualDaRota(metrica.requisicoes)"></div></div></div>}</div>} @else {<div class="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Ainda não há tráfego suficiente para desenhar o gráfico.</div>}
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"><h3 class="font-semibold text-slate-900">Qualidade das respostas</h3><p class="mt-1 text-sm text-slate-500">Distribuição por faixa de status.</p><div class="mt-7 grid gap-4">@for (grupo of statusDasRequisicoes(); track grupo.rotulo) {<div class="flex items-center gap-3"><span class="size-2.5 rounded-full" [class.bg-emerald-500]="grupo.rotulo === 'Sucesso'" [class.bg-amber-400]="grupo.rotulo === 'Cliente'" [class.bg-rose-500]="grupo.rotulo === 'Servidor'"></span><span class="flex-1 text-sm text-slate-600">{{ grupo.rotulo }}</span><strong class="text-sm text-slate-900">{{ grupo.total }}</strong></div>} @empty {<p class="py-9 text-center text-sm text-slate-500">Sem respostas registradas ainda.</p>}</div><div class="mt-7 h-3 overflow-hidden rounded-full bg-slate-100">@for (grupo of statusDasRequisicoes(); track grupo.rotulo) {<span class="inline-block h-full" [class.bg-emerald-500]="grupo.rotulo === 'Sucesso'" [class.bg-amber-400]="grupo.rotulo === 'Cliente'" [class.bg-rose-500]="grupo.rotulo === 'Servidor'" [style.width.%]="percentualDoTotal(grupo.total)"></span>}</div></section>
      </div>
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div class="flex items-center justify-between"><div><h3 class="font-semibold text-slate-900">Acessos rápidos</h3><p class="mt-1 text-sm text-slate-500">Atalhos para as principais tarefas.</p></div><span class="hidden rounded-full bg-admin-50 px-3 py-1 text-xs font-semibold text-admin-700 sm:block">Ambiente local</span></div><div class="mt-5 grid gap-4 md:grid-cols-3"><a class="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-admin-500 hover:shadow-md" routerLink="/beneficiarios"><strong class="text-slate-900">Beneficiários <span class="float-right text-admin-600">→</span></strong><p class="mt-1 text-sm text-slate-500">Tabela e operações cadastrais.</p></a><a class="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-admin-500 hover:shadow-md" routerLink="/planos"><strong class="text-slate-900">Planos <span class="float-right text-admin-600">→</span></strong><p class="mt-1 text-sm text-slate-500">Consulta dos planos disponíveis.</p></a><a class="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-admin-500 hover:shadow-md" routerLink="/observabilidade"><strong class="text-slate-900">Observabilidade <span class="float-right text-admin-600">→</span></strong><p class="mt-1 text-sm text-slate-500">Saúde e tráfego da aplicação.</p></a></div></section>
    </section>
  `
})
export class InicioPagina {
  private readonly destroyRef = inject(DestroyRef);
  private readonly beneficiarios = inject(BeneficiarioServico);
  private readonly planos = inject(PlanoServico);
  private readonly metricas = inject(MetricasServico);
  private readonly health = inject(HealthServico);
  protected readonly totalBeneficiarios = signal('—');
  protected readonly totalPlanos = signal('—');
  protected readonly totalRequisicoes = signal('—');
  protected readonly banco = signal('Indisponível');
  protected readonly apiOnline = signal(false);
  protected readonly corDoBanco = computed<'verde' | 'ambar' | 'vermelho' | 'cinza'>(() => {
    if (!this.apiOnline()) return 'vermelho';
    if (this.banco() === 'Online') return 'verde';
    return 'ambar';
  });
  protected readonly metricasDeRota = signal<ReturnType<typeof lerMetricasDeRota>>([]);
  protected readonly rotasMaisAcessadas = computed(() => this.metricasDeRota().slice(0, 5));
  protected readonly statusDasRequisicoes = computed(() => {
    const grupos = [{ rotulo: 'Sucesso', total: 0 }, { rotulo: 'Cliente', total: 0 }, { rotulo: 'Servidor', total: 0 }];
    for (const metrica of this.metricasDeRota()) {
      if (metrica.status < 400) grupos[0].total += metrica.requisicoes;
      else if (metrica.status < 500) grupos[1].total += metrica.requisicoes;
      else grupos[2].total += metrica.requisicoes;
    }
    return grupos.filter(grupo => grupo.total > 0);
  });
  constructor() {
    this.beneficiarios.listar({ pagina: 1, tamanho: 1, status: null, planoId: null }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => this.totalBeneficiarios.set(String(r.total)) });
    this.planos.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => this.totalPlanos.set(String(r.length)) });
    this.metricas.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => { const metricas = lerMetricasDeRota(r); this.metricasDeRota.set(metricas); this.totalRequisicoes.set(String(metricas.reduce((s, m) => s + m.requisicoes, 0))); } });
    this.health.obter().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: r => { this.apiOnline.set(r.status === 'ok'); this.banco.set(r.banco === 'ok' ? 'Online' : r.banco); }, error: () => { this.apiOnline.set(false); this.banco.set('Indisponível'); } });
  }

  protected percentualDaRota(requisicoes: number): number { const maior = this.rotasMaisAcessadas()[0]?.requisicoes ?? 1; return Math.max(4, Math.round((requisicoes / maior) * 100)); }
  protected percentualDoTotal(total: number): number { const todos = this.totalRequisicoesNumerico(); return todos ? (total / todos) * 100 : 0; }
  private totalRequisicoesNumerico(): number { return this.metricasDeRota().reduce((s, m) => s + m.requisicoes, 0); }
}
