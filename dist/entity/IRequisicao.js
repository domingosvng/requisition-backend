"use strict";
// src/models/IRequisicao.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusRequisicao = void 0;
/**
 * Enum para definir os possíveis estados de uma Requisição.
 */
var StatusRequisicao;
(function (StatusRequisicao) {
    StatusRequisicao["PENDENTE"] = "Pendente";
    StatusRequisicao["EM_APROVACAO"] = "Em Aprova\u00E7\u00E3o";
    StatusRequisicao["APROVADA"] = "Aprovada";
    StatusRequisicao["REJEITADA"] = "Rejeitada";
    StatusRequisicao["EM_PROCESSAMENTO"] = "Em Processamento";
    StatusRequisicao["CONCLUIDA"] = "Conclu\u00EDda";
    StatusRequisicao["CANCELADA"] = "Cancelada";
    StatusRequisicao["AGUARDANDO_FORNECEDOR"] = "Aguardando Fornecedor";
})(StatusRequisicao || (exports.StatusRequisicao = StatusRequisicao = {}));
