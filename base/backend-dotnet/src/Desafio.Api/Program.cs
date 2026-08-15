using Desafio.Api.Api;
using Desafio.Api.Api.Middlewares;
using Desafio.Api.Aplicacao;
using Desafio.Api.Infraestrutura.Configuration;
using Desafio.Api.Infraestrutura.Persistence;
using CargaInicial = Desafio.Api.Infraestrutura.Persistence.CargaInicial;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole();

builder.Services.AddInfraestrutura(builder.Configuration);
builder.Services.AddAplicacao();
builder.Services.AddApi();

var app = builder.Build();

app.UseMiddleware<TratamentoDeErroMiddleware>();

app.UseCors(DependenciasDaApi.PoliticaDaWeb);

app.UseSwagger();
app.UseSwaggerUI(opcoes => opcoes.RoutePrefix = "swagger");

app.MapControllers();

await PrepararBancoAsync(app);

app.Run();

static async Task PrepararBancoAsync(WebApplication app)
{
    const int TentativasMaximas = 10;

    var logger = app.Services.GetRequiredService<ILogger<Program>>();

    for (var tentativa = 1; ; tentativa++)
    {
        try
        {
            await using var escopo = app.Services.CreateAsyncScope();
            var db = escopo.ServiceProvider.GetRequiredService<AppDbContext>();

            await db.Database.MigrateAsync();
            await CargaInicial.AplicarAsync(db);

            logger.LogInformation("Banco preparado na tentativa {Tentativa}", tentativa);
            return;
        }
        catch (Exception excecao) when (tentativa < TentativasMaximas)
        {
            logger.LogWarning(
                "Banco indisponível na tentativa {Tentativa} de {TentativasMaximas}: {Mensagem}",
                tentativa,
                TentativasMaximas,
                excecao.Message);

            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }
}

public partial class Program;
