using Desafio.Api.Api.Contratos;
using Desafio.Api.Api.Contratos.Beneficiarios;
using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Aplicacao.Servicos;
using Desafio.Api.Dominio.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Desafio.Api.Api.Controllers;

[ApiController]
[Route("beneficiarios")]
[Produces("application/json")]
public class BeneficiariosController(BeneficiarioServico servico) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<BeneficiarioResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ErroResponse>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ErroResponse>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ErroResponse>(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Criar(
        [FromBody] BeneficiarioRequest requisicao,
        CancellationToken cancellationToken)
    {
        var dados = new BeneficiarioRequestDados(
            requisicao.NomeCompleto,
            requisicao.Cpf,
            requisicao.DataNascimento,
            requisicao.PlanoId);

        var beneficiario = await servico.CriarAsync(dados, cancellationToken);

        // CreatedAtAction (padrão de Planos) exigiria a action Obter, que é a TASK-BEN-03.
        // Até lá, a URL é montada explicitamente para o header Location não depender dela.
        return Created($"/beneficiarios/{beneficiario.Id}", BeneficiarioResponse.De(beneficiario));
    }

    [HttpGet]
    [ProducesResponseType<PaginaBeneficiariosResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ErroResponse>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Listar(
        [FromQuery] int? pagina,
        [FromQuery] int? tamanho,
        [FromQuery] StatusBeneficiario? status,
        [FromQuery(Name = "plano_id")] Guid? planoId,
        CancellationToken cancellationToken)
    {
        var resultado = await servico.ListarAsync(
            new BeneficiarioFiltro(pagina, tamanho, status, planoId),
            cancellationToken);

        return Ok(PaginaBeneficiariosResponse.De(resultado));
    }
}