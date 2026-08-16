using System.Runtime.CompilerServices;

namespace Desafio.Api.Tests.Unitarios.Aplicacao.Arquitetura;

// A regra de dependência da Clean Architecture: a camada de aplicação não conhece
// frameworks de persistência. Sem projetos separados, o teste lê o fonte — é a
// evidência de que a inversão de dependência realmente aconteceu.
public class RegraDeDependenciaTests
{
    [Fact]
    public void Servicos_da_aplicacao_nao_devem_referenciar_infraestrutura_nem_ef_nem_npgsql()
    {
        var pasta = PastaDosServicos();
        Assert.True(Directory.Exists(pasta), $"Pasta de serviços não encontrada: {pasta}");

        var violacoes = Directory.GetFiles(pasta, "*.cs")
            .SelectMany(arquivo => File.ReadAllLines(arquivo)
                .Select((linha, indice) => (arquivo, indice: indice + 1, linha))
                .Where(item => EhDependenciaExterna(item.linha))
                .Select(item =>
                    $"{Path.GetFileName(item.arquivo)}:{item.indice}: {item.linha.Trim()}"))
            .ToList();

        Assert.True(
            violacoes.Count == 0,
            "Serviços da aplicação não podem referenciar Infraestrutura, EF Core ou Npgsql:"
            + Environment.NewLine
            + string.Join(Environment.NewLine, violacoes));
    }

    private static bool EhDependenciaExterna(string linha)
    {
        var texto = linha.Trim();
        return texto.StartsWith("using Desafio.Api.Infraestrutura", StringComparison.Ordinal)
               || texto.StartsWith("using Microsoft.EntityFrameworkCore", StringComparison.Ordinal)
               || texto.StartsWith("using Npgsql", StringComparison.Ordinal);
    }

    private static string PastaDosServicos([CallerFilePath] string origem = "")
    {
        var pastaDoTeste = Path.GetDirectoryName(origem)
                           ?? throw new InvalidOperationException("CallerFilePath indisponível");

        return Path.GetFullPath(Path.Combine(
            pastaDoTeste,
            "..", "..", "..", "..", "..",
            "src", "Desafio.Api", "Aplicacao", "Servicos"));
    }
}
