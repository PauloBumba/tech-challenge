using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Aplicacao.Repositorios;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Enums;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Aplicacao.Servicos;

public class BeneficiarioServico(
    IBeneficiarioRepositorio beneficiarios,
    IPlanoRepositorio planos)
{
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

        await beneficiarios.AdicionarAsync(beneficiario, cancellationToken);
        await beneficiarios.SalvarAsync(cancellationToken);

        return beneficiario;
    }

    // Sem AsNoTracking de propósito, como PlanoServico.ObterAsync: o registro retornado aqui
    // é usado também por AtualizarAsync, que precisa de entidade rastreada para persistir.
    public async Task<Beneficiario> ObterAsync(Guid id, CancellationToken cancellationToken) =>
        await beneficiarios.ObterPorIdAsync(id, cancellationToken)
        ?? throw new NaoEncontradoException("Beneficiário não encontrado");

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

        await beneficiarios.SalvarAsync(cancellationToken);

        return beneficiario;
    }

    public async Task ExcluirAsync(Guid id, CancellationToken cancellationToken)
    {
        var beneficiario = await ObterAsync(id, cancellationToken);

        beneficiario.Excluir();
        await beneficiarios.SalvarAsync(cancellationToken);
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

        return await beneficiarios.ListarAsync(filtro, pagina, tamanho, cancellationToken);
    }

    // A verificação abaixo não elimina a corrida entre duas requisições simultâneas.
    // A garantia real é o índice único no banco; aqui a violação vira 409 (no SalvarAsync
    // do repositório). O CPF de um beneficiário excluído continua ocupado (SPEC 2.3), por
    // isso a consulta vem do repositório, que ignora o filtro de exclusão lógica.
    private async Task GarantirCpfUnicoAsync(string cpf, CancellationToken cancellationToken)
    {
        var conflito = await beneficiarios.ObterPorCpfIncluindoExcluidosAsync(cpf, cancellationToken);

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
        if (await planos.ExistePorIdAsync(planoId, cancellationToken))
        {
            return;
        }

        throw new NaoProcessavelException(
            "Plano não encontrado",
            [new DetalheErro("plano_id", "inexistente")]);
    }
}