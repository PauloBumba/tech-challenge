using Desafio.Api.Dominio.Enums;

namespace Desafio.Api.Aplicacao.Contratos;

public sealed record BeneficiarioFiltro(
    int? Pagina,
    int? Tamanho,
    StatusBeneficiario? Status,
    Guid? PlanoId);