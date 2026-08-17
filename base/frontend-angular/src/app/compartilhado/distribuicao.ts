export interface GrupoDeDistribuicao {
  rotulo: string;
  total: number;
  cor: string;
  percentual: number;
  inicio: number;
}

export interface GrupoEntrada {
  rotulo: string;
  total: number;
  cor: string;
}

/**
 * Calcula o percentual acumulado de cada grupo para o gráfico de rosca.
 * Grupos sem beneficiários são descartados; o `inicio` guarda o ângulo de
 * partida da fatia (em %) e soma conforme avança a enumeração.
 */
export function criarDistribuicao(grupos: GrupoEntrada[]): GrupoDeDistribuicao[] {
  const total = grupos.reduce((soma, grupo) => soma + grupo.total, 0);
  let inicio = 0;
  return grupos.filter((grupo) => grupo.total > 0).map((grupo) => {
    const percentual = total ? (grupo.total / total) * 100 : 0;
    const resultado = { ...grupo, percentual, inicio };
    inicio += percentual;
    return resultado;
  });
}