using Desafio.Api.Aplicacao.Repositorios;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Excecoes;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Desafio.Api.Infraestrutura.Persistence.Repositorios;

public class PlanoRepositorio(AppDbContext db) : IPlanoRepositorio
{
    private const string CodigoViolacaoDeUnicidade = "23505";

    public async Task<IReadOnlyList<Plano>> ListarAsync(CancellationToken cancellationToken) =>
        await db.Planos.AsNoTracking().OrderBy(p => p.Nome).ToListAsync(cancellationToken);

    // Sem AsNoTracking de propósito, como PlanoServico.ObterAsync antes da inversão: o
    // registro retornado é usado também por AtualizarAsync, que precisa de entidade rastreada.
    public async Task<Plano?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Planos.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    // O query filter de Planos exclui logicamente excluídos, então eles contam como
    // inexistentes para novos vínculos (SPEC 4.2).
    public async Task<bool> ExistePorIdAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Planos.AsNoTracking().AnyAsync(p => p.Id == id, cancellationToken);

    // Nome e código de registro ANS continuam ocupados depois da exclusão lógica (SPEC 2.3),
    // por isso a verificação ignora o filtro de consulta que esconde registros excluídos.
    public async Task<Plano?> ObterConflitanteAsync(Plano plano, CancellationToken cancellationToken) =>
        await db.Planos
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(p => p.Id != plano.Id)
            .Where(p => p.Nome == plano.Nome || p.CodigoRegistroAns == plano.CodigoRegistroAns)
            .FirstOrDefaultAsync(cancellationToken);

    public Task AdicionarAsync(Plano plano, CancellationToken cancellationToken)
    {
        db.Planos.Add(plano);
        return Task.CompletedTask;
    }

    // A violação do índice único (23505) vira ConflitoException (409): a garantia real de
    // unicidade é o índice no banco, que serializa escritas concorrentes — a checagem
    // aplicacional (ObterConflitanteAsync) não elimina a corrida entre duas requisições.
    public async Task SalvarAsync(CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException excecao) when (EhViolacaoDeUnicidade(excecao))
        {
            throw new ConflitoException("Já existe plano cadastrado com esse valor");
        }
    }

    private static bool EhViolacaoDeUnicidade(DbUpdateException excecao) =>
        excecao.InnerException is PostgresException postgres &&
        postgres.SqlState == CodigoViolacaoDeUnicidade;
}