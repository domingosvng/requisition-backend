// src/models/IUtilizador.ts

/**
 * Interface que define a estrutura de um Utilizador no sistema.
 */
export interface IUtilizador {
  id?: string; // Opcional, será gerado pela base de dados
  nome: string;
  email: string;
  senha: string; // Em produção, a senha deve ser hash (criptografada) e nunca armazenada em texto simples.
  area: string; // Ex: "DADM", "RH", "TI", "Logística"
  cargo: string; // Ex: "Gestor", "Colaborador", "Administrador"
  dataRegisto?: Date; // Opcional, data de criação do utilizador
  ativo?: boolean; // Opcional, se o utilizador está ativo no sistema
}

// Exemplo de uso (não adicione ao ficheiro, apenas para demonstração):
// const novoUtilizador: IUtilizador = {
//   nome: "João Fernando",
//   email: "joao.fernando@empresa.com",
//   senha: "senhaSegura123", // Lembre-se do hash em produção!
//   area: "TI",
//   cargo: "Colaborador",
// };