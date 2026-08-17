using System.Collections.Concurrent;
using System.Diagnostics.Metrics;
using System.Globalization;
using System.Text;

namespace Desafio.Api.Api.Observabilidade;

/// <summary>
/// Registro em memória das métricas de requisição HTTP, exposto em formato Prometheus.
///
/// Os instrumentos (Counter/Histogram) usam System.Diagnostics.Metrics — a API nativa do .NET —
/// sem dependência externa. O endpoint /metrics serializa o estado em texto Prometheus para
/// consumo direto por um scraper (Prometheus, Grafana etc.).
///
/// A chave é "metodo|rota|status" porque é a dimensão que o teste público/eval usa: contar por
/// rota e status. O estado em memória é intencional (single instance, dev/desafio): não há
/// necessidade de persistência.
/// </summary>
public static class MetricasDeRequisicao
{
    private const string NomeDoMeter = "desafio.api";

    private static readonly Meter Meter = new(NomeDoMeter, "1.0.0");

    private static readonly Counter<long> RequisicoesTotal = Meter.CreateCounter<long>(
        "http_requisicoes_total",
        description: "Número total de requisições HTTP recebidas");

    private static readonly Histogram<double> DuracaoMilissegundos = Meter.CreateHistogram<double>(
        "http_requisicao_duracao_milissegundos",
        unit: "ms",
        description: "Duração das requisições HTTP em milissegundos");

    private static readonly ConcurrentDictionary<string, long> ContagemPorChave = new();

    private static readonly ConcurrentDictionary<string, double> DuracaoTotalPorChave = new();

    private static readonly ConcurrentDictionary<string, long[]> HistogramaPorChave = new();

    private static readonly double[] Buckets = [1, 5, 10, 50, 100, 250, 500, 1000, 2500, 5000];

    public static void Registrar(string metodo, string rota, int status, double duracaoEmMilissegundos)
    {
        var chave = $"{metodo}|{rota}|{status}";

        ContagemPorChave.AddOrUpdate(chave, 1, (_, atual) => atual + 1);
        DuracaoTotalPorChave.AddOrUpdate(chave, duracaoEmMilissegundos, (_, atual) => atual + duracaoEmMilissegundos);

        HistogramaPorChave.AddOrUpdate(
            chave,
            _ => PreencherBuckets(duracaoEmMilissegundos),
            (_, atual) => IncrementarBuckets(atual, duracaoEmMilissegundos));

        var dimensoes = new KeyValuePair<string, object?>[]
        {
            new("metodo", metodo),
            new("rota", rota),
            new("status", status.ToString(CultureInfo.InvariantCulture))
        };

        RequisicoesTotal.Add(1, dimensoes);
        DuracaoMilissegundos.Record(duracaoEmMilissegundos, dimensoes);
    }

    public static void Limpar()
    {
        ContagemPorChave.Clear();
        DuracaoTotalPorChave.Clear();
        HistogramaPorChave.Clear();
    }

    public static string SerializarPrometheus()
    {
        var texto = new StringBuilder();

        texto.AppendLine("# HELP http_requisicoes_total Número total de requisições HTTP recebidas");
        texto.AppendLine("# TYPE http_requisicoes_total counter");
        foreach (var (chave, valor) in ContagemPorChave.OrderBy(par => par.Key))
        {
            var (metodo, rota, status) = SepararChave(chave);
            texto.AppendLine(
                $"http_requisicoes_total{{metodo=\"{metodo}\",rota=\"{rota}\",status=\"{status}\"}} {valor}");
        }

        texto.AppendLine("# HELP http_requisicao_duracao_milissegundos Duração das requisições HTTP em milissegundos");
        texto.AppendLine("# TYPE http_requisicao_duracao_milissegundos histogram");
        foreach (var (chave, buckets) in HistogramaPorChave.OrderBy(par => par.Key))
        {
            var (metodo, rota, status) = SepararChave(chave);
            var labels = $"metodo=\"{metodo}\",rota=\"{rota}\",status=\"{status}\"";

            var acumulado = 0L;
            for (var i = 0; i < Buckets.Length; i++)
            {
                acumulado += buckets[i];
                texto.AppendLine(
                    $"http_requisicao_duracao_milissegundos_bucket{{{labels},le=\"{Buckets[i]}\"}} {acumulado}");
            }

            acumulado += buckets[Buckets.Length];
            texto.AppendLine($"http_requisicao_duracao_milissegundos_bucket{{{labels},le=\"+Inf\"}} {acumulado}");
            texto.AppendLine(
                $"http_requisicao_duracao_milissegundos_sum{{{labels}}} {DuracaoTotalPorChave[chave]:F3}");
            texto.AppendLine($"http_requisicao_duracao_milissegundos_count{{{labels}}} {ContagemPorChave[chave]}");
        }

        return texto.ToString();
    }

    private static long[] PreencherBuckets(double duracaoEmMilissegundos)
    {
        var buckets = new long[Buckets.Length + 1];
        IncrementarBuckets(buckets, duracaoEmMilissegundos);
        return buckets;
    }

    private static long[] IncrementarBuckets(long[] buckets, double duracaoEmMilissegundos)
    {
        var indice = 0;
        while (indice < Buckets.Length && duracaoEmMilissegundos > Buckets[indice])
        {
            indice++;
        }

        buckets[indice]++;
        return buckets;
    }

    private static (string Metodo, string Rota, string Status) SepararChave(string chave)
    {
        var partes = chave.Split('|', 3);
        return (partes[0], partes[1], partes[2]);
    }
}
