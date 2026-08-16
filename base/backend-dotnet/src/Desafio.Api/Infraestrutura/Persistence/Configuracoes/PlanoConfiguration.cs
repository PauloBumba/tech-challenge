using Desafio.Api.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Desafio.Api.Infraestrutura.Persistence.Configuracoes;

// Fluent API de Plano em arquivo próprio (SOLID/SRP): cada entidade configura a própria
// tabela, em vez de tudo dentro de AppDbContext.OnModelCreating. O OnModelCreating só
// descobre os mapeamentos via ApplyConfigurationsFromAssembly.
public class PlanoConfiguration : IEntityTypeConfiguration<Plano>
{
    public void Configure(EntityTypeBuilder<Plano> entidade)
    {
        entidade.HasKey(p => p.Id);
        entidade.Property(p => p.Nome).HasMaxLength(60).IsRequired();
        entidade.Property(p => p.CodigoRegistroAns).HasMaxLength(6).IsRequired();
        entidade.HasIndex(p => p.Nome).IsUnique();
        entidade.HasIndex(p => p.CodigoRegistroAns).IsUnique();
        entidade.HasQueryFilter(p => p.ExcluidoEm == null);
    }
}