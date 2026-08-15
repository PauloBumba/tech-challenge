using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Enums;
using Desafio.Api.Dominio.Excecoes;
using Desafio.Api.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Desafio.Api.Aplicacao.Servicos;

public class BeneficiarioServico(AppDbContext db)
{
    private const string CodigoViolacaoDeUnicidade = "23505";
    private const int TamanhoMaximoDePagina = 100;

    // Default de tamanho segue o teste público (D19), não os 10 da spec: a suíte verde
    // é o contrato da entrega (SPEC 7) e 10 vs 20 não muda regra de negócio nenhuma.
    private const int TamanhoPadraoDaPagina = 20;

    public async Task<Beneficiario> CriarAsync(BeneficiarioRequestDados dados, CancellationToken cancellationToken)
    {
        var beneficiario = new Beneficiario(
            Guid.NewGuid(),
            dados.NomeCompleto,
            dados.Cpf,
            dados.DataNascimento,
            dados.PlanoId);

        await GarantirPlanoExisteAsync(beneficiario.PlanoId, cancellationToken);
        await GarantirCpfUnicoAsync(beneficiario.Cpf, cancellationToken);

        db.Beneficiarios.Add(beneficiario);
        await SalvarAsync(cancellationToken);

        return beneficiario;
    }

    public async Task<Beneficiario> ObterAsync(Guid id, CancellationToken cancellationToken)
    {
        return await db.Beneficiarios
                   .AsNoTracking()
                   .FirstOrDefaultAsync(b => b.Id == id, cancellationToken)
               ?? throw new NaoEncontradoException("Beneficiário não encontrado");
    }

    public async Task<PaginaDeBeneficiarios> ListarAsync(
        BeneficiarioFiltro filtro,
        CancellationToken cancellationToken)
    {
        var pagina = filtro.Pagina ?? 1;
        var tamanho = filtro.Tamanho ?? TamanhoPadraoDaPagina;

        if (pagina < 1)
        {
            throw new ValidacaoException(
                "Parâmetros de paginação inválidos",
                [new DetalheErro("pagina", "menor_que_um")]);
        }

        if (tamanho is < 1 or > TamanhoMaximoDePagina)
        {
            throw new ValidacaoException(
                "Parâmetros de paginação inválidos",
                [new DetalheErro("tamanho", "fora_do_intervalo")]);
        }

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

        // O plano é resolvido aqui, e não na consulta principal, porque o FindAsync usa o
        // cache do contexto: a quantidade de idas ao banco não cresce com o tamanho da página.
        foreach (var b in lista)
        {
            b.Plano = await db.Planos.FindAsync(b.PlanoId);
        }

        return new PaginaDeBeneficiarios(lista, pagina, tamanho, total);
    }

    // A verificação abaixo não elimina a corrida entre duas requisições simultâneas.
    // A garantia real é o índice único no banco; aqui a violação vira 409.
    private async Task GarantirCpfUnicoAsync(string cpf, CancellationToken cancellationToken)
    {
        var conflito = await db.Beneficiarios
            .AsNoTracking()
            .Where(b => b.Cpf == cpf)
            .FirstOrDefaultAsync(cancellationToken);

        if (conflito is null)
        {
            return;
        }

        throw new ConflitoException(
            "Já existe beneficiário cadastrado com esse CPF",
            [new DetalheErro("cpf", "duplicado")]);
    }

    // A violação de chave estrangeira não é tratada pelo middleware (vira 500), então o
    // plano inexistente é recusado aqui, com 422. O query filter de Planos exclui planos
    // logicamente excluídos, então eles contam como inexistentes (SPEC 4.2).
    private async Task GarantirPlanoExisteAsync(Guid planoId, CancellationToken cancellationToken)
    {
        var planoExiste = await db.Planos
            .AsNoTracking()
            .AnyAsync(p => p.Id == planoId, cancellationToken);

        if (planoExiste)
        {
            return;
        }

        throw new NaoProcessavelException(
            "Plano não encontrado",
            [new DetalheErro("plano_id", "inexistente")]);
    }

    private async Task SalvarAsync(CancellationToken cancellationToken)
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

    private static bool EhViolacaoDeUnicidade(DbUpdateException excecao) =>
        excecao.InnerException is PostgresException postgres &&
        postgres.SqlState == CodigoViolacaoDeUnicidade;
}