using Desafio.Api.Dominio.Entidades;

namespace Desafio.Api.Api.Contratos.Planos;

public sealed record PlanoRequest(string? Nome, string? CodigoRegistroAns);

public sealed record PlanoResponse(Guid Id, string Nome, string CodigoRegistroAns)
{
    public static PlanoResponse De(Plano plano) =>
        new(plano.Id, plano.Nome, plano.CodigoRegistroAns);
}
