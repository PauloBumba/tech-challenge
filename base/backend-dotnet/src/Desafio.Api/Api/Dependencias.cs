using Desafio.Api.Api.Contratos;
using Desafio.Api.Api.Observabilidade;
using Desafio.Api.Dominio.Excecoes;
using Microsoft.AspNetCore.Mvc;

namespace Desafio.Api.Api;

public static class DependenciasDaApi
{
    public const string PoliticaDaWeb = "web";

    public static IServiceCollection AddApi(this IServiceCollection servicos)
    {
        // Estado compartilhado de métricas e logs em memória; vive enquanto a aplicação viver.
        servicos.AddSingleton<ObservabilidadeServico>();

        // A interface web roda em outra origem (porta 4200) e o navegador bloqueia a chamada sem isto.
        servicos.AddCors(opcoes => opcoes.AddPolicy(
            PoliticaDaWeb,
            politica => politica
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod()));

        servicos
            .AddControllers()
            .AddJsonOptions(opcoes => JsonPadrao.Aplicar(opcoes.JsonSerializerOptions));

        servicos.Configure<ApiBehaviorOptions>(opcoes =>
        {
            opcoes.InvalidModelStateResponseFactory = contexto =>
            {
                var detalhes = contexto.ModelState
                    .Where(entrada => entrada.Value is { Errors.Count: > 0 })
                    .Select(entrada => new DetalheErro(NormalizarCampo(entrada.Key), "invalido"))
                    .ToList();

                return new BadRequestObjectResult(
                    new ErroResponse("ValidacaoInvalida", "Corpo da requisição inválido", detalhes));
            };
        });

        servicos.AddEndpointsApiExplorer();
        servicos.AddSwaggerGen();

        return servicos;
    }

    private static string NormalizarCampo(string chave) =>
        chave.StartsWith("$.", StringComparison.Ordinal) ? chave[2..] : chave;
}