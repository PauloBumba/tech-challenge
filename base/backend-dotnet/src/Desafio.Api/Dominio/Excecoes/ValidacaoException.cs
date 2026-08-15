using Microsoft.AspNetCore.Http;

namespace Desafio.Api.Dominio.Excecoes;

public sealed class ValidacaoException(string mensagem, IReadOnlyList<DetalheErro>? detalhes = null)
    : ExcecaoDeDominio("ValidacaoInvalida", mensagem, detalhes)
{
    public override int StatusCode => StatusCodes.Status400BadRequest;
}