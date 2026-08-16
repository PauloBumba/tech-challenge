using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Dominio.Entidades;

namespace Desafio.Api.Aplicacao.Repositorios;

// Contrato que inverte a dependência (Clean Architecture): a aplicação depende desta
// interface, não de AppDbContext/EF/Npgsql. A implementação vive em
// Infraestrutura/Persistence/Repositorios.
public interface IBeneficiarioRepositorio
{
    Task<Beneficiario?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Beneficiario?> ObterPorCpfIncluindoExcluidosAsync(string cpf, CancellationToken cancellationToken);

    Task AdicionarAsync(Beneficiario beneficiario, CancellationToken cancellationToken);

    Task SalvarAsync(CancellationToken cancellationToken);

    Task<PaginaDeBeneficiarios> ListarAsync(
        BeneficiarioFiltro filtro,
        int pagina,
        int tamanho,
        CancellationToken cancellationToken);
}