"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requisicao = exports.StatusRequisicao = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var StatusRequisicao;
(function (StatusRequisicao) {
    StatusRequisicao["PENDENTE"] = "PENDENTE";
    StatusRequisicao["AGUARDANDO_APROV_FINAL"] = "AGUARDANDO_APROV_FINAL";
    StatusRequisicao["APROVADA_GERENCIA"] = "APROVADA_GERENCIA";
    StatusRequisicao["APROVADA"] = "APROVADA";
    StatusRequisicao["REJEITADA"] = "REJEITADA";
    StatusRequisicao["EM_PROCESSAMENTO"] = "EM_PROCESSAMENTO";
    StatusRequisicao["CONCLUIDA"] = "CONCLUIDA";
})(StatusRequisicao || (exports.StatusRequisicao = StatusRequisicao = {}));
let Requisicao = class Requisicao {
};
exports.Requisicao = Requisicao;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Requisicao.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "numeroRequisicao", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    __metadata("design:type", User_1.User)
], Requisicao.prototype, "solicitante", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Requisicao.prototype, "areaSolicitante", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Requisicao.prototype, "dataCriacao", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], Requisicao.prototype, "dataUltimaAtualizacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: StatusRequisicao, default: StatusRequisicao.PENDENTE }),
    __metadata("design:type", String)
], Requisicao.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Requisicao.prototype, "urgencia", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb"),
    __metadata("design:type", Array)
], Requisicao.prototype, "itens", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "observacoes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "justificativaRejeicao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "comentarioGestorDADM", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "comentarioAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "comentarioAprovacao", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "lastActionBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "lastActionRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "responsavelProcessamentoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Requisicao.prototype, "fornecedorSugestaoId", void 0);
exports.Requisicao = Requisicao = __decorate([
    (0, typeorm_1.Entity)()
    // Represents a requisition in the system.
], Requisicao);
