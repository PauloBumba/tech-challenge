using Desafio.Api.Aplicacao.Servicos;

namespace Desafio.Api.Aplicacao;

public static class DependenciasDaAplicacao
{
    public static IServiceCollection AddAplicacao(this IServiceCollection servicos)
    {
        servicos.AddScoped<PlanoServico>();
        servicos.AddScoped<BeneficiarioServico>();

        return servicos;
    }
}