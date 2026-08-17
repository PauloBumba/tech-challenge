import { FormControl } from '@angular/forms';

import { cpfFormatoValido, dataNoPassado } from './validadores';

describe('cpfFormatoValido', () => {
  it('aceita um CPF válido', () => {
    expect(cpfFormatoValido()(new FormControl('529.982.247-25'))).toBeNull();
  });

  it('rejeita CPF de dígitos repetidos', () => {
    expect(cpfFormatoValido()(new FormControl('111.111.111-11'))).toEqual({ cpf_invalido: true });
  });

  it('rejeita CPF com verificador errado', () => {
    expect(cpfFormatoValido()(new FormControl('529.982.247-24'))).toEqual({ cpf_invalido: true });
  });
});

describe('dataNoPassado', () => {
  it('aceita data no passado', () => {
    expect(dataNoPassado()(new FormControl('2000-01-01'))).toBeNull();
  });

  it('rejeita data no futuro', () => {
    expect(dataNoPassado()(new FormControl('2999-01-01'))).toEqual({ data_futura: true });
  });

  it('aceita campo vazio', () => {
    expect(dataNoPassado()(new FormControl(''))).toBeNull();
  });
});