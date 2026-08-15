using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Dominio.Comum;

/// <summary>
/// Métodos auxiliares para validação de campos comuns, centralizando a criação
/// de DetalheErro e seguindo DRY. Elimina repetição de new DetalheErro(...) em
/// múltiplas entidades.
/// </summary>
public static class ValidadorCampo
{
    public static void Obrigatorio(string campo, string? valor, List<DetalheErro> detalhes)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            detalhes.Add(new DetalheErro(campo, "obrigatorio"));
        }
    }

    public static void Obrigatorio(string campo, DateOnly? valor, List<DetalheErro> detalhes)
    {
        if (valor is null)
        {
            detalhes.Add(new DetalheErro(campo, "obrigatorio"));
        }
    }

    public static void Obrigatorio(string campo, Guid? valor, List<DetalheErro> detalhes)
    {
        if (valor is null)
        {
            detalhes.Add(new DetalheErro(campo, "obrigatorio"));
        }
    }

    public static void TamanhoInvalido(string campo, string? valor, int min, int max, List<DetalheErro> detalhes)
    {
        if (valor != null && (valor.Length < min || valor.Length > max))
        {
            detalhes.Add(new DetalheErro(campo, "tamanho_invalido"));
        }
    }

    public static void FormatoInvalido(string campo, string? valor, string padrao, List<DetalheErro> detalhes)
    {
        if (valor != null && !System.Text.RegularExpressions.Regex.IsMatch(valor, padrao))
        {
            detalhes.Add(new DetalheErro(campo, "formato_invalido"));
        }
    }

    public static void DataFutura(string campo, DateOnly? valor, List<DetalheErro> detalhes, ITimeProvider timeProvider)
    {
        if (valor.HasValue && valor.Value >= DateOnly.FromDateTime(timeProvider.UtcNow))
        {
            detalhes.Add(new DetalheErro(campo, "data_futura"));
        }
    }
}
