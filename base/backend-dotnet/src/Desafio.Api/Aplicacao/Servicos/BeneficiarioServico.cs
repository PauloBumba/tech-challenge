using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Enums;
using Desafio.Api.Dominio.Excecoes;
using Desafio.Api.Infraestrutura.Persistence;
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

    // Sem AsNoTracking de propósito, como PlanoServico.ObterAsync: o registro retornado aqui
    // é usado também por AtualizarAsync, que precisa de entidade rastreada para persistir.
    public async Task<Beneficiario> ObterAsync(Guid id, CancellationToken cancellationToken)
    {
        return await db.Beneficiarios.FirstOrDefaultAsync(b => b.Id == id, cancellationToken)
               ?? throw new NaoEncontradoException("Beneficiário não encontrado");
    }

    public async Task<Beneficiario> AtualizarAsync(
        Guid id,
        BeneficiarioRequestDados dados,
        CancellationToken cancellationToken)
    {
        var beneficiario = await ObterAsync(id, cancellationToken);

        if (dados.PlanoId is not null)
        {
            await GarantirPlanoExisteAsync(dados.PlanoId.Value, cancellationToken);
        }

        if (dados.Status is null)
        {
            throw new ValidacaoException(
                "Dados do beneficiário inválidos",
                [new DetalheErro("status", "obrigatorio")]);
        }

        beneficiario.AtualizarDados(
            dados.NomeCompleto,
            dados.DataNascimento,
            dados.PlanoId,
            dados.Status.Value);

        await SalvarAsync(cancellationToken);

        return beneficiario;
    }

    public async Task ExcluirAsync(Guid id, CancellationToken cancellationToken)
    {
        var beneficiario = await ObterAsync(id, cancellationToken);

        beneficiario.Excluir();
        await SalvarAsync(cancellationToken);
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

    // A verificação abaixo não elimina a corrida entre duas requisições simultâneas.
    // A garantia real é o índice único no banco; aqui a violação vira 409.
    // O CPF de um beneficiário excluído continua ocupado (SPEC 2.3), por isso a verificação
    // ignora o filtro de consulta que esconde registros logicamente excluídos.
    private async Task GarantirCpfUnicoAsync(string cpf, CancellationToken cancellationToken)
    {
        var conflito = await db.Beneficiarios
            .IgnoreQueryFilters()
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