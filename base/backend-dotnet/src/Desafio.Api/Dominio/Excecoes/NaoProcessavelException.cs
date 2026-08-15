using Microsoft.AspNetCore.Http;

namespace Desafio.Api.Dominio.Excecoes;

public sealed class NaoProcessavelException(string mensagem, IReadOnlyList<DetalheErro>? detalhes = null)
    : ExcecaoDeDominio("NaoProcessavel", mensagem, detalhes)
{
    public override int StatusCode => StatusCodes.Status422UnprocessableEntity;
}