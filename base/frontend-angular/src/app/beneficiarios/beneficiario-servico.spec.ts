import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE } from '../nucleo/api';
import { BeneficiarioServico } from './beneficiario-servico';

describe('BeneficiarioServico (com HttpClient real)', () => {
  let servico: BeneficiarioServico;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE, useValue: '/api' }
      ]
    });
    servico = TestBed.inject(BeneficiarioServico);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista enviando página, tamanho, status e plano_id', () => {
    servico
      .listar({ pagina: 2, tamanho: 20, status: 'ATIVO', planoId: 'p-1' })
      .subscribe();

    const requisicao = http.expectOne((r) => r.method === 'GET' && r.url === '/api/beneficiarios');
    expect(requisicao.request.params.get('pagina')).toBe('2');
    expect(requisicao.request.params.get('tamanho')).toBe('20');
    expect(requisicao.request.params.get('status')).toBe('ATIVO');
    expect(requisicao.request.params.get('plano_id')).toBe('p-1');

    requisicao.flush({ dados: [], pagina: 2, tamanho: 20, total: 0 });
  });

  it('conta por plano usando o total agregado de cada filtro', () => {
    let mapa: Map<string, number> | undefined;
    servico.contarPorPlanos(['p-1', 'p-2']).subscribe((resultado) => (mapa = resultado));

    const requisicaoA = http.expectOne(
      (r) => r.url === '/api/beneficiarios' && r.params.get('plano_id') === 'p-1'
    );
    const requisicaoB = http.expectOne(
      (r) => r.url === '/api/beneficiarios' && r.params.get('plano_id') === 'p-2'
    );

    requisicaoA.flush({ dados: [], pagina: 1, tamanho: 1, total: 5 });
    requisicaoB.flush({ dados: [], pagina: 1, tamanho: 1, total: 3 });

    expect(mapa).toEqual(new Map([['p-1', 5], ['p-2', 3]]));
  });

  it('não dispara requisição quando não há planos para contar', () => {
    let mapa: Map<string, number> | undefined;
    servico.contarPorPlanos([]).subscribe((resultado) => (mapa = resultado));
    expect(mapa).toEqual(new Map());
  });
});