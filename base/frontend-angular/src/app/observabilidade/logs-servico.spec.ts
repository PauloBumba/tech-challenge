import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE } from '../nucleo/api';
import { LogsServico } from './logs-servico';

describe('LogsServico (com HttpClient real)', () => {
  let servico: LogsServico;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE, useValue: '/api' }
      ]
    });
    servico = TestBed.inject(LogsServico);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista os logs pedindo apenas o limite de 50', () => {
    servico.listar().subscribe();

    const requisicao = http.expectOne((r) => r.method === 'GET' && r.url === '/api/logs');
    expect(requisicao.request.params.get('limite')).toBe('50');
    requisicao.flush([]);
  });

  it('limpa o buffer via DELETE', () => {
    let completou = false;
    servico.limpar().subscribe({ complete: () => (completou = true) });
    http.expectOne((r) => r.method === 'DELETE' && r.url === '/api/logs').flush(null);
    expect(completou).toBeTrue();
  });
});