import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modal } from './modal';

describe('Modal', () => {
  let fixture: ComponentFixture<Modal>;
  let componente: Modal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Modal] }).compileComponents();
    fixture = TestBed.createComponent(Modal);
    componente = fixture.componentInstance;
    componente.rotulo = 'Novo plano';
    fixture.detectChanges();
  });

  it('expõe o rótulo acessível no diálogo', () => {
    const dialogo = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialogo.getAttribute('aria-label')).toBe('Novo plano');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('emite fechado ao clicar na sobreposição', () => {
    spyOn(componente.fechado, 'emit');
    const sobreposicao = fixture.nativeElement.querySelector('.sobreposicao') as HTMLElement;
    sobreposicao.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(componente.fechado.emit).toHaveBeenCalled();
  });

  it('não fecha ao clicar dentro do painel', () => {
    spyOn(componente.fechado, 'emit');
    const dialogo = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    dialogo.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(componente.fechado.emit).not.toHaveBeenCalled();
  });
});