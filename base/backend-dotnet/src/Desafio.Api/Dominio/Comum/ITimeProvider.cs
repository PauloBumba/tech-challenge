namespace Desafio.Api.Dominio.Comum;

/// <summary>
/// Abstração para prover o tempo atual. Facilita testes e centraliza lógica de tempo.
/// Segue Clean Architecture: interface no domínio, implementação padrão também no domínio,
/// implementação alternativa na infraestrutura para injeção de dependência.
/// </summary>
public interface ITimeProvider
{
    DateTime UtcNow { get; }
}

/// <summary>
/// Implementação padrão que usa DateTime.UtcNow do sistema.
/// Usada por padrão no domínio. Para testes, injetar uma implementação mock.
/// </summary>
public sealed class SystemTimeProvider : ITimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
