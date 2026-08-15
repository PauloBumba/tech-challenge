using Microsoft.AspNetCore.Http;

namespace Desafio.Api.Dominio.Excecoes;

public sealed class NaoEncontradoException(string mensagem)
    : ExcecaoDeDominio("NaoEncontrado", mensagem, null)
{
    public override int StatusCode => StatusCodes.Status404NotFound;
}