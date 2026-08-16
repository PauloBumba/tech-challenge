using Desafio.Api.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Desafio.Api.Infraestrutura.Persistence.Configuracoes;

// Fluent API de Beneficiario em arquivo próprio (SOLID/SRP) — ver PlanoConfiguration.
public class BeneficiarioConfiguration : IEntityTypeConfiguration<Beneficiario>
{
    public void Configure(EntityTypeBuilder<Beneficiario> entidade)
    {
        entidade.HasKey(b => b.Id);
        entidade.Property(b => b.NomeCompleto).HasMaxLength(120).IsRequired();
        entidade.Property(b => b.Cpf).HasMaxLength(11).IsRequired();
        entidade.HasIndex(b => b.Cpf).IsUnique();
        entidade.Property(b => b.Status).HasConversion<string>().HasMaxLength(10).IsRequired();
        entidade.HasOne(b => b.Plano)
            .WithMany()
            .HasForeignKey(b => b.PlanoId)
            .OnDelete(DeleteBehavior.Restrict);
        entidade.HasQueryFilter(b => b.ExcluidoEm == null);
    }
}