using System.Diagnostics;
using Desafio.Api.Api.Observabilidade;
using Microsoft.AspNetCore.Routing;

namespace Desafio.Api.Api.Middlewares;

/// <summary>
/// Mede cada requisição HTTP e registra contagem/duração por método, rota (template, não o
/// id concreto) e status. Roda por fora do TratamentoDeErroMiddleware de propósito: assim o
/// status registrado é o final (inclusive 404/409/500 que o tratamento converte).
/// </summary>
public class MetricasMiddleware(
    RequestDelegate proximo,
    ObservabilidadeServico observabilidade)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        var cronometro = Stopwatch.StartNew();

        try
        {
            await proximo(contexto);
        }
        finally
        {
            cronometro.Stop();

            observabilidade.Registrar(
                contexto.Request.Method,
                ObterRota(contexto),
                contexto.Response.StatusCode,
                cronometro.Elapsed.TotalMilliseconds);
        }
    }

    // O template da rota (ex.: "beneficiarios/{id:guid}") em vez do path com o id concreto
    // (ex.: "/beneficiarios/1234...") evita cardinalidade infinita de séries no scraper.
    private static string ObterRota(HttpContext contexto)
    {
        if (contexto.GetEndpoint() is RouteEndpoint endpoint)
        {
            return $"/{endpoint.RoutePattern.RawText}";
        }

        return contexto.Request.Path.Value ?? "?";
    }
}