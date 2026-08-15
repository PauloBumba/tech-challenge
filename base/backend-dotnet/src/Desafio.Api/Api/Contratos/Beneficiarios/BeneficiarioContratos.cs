using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Enums;

namespace Desafio.Api.Api.Contratos.Beneficiarios;

public sealed record BeneficiarioRequest(
    string? NomeCompleto,
    string? Cpf,
    DateOnly? DataNascimento,
    Guid? PlanoId,
    StatusBeneficiario? Status = null);

public sealed record BeneficiarioResponse(
    Guid Id,
    string NomeCompleto,
    string Cpf,
    DateOnly DataNascimento,
    StatusBeneficiario Status,
    Guid PlanoId,
    DateTime DataCadastro)
{
    public static BeneficiarioResponse De(Beneficiario beneficiario) =>
        new(
            beneficiario.Id,
            beneficiario.NomeCompleto,
            beneficiario.Cpf,
            beneficiario.DataNascimento,
            beneficiario.Status,
            beneficiario.PlanoId,
            beneficiario.DataCadastro);
}

public sealed record PaginaBeneficiariosResponse(
    IReadOnlyList<BeneficiarioResponse> Dados,
    int Pagina,
    int Tamanho,
    int Total)
{
    public static PaginaBeneficiariosResponse De(PaginaDeBeneficiarios pagina) =>
        new(
            pagina.Dados.Select(BeneficiarioResponse.De).ToList(),
            pagina.Pagina,
            pagina.Tamanho,
            pagina.Total);
}