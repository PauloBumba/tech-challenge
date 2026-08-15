using System.Text.RegularExpressions;
using Desafio.Api.Dominio.Enums;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Dominio.Entidades;

public partial class Beneficiario
{
    private Beneficiario()
    {
    }

    public Beneficiario(
        Guid id,
        string? nomeCompleto,
        string? cpf,
        DateOnly? dataNascimento,
        Guid? planoId)
    {
        Id = id;
        Status = StatusBeneficiario.ATIVO;
        DataCadastro = DateTime.UtcNow;
        DefinirDados(nomeCompleto, cpf, dataNascimento, planoId);
    }

    public Guid Id { get; private set; }

    public string NomeCompleto { get; private set; } = null!;

    public string Cpf { get; private set; } = null!;

    public DateOnly DataNascimento { get; private set; }

    public StatusBeneficiario Status { get; private set; }

    public Guid PlanoId { get; private set; }

    public Plano? Plano { get; set; }

    public DateTime DataCadastro { get; private set; }

    public void DefinirDados(
        string? nomeCompleto,
        string? cpf,
        DateOnly? dataNascimento,
        Guid? planoId)
    {
        nomeCompleto = nomeCompleto?.Trim() ?? string.Empty;
        cpf = cpf?.Trim() ?? string.Empty;

        var detalhes = new List<DetalheErro>();

        if (nomeCompleto.Length == 0)
        {
            detalhes.Add(new DetalheErro("nome_completo", "obrigatorio"));
        }
        else if (nomeCompleto.Length is < 3 or > 120)
        {
            detalhes.Add(new DetalheErro("nome_completo", "tamanho_invalido"));
        }

        if (cpf.Length == 0)
        {
            detalhes.Add(new DetalheErro("cpf", "obrigatorio"));
        }
        else if (!FormatoDoCpf().IsMatch(cpf))
        {
            detalhes.Add(new DetalheErro("cpf", "formato_invalido"));
        }

        if (dataNascimento is null)
        {
            detalhes.Add(new DetalheErro("data_nascimento", "obrigatorio"));
        }
        else if (dataNascimento.Value >= DateOnly.FromDateTime(DateTime.UtcNow))
        {
            detalhes.Add(new DetalheErro("data_nascimento", "data_futura"));
        }

        if (planoId is null)
        {
            detalhes.Add(new DetalheErro("plano_id", "obrigatorio"));
        }

        if (detalhes.Count > 0)
        {
            throw new ValidacaoException("Dados do beneficiário inválidos", detalhes);
        }

        NomeCompleto = nomeCompleto;
        Cpf = cpf;
        DataNascimento = dataNascimento.Value;
        PlanoId = planoId.Value;
    }

    public void AtualizarDados(
        string? nomeCompleto,
        DateOnly? dataNascimento,
        Guid? planoId,
        StatusBeneficiario status)
    {
        nomeCompleto = nomeCompleto?.Trim() ?? string.Empty;

        // INATIVO é um registro congelado (SPEC 2.3): dados cadastrais não mudam (409);
        // a única alteração permitida é a de status (reativação).
        var dadosCadastraisMudaram =
            nomeCompleto != NomeCompleto ||
            dataNascimento != DataNascimento ||
            planoId != PlanoId;

        if (Status == StatusBeneficiario.INATIVO && dadosCadastraisMudaram)
        {
            throw new ConflitoException(
                "Beneficiário INATIVO é um registro congelado",
                [new DetalheErro("status", "congelado")]);
        }

        var detalhes = new List<DetalheErro>();

        if (nomeCompleto.Length == 0)
        {
            detalhes.Add(new DetalheErro("nome_completo", "obrigatorio"));
        }
        else if (nomeCompleto.Length is < 3 or > 120)
        {
            detalhes.Add(new DetalheErro("nome_completo", "tamanho_invalido"));
        }

        if (dataNascimento is null)
        {
            detalhes.Add(new DetalheErro("data_nascimento", "obrigatorio"));
        }
        else if (dataNascimento.Value >= DateOnly.FromDateTime(DateTime.UtcNow))
        {
            detalhes.Add(new DetalheErro("data_nascimento", "data_futura"));
        }

        if (planoId is null)
        {
            detalhes.Add(new DetalheErro("plano_id", "obrigatorio"));
        }

        if (detalhes.Count > 0)
        {
            throw new ValidacaoException("Dados do beneficiário inválidos", detalhes);
        }

        NomeCompleto = nomeCompleto;
        DataNascimento = dataNascimento.Value;
        PlanoId = planoId.Value;
        Status = status;
    }

    [GeneratedRegex("^[0-9]{11}$")]
    private static partial Regex FormatoDoCpf();
}