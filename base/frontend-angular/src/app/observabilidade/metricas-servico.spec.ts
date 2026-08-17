import { lerMetricasDeRota } from './metricas-servico';

describe('lerMetricasDeRota', () => {
  it('parseia as linhas de contagem expostas pela API', () => {
    const texto = [
      '# HELP http_requisicoes_total Requisições por rota',
      'http_requisicoes_total{metodo="GET",rota="/planos",status="200"} 3',
      'http_requisicoes_total{metodo="POST",rota="/beneficiarios",status="201"} 1'
    ].join('\n');

    expect(lerMetricasDeRota(texto)).toEqual([
      { metodo: 'GET', rota: '/planos', status: 200, requisicoes: 3 },
      { metodo: 'POST', rota: '/beneficiarios', status: 201, requisicoes: 1 }
    ]);
  });

  it('ordena por quantidade decrescente e depois por rota', () => {
    const texto = [
      'http_requisicoes_total{metodo="GET",rota="/b",status="200"} 2',
      'http_requisicoes_total{metodo="GET",rota="/a",status="200"} 5',
      'http_requisicoes_total{metodo="GET",rota="/c",status="200"} 2'
    ].join('\n');

    const rotas = lerMetricasDeRota(texto).map((metrica) => metrica.rota);
    expect(rotas).toEqual(['/a', '/b', '/c']);
  });

  it('ignora linhas fora do padrão', () => {
    const texto = ['nada a ver', 'http_requisicoes_total{metodo="GET",rota="/health",status="200"} 1'].join('\n');
    expect(lerMetricasDeRota(texto)).toHaveSize(1);
  });
});