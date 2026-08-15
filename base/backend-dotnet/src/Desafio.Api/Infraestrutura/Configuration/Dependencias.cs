using Desafio.Api.Infraestrutura.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Desafio.Api.Infraestrutura.Configuration;

public static class DependenciasDaInfraestrutura
{
    public static IServiceCollection AddInfraestrutura(
        this IServiceCollection servicos,
        IConfiguration configuracao)
    {
        servicos.AddDbContext<AppDbContext>(opcoes =>
            opcoes.UseNpgsql(configuracao.GetConnectionString("Postgres")));

        return servicos;
    }
}