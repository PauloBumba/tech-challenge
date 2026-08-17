using System.Collections.Concurrent;
using System.Diagnostics.Metrics;
using System.Globalization;
using System.Text;

namespace Desafio.Api.Api.Observabilidade;

/// <summary>
/// Estado de observabilidade da API, registrado como singleton no DI: métricas de
/// requisição HTTP (System.Diagnostics.Metrics) e um buffer circular com os últimos
/// logs estruturados de requisição, expostos em /metrics e /logs.
///
/// O estado em memória é intencional (single instance, dev/desafio): não há necessidade
/// de persistência.
/// </summary>
public sealed class ObservabilidadeServico
{
    private const string NomeDoMeter = "desafio.api";
    private const int CapacidadeDeLogs = 200;

    private static readonly Meter Meter = new(NomeDoMeter, "1.0.0");

    private static readonly Counter<long> RequisicoesTotal = Meter.CreateCounter<long>(
        "http_requisicoes_total",
        description: "Número total de requisições HTTP recebidas");

    private static readonly Histogram<double> DuracaoMilissegundos = Meter.CreateHistogram<double>(
        "http_requisicao_duracao_milissegundos",
        unit: "ms",
        description: "Duração das requisições HTTP em milissegundos");

    private readonly ConcurrentDictionary<string, long> _contagemPorChave = new();
    private readonly ConcurrentDictionary<string, double> _duracaoTotalPorChave = new();
    private readonly ConcurrentDictionary<string, long[]> _histogramaPorChave = new();

    private readonly ConcurrentQueue<RegistroDeRequisicaoLog> _logs = new();

    private static readonly double[] Buckets = [1, 5, 10, 50, 100, 250, 500, 1000, 2500, 5000];

    // A chave é "metodo|rota|status" porque é a dimensão que o teste público/eval usa: contar por
    // rota e status. A rota é o template ("beneficiarios/{id:guid}"), nunca o path com o id
    // concreto, para não explodir a cardinalidade de séries no scraper.
    public void Registrar(string metodo, string rota, int status, double duracaoEmMilissegundos)
    {
        var chave = $"{metodo}|{rota}|{status}";

        _contagemPorChave.AddOrUpdate(chave, 1, (_, atual) => atual + 1);
        _duracaoTotalPorChave.AddOrUpdate(chave, duracaoEmMilissegundos, (_, atual) => atual + duracaoEmMilissegundos);

        _histogramaPorChave.AddOrUpdate(
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

    public void RegistrarLog(RegistroDeRequisicaoLog log)
    {
        _logs.Enqueue(log);

        while (_logs.Count > CapacidadeDeLogs)
        {
            _logs.TryDequeue(out _);
        }
    }

    public IReadOnlyList<RegistroDeRequisicaoLog> ListarLogs(int limite) =>
        _logs.Reverse().Take(limite).ToList();

    public void LimparLogs()
    {
        while (_logs.TryDequeue(out _))
        {
        }
    }

    public void Limpar()
    {
        _contagemPorChave.Clear();
        _duracaoTotalPorChave.Clear();
        _histogramaPorChave.Clear();

        while (_logs.TryDequeue(out _))
        {
        }
    }

    public string SerializarPrometheus()
    {
        var texto = new StringBuilder();

        texto.AppendLine("# HELP http_requisicoes_total Número total de requisições HTTP recebidas");
        texto.AppendLine("# TYPE http_requisicoes_total counter");
        foreach (var (chave, valor) in _contagemPorChave.OrderBy(par => par.Key))
        {
            var (metodo, rota, status) = SepararChave(chave);
            texto.AppendLine(
                $"http_requisicoes_total{{metodo=\"{metodo}\",rota=\"{rota}\",status=\"{status}\"}} {valor}");
        }

        texto.AppendLine("# HELP http_requisicao_duracao_milissegundos Duração das requisições HTTP em milissegundos");
        texto.AppendLine("# TYPE http_requisicao_duracao_milissegundos histogram");
        foreach (var (chave, buckets) in _histogramaPorChave.OrderBy(par => par.Key))
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
                $"http_requisicao_duracao_milissegundos_sum{{{labels}}} {_duracaoTotalPorChave[chave]:F3}");
            texto.AppendLine($"http_requisicao_duracao_milissegundos_count{{{labels}}} {_contagemPorChave[chave]}");
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