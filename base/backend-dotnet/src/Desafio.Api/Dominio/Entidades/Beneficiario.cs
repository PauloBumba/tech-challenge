using Desafio.Api.Dominio.Comum;
using Desafio.Api.Dominio.Enums;
using Desafio.Api.Dominio.Excecoes;
using Desafio.Api.Dominio.Validadores;

namespace Desafio.Api.Dominio.Entidades;

public class Beneficiario
{
    private static readonly ITimeProvider TimeProvider = new SystemTimeProvider();

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
        DataCadastro = TimeProvider.UtcNow;
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

    public DateTime? ExcluidoEm { get; private set; }

    public void DefinirDados(
        string? nomeCompleto,
        string? cpf,
        DateOnly? dataNascimento,
        Guid? planoId)
    {
        nomeCompleto = nomeCompleto?.Trim() ?? string.Empty;
        cpf = cpf?.Trim() ?? string.Empty;

        var detalhes = new List<DetalheErro>();

        ValidadorCampo.Obrigatorio("nome_completo", nomeCompleto, detalhes);
        ValidadorCampo.TamanhoInvalido("nome_completo", nomeCompleto, 3, 120, detalhes);
        ValidadorCampo.Obrigatorio("cpf", cpf, detalhes);

        if (cpf.Length > 0 && !CpfValidator.Validar(cpf))
        {
            detalhes.Add(new DetalheErro("cpf", "formato_invalido"));
        }

        ValidadorCampo.Obrigatorio("data_nascimento", dataNascimento, detalhes);
        ValidadorCampo.DataFutura("data_nascimento", dataNascimento, detalhes, TimeProvider);
        ValidadorCampo.Obrigatorio("plano_id", planoId, detalhes);

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

        ValidadorCampo.Obrigatorio("nome_completo", nomeCompleto, detalhes);
        ValidadorCampo.TamanhoInvalido("nome_completo", nomeCompleto, 3, 120, detalhes);
        ValidadorCampo.Obrigatorio("data_nascimento", dataNascimento, detalhes);
        ValidadorCampo.DataFutura("data_nascimento", dataNascimento, detalhes, TimeProvider);
        ValidadorCampo.Obrigatorio("plano_id", planoId, detalhes);

        if (detalhes.Count > 0)
        {
            throw new ValidacaoException("Dados do beneficiário inválidos", detalhes);
        }

        NomeCompleto = nomeCompleto;
        DataNascimento = dataNascimento.Value;
        PlanoId = planoId.Value;
        Status = status;
    }

    public void Excluir() => ExcluidoEm = TimeProvider.UtcNow;
}