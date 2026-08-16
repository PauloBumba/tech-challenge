using Desafio.Api.Aplicacao.Repositorios;
using Desafio.Api.Infraestrutura.Persistence;
using Desafio.Api.Infraestrutura.Persistence.Repositorios;
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

        servicos.AddScoped<IPlanoRepositorio, PlanoRepositorio>();
        servicos.AddScoped<IBeneficiarioRepositorio, BeneficiarioRepositorio>();

        return servicos;
    }
}