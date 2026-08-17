import { apenasDigitos, cpfValido, formatarCpf } from './cpf';

describe('apenasDigitos', () => {
  it('remove pontuação e deixa só os dígitos', () => {
    expect(apenasDigitos('529.982.247-25')).toBe('52998224725');
  });
});

describe('formatarCpf', () => {
  it('formata 11 dígitos como 000.000.000-00', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
  });

  it('devolve só os dígitos quando o tamanho é inválido', () => {
    expect(formatarCpf('123')).toBe('123');
  });
});

describe('cpfValido', () => {
  it('aceita CPF com dígitos verificadores corretos', () => {
    expect(cpfValido('529.982.247-25')).toBeTrue();
  });

  it('rejeita sequência de dígitos repetidos', () => {
    expect(cpfValido('111.111.111-11')).toBeFalse();
  });

  it('rejeita tamanho diferente de 11', () => {
    expect(cpfValido('123')).toBeFalse();
  });

  it('rejeita dígito verificador errado', () => {
    expect(cpfValido('529.982.247-24')).toBeFalse();
  });
});