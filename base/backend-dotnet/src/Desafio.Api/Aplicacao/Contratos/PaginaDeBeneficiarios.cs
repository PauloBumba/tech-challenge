using Desafio.Api.Dominio.Entidades;

namespace Desafio.Api.Aplicacao.Contratos;

public sealed record PaginaDeBeneficiarios(
    IReadOnlyList<Beneficiario> Dados,
    int Pagina,
    int Tamanho,
    int Total);