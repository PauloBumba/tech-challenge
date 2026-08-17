using Desafio.Api.Api.Observabilidade;
using Microsoft.AspNetCore.Mvc;

namespace Desafio.Api.Api.Controllers;

[ApiController]
[Route("logs")]
[Produces("application/json")]
public class LogsController(ObservabilidadeServico observabilidade) : ControllerBase
{
    /// <summary>
    /// Últimos logs estruturados de requisição, do mais recente para o mais antigo. O parâmetro
    /// <c>limite</c> controla quantos voltam (padrão 50) para a tela não virar um muro de texto.
    /// </summary>
    [HttpGet]
    public IActionResult Listar([FromQuery] int limite = 50) =>
        Ok(observabilidade.ListarLogs(Math.Clamp(limite, 1, 200)));

    /// <summary>
    /// Esvazia o buffer de logs em memória. Usado pela tela de observabilidade para começar a
    /// rastrear do zero, sem ficar relendo requisições antigas.
    /// </summary>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public IActionResult Limpar()
    {
        observabilidade.LimparLogs();
        return NoContent();
    }
}