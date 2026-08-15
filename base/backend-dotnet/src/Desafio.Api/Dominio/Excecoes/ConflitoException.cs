using Microsoft.AspNetCore.Http;

namespace Desafio.Api.Dominio.Excecoes;

public sealed class ConflitoException(string mensagem, IReadOnlyList<DetalheErro>? detalhes = null)
    : ExcecaoDeDominio("Conflito", mensagem, detalhes)
{
    public override int StatusCode => StatusCodes.Status409Conflict;
}