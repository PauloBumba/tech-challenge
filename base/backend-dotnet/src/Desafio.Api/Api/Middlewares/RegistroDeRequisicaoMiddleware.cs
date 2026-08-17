using Microsoft.AspNetCore.Routing;

namespace Desafio.Api.Api.Middlewares;

/// <summary>
/// Log estruturado de requisição (SPEC §7): método, rota, status e duração, sem interpolação
/// de string na mensagem — os valores são passados como campos do template de log, que o
/// AddJsonConsole do Program.cs serializa como JSON estruturado.
/// </summary>
public class RegistroDeRequisicaoMiddleware(RequestDelegate proximo, ILogger<RegistroDeRequisicaoMiddleware> logger)
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

            logger.LogInformation(
                "Requisição concluída. Método: {Metodo}. Rota: {Rota}. Status: {Status}. DuraçãoMs: {DuracaoMs}",
                contexto.Request.Method,
                ObterRota(contexto),
                contexto.Response.StatusCode,
                cronometro.Elapsed.TotalMilliseconds);
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