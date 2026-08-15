using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Desafio.Api.Infraestrutura;

// Usado apenas pelas ferramentas de linha de comando do EF Core, para gerar migrations
// sem precisar subir a aplicação. Nenhuma credencial vive aqui: a conexão vem sempre da
// variável de ambiente (mesma fonte usada em runtime pelo docker-compose).
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var conexao = Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
                      ?? throw new InvalidOperationException(
                          "Defina a variável de ambiente ConnectionStrings__Postgres. "
                          + "Copie o .env.example (na raiz do repositório) para .env ou exporte "
                          + "a variável antes de rodar o dotnet-ef.");

        var opcoes = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(conexao)
            .Options;

        return new AppDbContext(opcoes);
    }
}
