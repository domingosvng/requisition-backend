// src/models/IItemInventario.ts

/**
 * Interface que define a estrutura de um Item de Inventário.
 */
export interface IItemInventario {
  id?: string; // Opcional, será gerado pela base de dados
  nome: string;
  descricao?: string; // Opcional
  categoria: string; // Ex: "Mobiliário", "Equipamento TI", "Consumíveis"
  quantidade: number;
  unidadeMedida: string; // Ex: "unidades", "caixas", "metros"
  localizacao: string; // Ex: "Armazém Principal", "Escritório 3B"
  dataEntrada?: Date; // Opcional, data da última entrada de stock
  dataUltimaSaida?: Date; // Opcional, data da última saída de stock
  fornecedorId?: string; // Opcional, ID do fornecedor que forneceu o item
  valorUnitario?: number; // Opcional, custo unitário do item
  status: "Em Stock" | "Baixo Stock" | "Esgotado" | "Descontinuado"; // Estado do item
}