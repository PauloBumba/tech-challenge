import { ValidatorFn } from '@angular/forms';

import { cpfValido } from './cpf';

/** O CPF precisa ser válido (formato + dígitos verificadores). */
export function cpfFormatoValido(): ValidatorFn {
  return (controle) =>
    cpfValido(controle.value ?? '') ? null : { cpf_invalido: true };
}

/** Data de nascimento precisa estar no passado. */
export function dataNoPassado(): ValidatorFn {
  return (controle) => {
    const valor = controle.value;
    if (!valor) {
      return null;
    }

    const hoje = new Date().toISOString().slice(0, 10);
    return valor > hoje ? { data_futura: true } : null;
  };
}