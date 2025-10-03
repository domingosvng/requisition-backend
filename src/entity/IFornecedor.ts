// src/models/IFornecedor.ts

/**
 * Interface que define a estrutura de um Fornecedor.
 */
export interface IFornecedor {
  id?: string; // Opcional, será gerado pela base de dados
  nome: string; // Nome da empresa fornecedora
  contactoPrincipal: string; // Nome da pessoa de contacto na empresa
  email: string;
  telefone: string;
  nif: string; // Número de Identificação Fiscal
  endereco: string;
  servicosFornecidos: string[]; // Ex: ["Material de Escritório", "Equipamento TI", "Manutenção"]
  dataRegisto?: Date; // Opcional, data de adição do fornecedor ao sistema
  ativo?: boolean; // Opcional, se o fornecedor está ativo/aprovado
}