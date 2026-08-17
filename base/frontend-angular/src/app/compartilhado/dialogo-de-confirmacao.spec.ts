import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDeConfirmacao } from './dialogo-de-confirmacao';

describe('DialogoDeConfirmacao', () => {
  let fixture: ComponentFixture<DialogoDeConfirmacao>;
  let componente: DialogoDeConfirmacao;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DialogoDeConfirmacao] }).compileComponents();
    fixture = TestBed.createComponent(DialogoDeConfirmacao);
    componente = fixture.componentInstance;
    componente.titulo = 'Excluir plano?';
    componente.nome = 'Plano X';
    componente.descricao = ' Esta ação remove o registro.';
    componente.rotuloConfirmar = 'Excluir plano';
    fixture.detectChanges();
  });

  it('mostra o título, o nome em destaque e a descrição', () => {
    const texto = fixture.nativeElement.textContent as string;
    expect(texto).toContain('Excluir plano?');
    expect(texto).toContain('Plano X');
    expect(texto).toContain('Esta ação remove o registro.');
  });

  it('emite confirmado ao clicar no botão de confirmar', () => {
    spyOn(componente.confirmado, 'emit');
    const botoes = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    botoes[botoes.length - 1].click();
    expect(componente.confirmado.emit).toHaveBeenCalled();
  });

  it('emite cancelado ao clicar em Cancelar', () => {
    spyOn(componente.cancelado, 'emit');
    const botoes = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    botoes[0].click();
    expect(componente.cancelado.emit).toHaveBeenCalled();
  });

  it('mantém o id do título acessível estável para o alertdialog', () => {
    const dialogo = fixture.nativeElement.querySelector('[role="alertdialog"]') as HTMLElement;
    const id = dialogo.getAttribute('aria-labelledby');
    const titulo = fixture.nativeElement.querySelector('h3') as HTMLElement;
    expect(id).toBe(titulo.id);
  });
});