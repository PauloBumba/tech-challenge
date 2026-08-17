import { criarDistribuicao } from './distribuicao';

describe('criarDistribuicao', () => {
  it('calcula o percentual e o início acumulado de cada grupo', () => {
    const resultado = criarDistribuicao([
      { rotulo: 'A', total: 25, cor: '#000' },
      { rotulo: 'B', total: 75, cor: '#fff' }
    ]);

    expect(resultado).toEqual([
      { rotulo: 'A', total: 25, cor: '#000', percentual: 25, inicio: 0 },
      { rotulo: 'B', total: 75, cor: '#fff', percentual: 75, inicio: 25 }
    ]);
  });

  it('descarta grupos sem valor (nunca desenha fatia vazia)', () => {
    const resultado = criarDistribuicao([
      { rotulo: 'A', total: 0, cor: '#000' },
      { rotulo: 'B', total: 10, cor: '#fff' }
    ]);

    expect(resultado).toHaveSize(1);
    expect(resultado[0].rotulo).toBe('B');
  });

  it('retorna lista vazia quando não há grupos', () => {
    expect(criarDistribuicao([])).toEqual([]);
  });

  it('evita divisão por zero quando o total é zero', () => {
    const resultado = criarDistribuicao([{ rotulo: 'A', total: 0, cor: '#000' }]);
    expect(resultado).toEqual([]);
  });
});