import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE } from '../nucleo/api';
import { BeneficiarioFormulario } from './beneficiario-formulario';

describe('BeneficiarioFormulario', () => {
  let fixture: ComponentFixture<BeneficiarioFormulario>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiarioFormulario],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE, useValue: '/api' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeneficiarioFormulario);
    http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('planos', [{ id: 'p-1', nome: 'Plano 1', codigo_registro_ans: '123456' }]);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function campo(nome: string): HTMLInputElement | HTMLSelectElement {
    return fixture.nativeElement.querySelector(`[formControlName="${nome}"]`);
  }

  function preencherCadastroValido(): void {
    const nome = campo('nome_completo') as HTMLInputElement;
    nome.value = 'Fulano de Tal';
    nome.dispatchEvent(new Event('input'));

    const cpf = campo('cpf') as HTMLInputElement;
    cpf.value = '52998224725';
    cpf.dispatchEvent(new Event('input'));

    const nascimento = campo('data_nascimento') as HTMLInputElement;
    nascimento.value = '1990-01-01';
    nascimento.dispatchEvent(new Event('input'));

    const plano = campo('plano_id') as HTMLSelectElement;
    plano.value = 'p-1';
    plano.dispatchEvent(new Event('change'));

    fixture.detectChanges();
  }

  it('aplica a máscara de CPF enquanto o usuário digita', () => {
    const cpf = campo('cpf') as HTMLInputElement;
    cpf.value = '52998224725';
    cpf.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(cpf.value).toBe('529.982.247-25');
  });

  it('cadastra enviando o CPF apenas com dígitos', () => {
    preencherCadastroValido();

    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    botao.click();

    const requisicao = http.expectOne((r) => r.method === 'POST' && r.url === '/api/beneficiarios');
    expect(requisicao.request.body).toEqual({
      nome_completo: 'Fulano de Tal',
      cpf: '52998224725',
      data_nascimento: '1990-01-01',
      plano_id: 'p-1'
    });

    requisicao.flush({
      id: 'b-1',
      nome_completo: 'Fulano de Tal',
      cpf: '52998224725',
      data_nascimento: '1990-01-01',
      status: 'ATIVO',
      plano_id: 'p-1',
      data_cadastro: '2026-01-01'
    });
  });
});