using Desafio.Api.Dominio.Entidades;

namespace Desafio.Api.Aplicacao.Repositorios;

// Contrato que inverte a dependência (Clean Architecture): a aplicação depende desta
// interface, não de AppDbContext/EF/Npgsql. A implementação vive em
// Infraestrutura/Persistence/Repositorios.
public interface IPlanoRepositorio
{
    Task<IReadOnlyList<Plano>> ListarAsync(CancellationToken cancellationToken);

    Task<Plano?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> ExistePorIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Plano?> ObterConflitanteAsync(Plano plano, CancellationToken cancellationToken);

    Task AdicionarAsync(Plano plano, CancellationToken cancellationToken);

    Task SalvarAsync(CancellationToken cancellationToken);
}