using Microsoft.AspNetCore.Http;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Tests.Unitarios.Dominio.Excecoes;

public class ExcecaoDeDominioTests
{
    [Theory]
    [InlineData("ValidacaoInvalida", 400)]
    [InlineData("NaoEncontrado", 404)]
    [InlineData("Conflito", 409)]
    [InlineData("NaoProcessavel", 422)]
    public void Cada_excecao_deve_mapear_para_o_codigo_http_correto(string erro, int statusCode)
    {
        ExcecaoDeDominio excecao = erro switch
        {
            "ValidacaoInvalida" => new ValidacaoException("mensagem"),
            "NaoEncontrado" => new NaoEncontradoException("mensagem"),
            "Conflito" => new ConflitoException("mensagem"),
            _ => new NaoProcessavelException("mensagem")
        };

        Assert.Equal(erro, excecao.Erro);
        Assert.Equal(statusCode, excecao.StatusCode);
        Assert.Equal(statusCode, (int)StatusCodePara(excecao));
    }

    [Fact]
    public void Detalhe_erro_deve_guardar_campo_e_regra()
    {
        var detalhe = new DetalheErro("cpf", "duplicado");

        Assert.Equal("cpf", detalhe.Campo);
        Assert.Equal("duplicado", detalhe.Regra);
    }

    private static object StatusCodePara(ExcecaoDeDominio excecao) => excecao.StatusCode switch
    {
        400 => StatusCodes.Status400BadRequest,
        404 => StatusCodes.Status404NotFound,
        409 => StatusCodes.Status409Conflict,
        422 => StatusCodes.Status422UnprocessableEntity,
        _ => -1
    };
}