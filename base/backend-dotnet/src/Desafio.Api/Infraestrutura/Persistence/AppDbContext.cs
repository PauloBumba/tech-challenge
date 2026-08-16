using Desafio.Api.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Desafio.Api.Infraestrutura.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Plano> Planos => Set<Plano>();

    public DbSet<Beneficiario> Beneficiarios => Set<Beneficiario>();

    // Cada entidade configura a própria tabela em Persistence/Configuracoes
    // (PlanoConfiguration, BeneficiarioConfiguration). Este método só as descobre.
    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
