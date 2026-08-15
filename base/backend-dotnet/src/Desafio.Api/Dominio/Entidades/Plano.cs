
using System.Text.RegularExpressions;
using Desafio.Api.Dominio.Comum;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Dominio.Entidades;

public partial class Plano
{
    private static readonly ITimeProvider TimeProvider = new SystemTimeProvider();

    private Plano()
    {
    }

    public Plano(string? nome, string? codigoRegistroAns)
        : this(Guid.NewGuid(), nome, codigoRegistroAns)
    {
    }

    public Plano(Guid id, string? nome, string? codigoRegistroAns)
    {
        Id = id;
        DefinirDados(nome, codigoRegistroAns);
    }

    public Guid Id { get; private set; }

    public string Nome { get; private set; } = null!;

    public string CodigoRegistroAns { get; private set; } = null!;

    public DateTime? ExcluidoEm { get; private set; }

    public void DefinirDados(string? nome, string? codigoRegistroAns)
    {
        nome = nome?.Trim() ?? string.Empty;
        codigoRegistroAns = codigoRegistroAns?.Trim() ?? string.Empty;

        var detalhes = new List<DetalheErro>();

        ValidadorCampo.Obrigatorio("nome", nome, detalhes);
        ValidadorCampo.TamanhoInvalido("nome", nome, 3, 60, detalhes);
        ValidadorCampo.Obrigatorio("codigo_registro_ans", codigoRegistroAns, detalhes);
        ValidadorCampo.FormatoInvalido("codigo_registro_ans", codigoRegistroAns, "^[0-9]{6}$", detalhes);

        if (detalhes.Count > 0)
        {
            throw new ValidacaoException("Dados do plano inválidos", detalhes);
        }

        Nome = nome;
        CodigoRegistroAns = codigoRegistroAns;
    }

    public void Excluir() => ExcluidoEm = TimeProvider.UtcNow;

    [GeneratedRegex("^[0-9]{6}$")]
    private static partial Regex FormatoDoCodigoAns();
}
