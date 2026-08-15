using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Tests.Unitarios.Dominio.Entidades;

public class PlanoTests
{
    [Fact]
    public void Criar_deve_aplicar_as_regras_dos_dados()
    {
        var plano = new Plano("Bronze Plus", "100099");

        Assert.Equal("Bronze Plus", plano.Nome);
        Assert.Equal("100099", plano.CodigoRegistroAns);
        Assert.Null(plano.ExcluidoEm);
    }

    [Theory]
    [InlineData(null, "100001")]
    [InlineData("", "100001")]
    [InlineData("ab", "100001")]
    [InlineData("Um nome excessivamente longo demais para caber nos sessenta caracteres permitidos pela regra do domínio", "100001")]
    public void Criar_com_nome_invalido_deve_lancar_validacao_apontando_o_campo(string? nome, string codigo)
    {
        var excecao = Assert.Throws<ValidacaoException>(() => Criar(nome, codigo));

        Assert.Contains(excecao.Detalhes, detalhe => detalhe.Campo == "nome");
    }

    [Theory]
    [InlineData("123")]
    [InlineData("abcdef")]
    [InlineData("10000")]
    [InlineData("1000011")]
    public void Criar_com_codigo_ans_invalido_deve_lancar_validacao_apontando_o_campo(string codigo)
    {
        var excecao = Assert.Throws<ValidacaoException>(() => Criar(codigo: codigo));

        Assert.Contains(excecao.Detalhes, detalhe => detalhe.Campo == "codigo_registro_ans");
    }

    [Fact]
    public void Excluir_deve_marcar_a_data_de_exclusao()
    {
        var plano = new Plano("Descontinuado", "100088");

        plano.Excluir();

        Assert.NotNull(plano.ExcluidoEm);
        Assert.True(plano.ExcluidoEm <= DateTime.UtcNow);
    }

    private static Plano Criar(string? nome = "Bronze Plus", string codigo = "100099") =>
        new(nome, codigo);
}