// src/models/IRequisicao.ts

// Requisitar um Item (que pode ser do Inventário ou não)
export interface IItemRequisitado {
  itemId?: string; // ID do ItemInventario, se for um item já existente no inventário
  nome: string; // Nome do item ou serviço requisitado
  descricao?: string; // Opcional, detalhes adicionais
  quantidade: number;
  unidadeMedida?: string; // Ex: "unidades", "caixas", "serviços"
  observacoes?: string; // Observações específicas para este item
}

/**
 * Enum para definir os possíveis estados de uma Requisição.
 */
export enum StatusRequisicao {
  PENDENTE = "Pendente",
  EM_APROVACAO = "Em Aprovação",
  APROVADA = "Aprovada",
  REJEITADA = "Rejeitada",
  EM_PROCESSAMENTO = "Em Processamento",
  CONCLUIDA = "Concluída",
  CANCELADA = "Cancelada",
  AGUARDANDO_FORNECEDOR = "Aguardando Fornecedor"
}

/**
 * Interface que define a estrutura de uma Requisição no sistema.
 */
export interface IRequisicao {
  id?: string; // Opcional, será gerado pela base de dados
  numeroRequisicao: string; // Gerado automaticamente, ex: REQ-2025-0001
  solicitanteId: string; // ID do Utilizador que fez a requisição
  areaSolicitante: string; // Área do Utilizador solicitante (Ex: "TI", "RH")
  dataCriacao: Date;
  dataUltimaAtualizacao?: Date; // Opcional, data da última alteração de status
  status: StatusRequisicao; // Usando o enum definido acima
  urgencia: "Baixa" | "Média" | "Alta" | "Urgente";
  itens: IItemRequisitado[]; // Array de itens requisitados
  observacoes?: string; // Opcional, observações gerais sobre a requisição
  justificativaRejeicao?: string; // Opcional, se a requisição for rejeitada
  responsavelProcessamentoId?: string; // Opcional, ID do Utilizador da DADM responsável
  fornecedorSugestaoId?: string; // Opcional, ID de um fornecedor sugerido (se a requisição for para adquirir algo)
}