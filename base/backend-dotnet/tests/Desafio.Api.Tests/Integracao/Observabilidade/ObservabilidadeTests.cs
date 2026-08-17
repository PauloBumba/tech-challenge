using System.Net;
using Desafio.Api.Tests.Integracao;

namespace Desafio.Api.Tests.Integracao.Observabilidade;

[Collection(ColecaoDaApi.Nome)]
public class ObservabilidadeTests(ApiFixture fixture) : IAsyncLifetime
{
    private HttpClient Client => fixture.Client;

    public Task InitializeAsync() => fixture.LimparAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task Metricas_deve_devolver_200_em_formato_prometheus()
    {
        var resposta = await Client.GetAsync("/metrics");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("text/plain", resposta.Content.Headers.ContentType?.MediaType);

        var corpo = await resposta.Content.ReadAsStringAsync();
        Assert.Contains("# TYPE http_requisicoes_total counter", corpo);
        Assert.Contains("# TYPE http_requisicao_duracao_milissegundos histogram", corpo);
    }

    [Fact]
    public async Task Metricas_deve_registrar_a_requisicao_de_saude_com_rota_e_status()
    {
        var respostaSaude = await Client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, respostaSaude.StatusCode);

        var corpo = await (await Client.GetAsync("/metrics")).Content.ReadAsStringAsync();

        Assert.Contains("http_requisicoes_total{metodo=\"GET\",rota=\"/health\",status=\"200\"} 1", corpo);
    }

    [Fact]
    public async Task Metricas_deve_acumular_requisicoes_repetidas()
    {
        await Client.GetAsync("/health");
        await Client.GetAsync("/health");

        var corpo = await (await Client.GetAsync("/metrics")).Content.ReadAsStringAsync();

        Assert.Contains("http_requisicoes_total{metodo=\"GET\",rota=\"/health\",status=\"200\"} 2", corpo);
    }

    [Fact]
    public async Task Metricas_deve_serializar_o_label_le_dentro_dos_buckets_do_histograma()
    {
        await Client.GetAsync("/health");

        var corpo = await (await Client.GetAsync("/metrics")).Content.ReadAsStringAsync();

        Assert.Contains(
            "http_requisicao_duracao_milissegundos_bucket{metodo=\"GET\",rota=\"/health\",status=\"200\",le=\"",
            corpo);
        Assert.DoesNotContain(
            "http_requisicao_duracao_milissegundos_bucket{metodo=\"GET\",rota=\"/health\",status=\"200\"},le=",
            corpo);
    }

    [Fact]
    public async Task Metricas_deve_registrar_erro_com_status_404()
    {
        var resposta = await Client.GetAsync($"/beneficiarios/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);

        var corpo = await (await Client.GetAsync("/metrics")).Content.ReadAsStringAsync();

        Assert.Contains("http_requisicoes_total{metodo=\"GET\",rota=\"/beneficiarios/{id:guid}\",status=\"404\"} 1", corpo);
    }

    [Fact]
    public async Task Logs_deve_devolver_200_com_json_de_requisicoes()
    {
        await Client.GetAsync("/health");

        var resposta = await Client.GetAsync("/logs");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Equal("application/json", resposta.Content.Headers.ContentType?.MediaType);

        var logs = await resposta.Content.ReadAsStringAsync();
        Assert.Contains("metodo", logs);
        Assert.Contains("rota", logs);
        Assert.Contains("/health", logs);
        Assert.Contains("status", logs);
    }

    [Fact]
    public async Task Logs_deve_registrar_o_status_final_de_erro()
    {
        await Client.GetAsync($"/beneficiarios/{Guid.NewGuid()}");

        var logs = await (await Client.GetAsync("/logs")).Content.ReadAsStringAsync();

        Assert.Contains("\"rota\":\"/beneficiarios/{id:guid}\"", logs);
        Assert.Contains("\"status\":404", logs);
    }

    [Fact]
    public async Task Logs_deve_listar_do_mais_recente_para_o_mais_antigo()
    {
        await Client.GetAsync("/health");
        await Client.GetAsync("/health");

        var logs = await (await Client.GetAsync("/logs")).Content.ReadAsStringAsync();

        Assert.StartsWith("[", logs.Trim());
        Assert.Contains("\"momento\":\"2026", logs);
    }
}
