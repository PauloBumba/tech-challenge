using Desafio.Api.Api.Observabilidade;
using Microsoft.AspNetCore.Mvc;

namespace Desafio.Api.Api.Controllers;

[ApiController]
[Route("metrics")]
[Produces("text/plain")]
public class MetricasController : ControllerBase
{
    // Expõe as métricas no formato texto Prometheus (spec §7 pede documentação OpenAPI; as
    // métricas são escopo extra pedido pelo Paulo, ver TASK-OBS-01). Sem banco, sem domínio.
    [HttpGet]
    public IActionResult Obter() => Ok(MetricasDeRequisicao.SerializarPrometheus());
}