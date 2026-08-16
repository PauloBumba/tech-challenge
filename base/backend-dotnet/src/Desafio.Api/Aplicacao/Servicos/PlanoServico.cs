using Desafio.Api.Aplicacao.Contratos;
using Desafio.Api.Aplicacao.Repositorios;
using Desafio.Api.Dominio.Entidades;
using Desafio.Api.Dominio.Excecoes;

namespace Desafio.Api.Aplicacao.Servicos;

public class PlanoServico(IPlanoRepositorio planos)
{
    public async Task<IReadOnlyList<Plano>> ListarAsync(CancellationToken cancellationToken) =>
        await planos.ListarAsync(cancellationToken);

    public async Task<Plano> ObterAsync(Guid id, CancellationToken cancellationToken) =>
        await planos.ObterPorIdAsync(id, cancellationToken)
        ?? throw new NaoEncontradoException("Plano não encontrado");

    public async Task<Plano> CriarAsync(PlanoRequestDados dados, CancellationToken cancellationToken)
    {
        var plano = new Plano(dados.Nome, dados.CodigoRegistroAns);

        await GarantirUnicidadeAsync(plano, cancellationToken);
        await planos.AdicionarAsync(plano, cancellationToken);
        await planos.SalvarAsync(cancellationToken);

        return plano;
    }

    public async Task<Plano> AtualizarAsync(Guid id, PlanoRequestDados dados, CancellationToken cancellationToken)
    {
        var plano = await ObterAsync(id, cancellationToken);

        plano.DefinirDados(dados.Nome, dados.CodigoRegistroAns);
        await GarantirUnicidadeAsync(plano, cancellationToken);
        await planos.SalvarAsync(cancellationToken);

        return plano;
    }

    public async Task ExcluirAsync(Guid id, CancellationToken cancellationToken)
    {
        var plano = await ObterAsync(id, cancellationToken);

        plano.Excluir();
        await planos.SalvarAsync(cancellationToken);
    }

    // Nome e código de registro ANS continuam ocupados depois da exclusão lógica, por isso
    // a consulta de conflito vem do repositório (que ignora o filtro de consulta).
    private async Task GarantirUnicidadeAsync(Plano plano, CancellationToken cancellationToken)
    {
        var conflito = await planos.ObterConflitanteAsync(plano, cancellationToken);

        if (conflito is null)
        {
            return;
        }

        var campo = conflito.Nome == plano.Nome ? "nome" : "codigo_registro_ans";
        throw new ConflitoException(
            "Já existe plano cadastrado com esse valor",
            [new DetalheErro(campo, "duplicado")]);
    }
}