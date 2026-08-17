/**
 * Validação de CPF no cliente, espelhando o `CpfValidator` do backend
 * (`Dominio/Validadores/CpfValidator.cs`): 11 dígitos, sem sequências repetidas
 * e com os dois dígitos verificadores corretos.
 */

/** Remove qualquer caractere que não seja dígito. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Formata 11 dígitos como 000.000.000-00 para exibição na tela. */
export function formatarCpf(cpf: string): string {
  const digitos = apenasDigitos(cpf);

  if (digitos.length !== 11) {
    return digitos;
  }

  return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function cpfValido(cpf: string): boolean {
  const digitos = apenasDigitos(cpf);

  if (!/^[0-9]{11}$/.test(digitos)) {
    return false;
  }

  if (digitos.split('').every((d) => d === digitos[0])) {
    return false;
  }

  return (
    digitoVerificador(digitos.slice(0, 9), 10) === Number(digitos[9]) &&
    digitoVerificador(digitos.slice(0, 10), 11) === Number(digitos[10])
  );
}

// Algoritmo oficial do CPF: peso começa em 10 (1º dígito) ou 11 (2º dígito) e
// cai até 2; resto < 2 vira 0, senão 11 - resto.
function digitoVerificador(digitos: string, pesoInicial: number): number {
  let soma = 0;
  let peso = pesoInicial;

  for (const digito of digitos) {
    soma += Number(digito) * peso;
    peso--;
  }

  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}