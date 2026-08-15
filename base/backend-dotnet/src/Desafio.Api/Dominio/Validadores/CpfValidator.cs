using System.Linq;
using System.Text.RegularExpressions;

namespace Desafio.Api.Dominio.Validadores;

public static class CpfValidator
{
    private static readonly Regex CpfRegex = new("^[0-9]{11}$", RegexOptions.Compiled);

    public static bool Validar(string cpf)
    {
        // Verifica formato: exatamente 11 dígitos numéricos
        if (!CpfRegex.IsMatch(cpf))
        {
            return false;
        }

        // Rejeita sequências de dígitos repetidos (00000000000, 11111111111, etc.)
        if (TodosDigitosIguais(cpf))
        {
            return false;
        }

        // Valida os dois dígitos verificadores
        // Os dígitos verificadores estão nas posições 9 e 10 (0-based)
        var primeiroDigito = CalcularDigitoVerificador(cpf.Substring(0, 9), 10);
        var segundoDigito = CalcularDigitoVerificador(cpf.Substring(0, 10), 11);

        return primeiroDigito == int.Parse(cpf[9].ToString()) &&
               segundoDigito == int.Parse(cpf[10].ToString());
    }

    // Verifica se todos os 11 dígitos são iguais (sequências repetidas)
    private static bool TodosDigitosIguais(string cpf)
    {
        var primeiro = cpf[0];
        return cpf.All(d => d == primeiro);
    }

    // Calcula o dígito verificador usando o algoritmo oficial do CPF brasileiro
    // peso começa em 10 para o primeiro dígito, 11 para o segundo
    private static int CalcularDigitoVerificador(string cpf, int pesoInicial)
    {
        var soma = 0;
        var peso = pesoInicial;

        for (var i = 0; i < cpf.Length; i++)
        {
            soma += int.Parse(cpf[i].ToString()) * peso;
            peso--;
        }

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
