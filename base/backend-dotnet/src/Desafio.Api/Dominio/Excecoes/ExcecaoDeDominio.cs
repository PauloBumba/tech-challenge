namespace Desafio.Api.Dominio.Excecoes;

public abstract class ExcecaoDeDominio : Exception
{
    protected ExcecaoDeDominio(string erro, string mensagem, IReadOnlyList<DetalheErro>? detalhes)
        : base(mensagem)
    {
        Erro = erro;
        Detalhes = detalhes ?? [];
    }

    public string Erro { get; }

    public IReadOnlyList<DetalheErro> Detalhes { get; }

    public abstract int StatusCode { get; }
}