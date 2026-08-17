namespace Desafio.Api.Api.Observabilidade;

/// <summary>
/// Entrada do log estruturado de requisição. Momento em UTC, método, rota (template, não o
/// id concreto), status final e duração em milissegundos.
/// </summary>
public sealed record RegistroDeRequisicaoLog(
    DateTime Momento,
    string Metodo,
    string Rota,
    int Status,
    double DuracaoMilissegundos);