using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Enums;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Tests.Unitarios.Dominio.Entidades;

public class BeneficiarioTests
{
    private static readonly Guid PlanoValido = Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Fact]
    public void Criar_deve_definir_status_ativo_data_de_cadastro_e_aplicar_as_regras_dos_dados()
    {
        var beneficiario = new Beneficiario(
            Guid.NewGuid(),
            "Maria Aparecida da Silva",
            "52998224725",
            new DateOnly(1990, 5, 12),
            PlanoValido);

        Assert.Equal(StatusBeneficiario.ATIVO, beneficiario.Status);
        Assert.True(beneficiario.DataCadastro <= DateTime.UtcNow);
        Assert.Equal("Maria Aparecida da Silva", beneficiario.NomeCompleto);
        Assert.Equal("52998224725", beneficiario.Cpf);
        Assert.Equal(new DateOnly(1990, 5, 12), beneficiario.DataNascimento);
        Assert.Equal(PlanoValido, beneficiario.PlanoId);
    }

    [Theory]
    [InlineData(null, "52998224725")]
    [InlineData("", "52998224725")]
    [InlineData("ab", "52998224725")]
    [InlineData("Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida da Silva Maria Aparecida", "52998224725")]
    public void Criar_com_nome_completo_invalido_deve_lancar_validacao_apontando_o_campo(string? nome, string cpf)
    {
        var excecao = Assert.Throws<ValidacaoException>(() => Criar(nome, cpf));

        Assert.Contains(excecao.Detalhes, detalhe => detalhe.Campo == "nome_completo");
    }

    [Theory]
    [InlineData("123")]
    [InlineData("5299822472")]
    [InlineData("5299822472a")]
    public void Criar_com_cpf_fora_do_formato_deve_lancar_validacao_apontando_o_campo(string cpf)
    {
        var excecao = Assert.Throws<ValidacaoException>(() => Criar(cpf: cpf));

        Assert.Contains(excecao.Detalhes, detalhe => detalhe.Campo == "cpf");
    }

    [Fact]
    public void Criar_com_data_de_nascimento_futura_deve_lancar_validacao()
    {
        var excecao = Assert.Throws<ValidacaoException>(() =>
            Criar(dataNascimento: new DateOnly(2099, 1, 1)));

        Assert.Contains(excecao.Detalhes, detalhe => detalhe.Campo == "data_nascimento");
    }

    [Fact]
    public void Criar_sem_plano_deve_lancar_validacao_apontando_o_campo()
    {
        var excecao = Assert.Throws<ValidacaoException>(() =>
            new Beneficiario(
                Guid.NewGuid(),
                "Maria Aparecida da Silva",
                "52998224725",
                new DateOnly(1990, 5, 12),
                null));

        Assert.Contains(excecao.Detalhes, detalhe => detalhe.Campo == "plano_id");
    }

    private static Beneficiario Criar(
        string? nome = "Maria Aparecida da Silva",
        string cpf = "52998224725",
        DateOnly? dataNascimento = null,
        Guid? planoId = null) =>
        new(Guid.NewGuid(), nome, cpf, dataNascimento ?? new DateOnly(1990, 5, 12), planoId ?? PlanoValido);
}