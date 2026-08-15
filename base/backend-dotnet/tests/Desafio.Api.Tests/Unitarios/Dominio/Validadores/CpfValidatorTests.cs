using Desafio.Api.Dominio.Validadores;
using Xunit;

namespace Desafio.Api.Tests.Unitarios.Dominio.Validadores;

public class CpfValidatorTests
{
    [Theory]
    [InlineData("52998224725")] // CPF válido conhecido
    [InlineData("39053344705")] // CPF válido conhecido (usado em testes anteriores)
    public void Validar_CpfValido_RetornaTrue(string cpf)
    {
        // Act
        var resultado = CpfValidator.Validar(cpf);

        // Assert
        Assert.True(resultado);
    }

    [Theory]
    [InlineData("00000000000")] // Sequência de zeros
    [InlineData("11111111111")] // Sequência de uns
    [InlineData("22222222222")] // Sequência de dois
    [InlineData("33333333333")] // Sequência de três
    [InlineData("44444444444")] // Sequência de quatro
    [InlineData("55555555555")] // Sequência de cinco
    [InlineData("66666666666")] // Sequência de seis
    [InlineData("77777777777")] // Sequência de sete
    [InlineData("88888888888")] // Sequência de oito
    [InlineData("99999999999")] // Sequência de nove
    public void Validar_SequenciaRepetida_RetornaFalse(string cpf)
    {
        // Act
        var resultado = CpfValidator.Validar(cpf);

        // Assert
        Assert.False(resultado);
    }

    [Theory]
    [InlineData("52998224720")] // Primeiro dígito verificador incorreto
    [InlineData("52998224700")] // Ambos dígitos verificadores incorretos
    [InlineData("12345678900")] // Dígitos verificadores incorretos
    public void Validar_DigitosVerificadoresInvalidos_RetornaFalse(string cpf)
    {
        // Act
        var resultado = CpfValidator.Validar(cpf);

        // Assert
        Assert.False(resultado);
    }

    [Theory]
    [InlineData("123")] // Menos de 11 dígitos
    [InlineData("123456789012")] // Mais de 11 dígitos
    [InlineData("123.456.789-09")] // Com pontuação
    [InlineData("abc")] // Não numérico
    public void Validar_FormatoInvalido_RetornaFalse(string cpf)
    {
        // Act
        var resultado = CpfValidator.Validar(cpf);

        // Assert
        Assert.False(resultado);
    }
}
