using Desafio.Api.Api.Observabilidade;
using Microsoft.AspNetCore.Routing;

namespace Desafio.Api.Api.Middlewares;

/// <summary>
/// Log estruturado de requisição (SPEC §7): método, rota, status e duração, sem interpolação
/// de string na mensagem — os valores são passados como campos do template de log, que o
/// AddJsonConsole do Program.cs serializa como JSON estruturado.
/// </summary>
public class RegistroDeRequisicaoMiddleware(
    RequestDelegate proximo,
    ILogger<RegistroDeRequisicaoMiddleware> logger,
    ObservabilidadeServico observabilidade)
{
    public async Task InvokeAsync(HttpContext contexto)
    {
        var cronometro = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            await proximo(contexto);
        }
        finally
        {
            cronometro.Stop();

            var rota = ObterRota(contexto);
            var status = contexto.Response.StatusCode;
            var duracao = cronometro.Elapsed.TotalMilliseconds;

            logger.LogInformation(
                "Requisição concluída. Método: {Metodo}. Rota: {Rota}. Status: {Status}. DuraçãoMs: {DuracaoMs}",
                contexto.Request.Method,
                rota,
                status,
                duracao);

            observabilidade.RegistrarLog(new RegistroDeRequisicaoLog(
                DateTime.UtcNow,
                contexto.Request.Method,
                rota,
                status,
                duracao));
        }
    }

    private static string ObterRota(HttpContext contexto)
    {
        if (contexto.GetEndpoint() is RouteEndpoint endpoint)
        {
            return $"/{endpoint.RoutePattern.RawText}";
        }

        return contexto.Request.Path.Value ?? "?";
    }
}