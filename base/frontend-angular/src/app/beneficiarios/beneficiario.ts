export type StatusBeneficiario = 'ATIVO' | 'INATIVO';

export interface Beneficiario {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  status: StatusBeneficiario;
  plano_id: string;
  data_cadastro: string;
}

export interface PaginaDeBeneficiarios {
  dados: Beneficiario[];
  pagina: number;
  tamanho: number;
  total: number;
}