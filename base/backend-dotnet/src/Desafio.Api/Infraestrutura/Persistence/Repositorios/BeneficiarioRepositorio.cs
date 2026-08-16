using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Aplicacao.Repositorios;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Excecoes;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Desafio.Api.Infraestrutura.Persistence.Repositorios;

public class BeneficiarioRepositorio(AppDbContext db) : IBeneficiarioRepositorio
{
    private const string CodigoViolacaoDeUnicidade = "23505";

    // Sem AsNoTracking de propósito, como PlanoRepositorio.ObterPorIdAsync: o registro
    // retornado é usado também por AtualizarAsync/ExcluirAsync, que precisam de entidade rastreada.
    public async Task<Beneficiario?> ObterPorIdAsync(Guid id, CancellationToken cancellationToken) =>
        await db.Beneficiarios.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

    // O CPF de um beneficiário excluído continua ocupado (SPEC 2.3), por isso a verificação
    // ignora o filtro de consulta que esconde registros logicamente excluídos.
    public async Task<Beneficiario?> ObterPorCpfIncluindoExcluidosAsync(string cpf, CancellationToken cancellationToken) =>
        await db.Beneficiarios
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(b => b.Cpf == cpf)
            .FirstOrDefaultAsync(cancellationToken);

    public Task AdicionarAsync(Beneficiario beneficiario, CancellationToken cancellationToken)
    {
        db.Beneficiarios.Add(beneficiario);
        return Task.CompletedTask;
    }

    // A violação do índice único (23505) vira ConflitoException (409): a garantia real de
    // unicidade é o índice no banco, que serializa escritas concorrentes — a checagem
    // aplicacional (ObterPorCpfIncluindoExcluidosAsync) não elimina a corrida.
    public async Task SalvarAsync(CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException excecao) when (EhViolacaoDeUnicidade(excecao))
        {
            throw new ConflitoException("Já existe beneficiário cadastrado com esse CPF");
        }
    }

    public async Task<PaginaDeBeneficiarios> ListarAsync(
        BeneficiarioFiltro filtro,
        int pagina,
        int tamanho,
        CancellationToken cancellationToken)
    {
        var consulta = db.Beneficiarios.AsNoTracking();

        if (filtro.Status is not null)
        {
            consulta = consulta.Where(b => b.Status == filtro.Status);
        }

        if (filtro.PlanoId is not null)
        {
            consulta = consulta.Where(b => b.PlanoId == filtro.PlanoId);
        }

        var total = await consulta.CountAsync(cancellationToken);

        // data_cadastro + id como desempate garantem paginação estável (DECISIONS.md):
        // percorrer todas as páginas nunca repete nem perde registro.
        var lista = await consulta
            .OrderBy(b => b.DataCadastro)
            .ThenBy(b => b.Id)
            .Skip((pagina - 1) * tamanho)
            .Take(tamanho)
            .ToListAsync(cancellationToken);

        // Os planos são resolvidos em uma única consulta IN — nunca uma por beneficiário
        // (SPEC 3: a quantidade de consultas não pode crescer com o tamanho da página).
        var idsDePlanos = lista.Select(b => b.PlanoId).Distinct().ToList();
        var planos = await db.Planos
            .AsNoTracking()
            .Where(p => idsDePlanos.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        foreach (var b in lista)
        {
            planos.TryGetValue(b.PlanoId, out var plano);
            b.Plano = plano;
        }

        return new PaginaDeBeneficiarios(lista, pagina, tamanho, total);
    }

    private static bool EhViolacaoDeUnicidade(DbUpdateException excecao) =>
        excecao.InnerException is PostgresException postgres &&
        postgres.SqlState == CodigoViolacaoDeUnicidade;
}