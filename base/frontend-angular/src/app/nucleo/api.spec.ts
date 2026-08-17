import { HttpErrorResponse } from '@angular/common/http';

import { mensagemDeErro } from './api';

describe('mensagemDeErro', () => {
  it('avisa que a API está fora do ar quando o status é 0', () => {
    const resposta = new HttpErrorResponse({ status: 0 });
    expect(mensagemDeErro(resposta)).toContain('Não foi possível falar com a API');
  });

  it('usa a mensagem do corpo da resposta', () => {
    const resposta = new HttpErrorResponse({
      status: 400,
      error: { erro: 'conflito', mensagem: 'CPF já cadastrado', detalhes: [] }
    });
    expect(mensagemDeErro(resposta)).toBe('CPF já cadastrado');
  });

  it('anexa os campos recusados quando há detalhes', () => {
    const resposta = new HttpErrorResponse({
      status: 422,
      error: {
        erro: 'invalido',
        mensagem: 'Dados inválidos',
        detalhes: [{ campo: 'cpf', regra: 'invalido' }]
      }
    });
    expect(mensagemDeErro(resposta)).toBe('Dados inválidos: cpf (invalido)');
  });

  it('cai no status quando não há corpo', () => {
    const resposta = new HttpErrorResponse({ status: 500 });
    expect(mensagemDeErro(resposta)).toBe('A API respondeu 500.');
  });
});