"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Requisicao = exports.StatusRequisicao = void 0;
var typeorm_1 = require("typeorm");
var User_1 = require("./User");
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
var Requisicao = function () {
    var _classDecorators = [(0, typeorm_1.Entity)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _numeroRequisicao_decorators;
    var _numeroRequisicao_initializers = [];
    var _numeroRequisicao_extraInitializers = [];
    var _solicitante_decorators;
    var _solicitante_initializers = [];
    var _solicitante_extraInitializers = [];
    var _areaSolicitante_decorators;
    var _areaSolicitante_initializers = [];
    var _areaSolicitante_extraInitializers = [];
    var _dataCriacao_decorators;
    var _dataCriacao_initializers = [];
    var _dataCriacao_extraInitializers = [];
    var _dataUltimaAtualizacao_decorators;
    var _dataUltimaAtualizacao_initializers = [];
    var _dataUltimaAtualizacao_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _urgencia_decorators;
    var _urgencia_initializers = [];
    var _urgencia_extraInitializers = [];
    var _itens_decorators;
    var _itens_initializers = [];
    var _itens_extraInitializers = [];
    var _observacoes_decorators;
    var _observacoes_initializers = [];
    var _observacoes_extraInitializers = [];
    var _justificativaRejeicao_decorators;
    var _justificativaRejeicao_initializers = [];
    var _justificativaRejeicao_extraInitializers = [];
    var _comentarioGestorDADM_decorators;
    var _comentarioGestorDADM_initializers = [];
    var _comentarioGestorDADM_extraInitializers = [];
    var _comentarioAdmin_decorators;
    var _comentarioAdmin_initializers = [];
    var _comentarioAdmin_extraInitializers = [];
    var _comentarioAprovacao_decorators;
    var _comentarioAprovacao_initializers = [];
    var _comentarioAprovacao_extraInitializers = [];
    var _lastActionBy_decorators;
    var _lastActionBy_initializers = [];
    var _lastActionBy_extraInitializers = [];
    var _lastActionRole_decorators;
    var _lastActionRole_initializers = [];
    var _lastActionRole_extraInitializers = [];
    var _responsavelProcessamentoId_decorators;
    var _responsavelProcessamentoId_initializers = [];
    var _responsavelProcessamentoId_extraInitializers = [];
    var _fornecedorSugestaoId_decorators;
    var _fornecedorSugestaoId_initializers = [];
    var _fornecedorSugestaoId_extraInitializers = [];
    var Requisicao = _classThis = /** @class */ (function () {
        function Requisicao_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.numeroRequisicao = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _numeroRequisicao_initializers, void 0));
            this.solicitante = (__runInitializers(this, _numeroRequisicao_extraInitializers), __runInitializers(this, _solicitante_initializers, void 0));
            this.areaSolicitante = (__runInitializers(this, _solicitante_extraInitializers), __runInitializers(this, _areaSolicitante_initializers, void 0));
            this.dataCriacao = (__runInitializers(this, _areaSolicitante_extraInitializers), __runInitializers(this, _dataCriacao_initializers, void 0));
            this.dataUltimaAtualizacao = (__runInitializers(this, _dataCriacao_extraInitializers), __runInitializers(this, _dataUltimaAtualizacao_initializers, void 0));
            this.status = (__runInitializers(this, _dataUltimaAtualizacao_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.urgencia = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _urgencia_initializers, void 0));
            this.itens = (__runInitializers(this, _urgencia_extraInitializers), __runInitializers(this, _itens_initializers, void 0));
            this.observacoes = (__runInitializers(this, _itens_extraInitializers), __runInitializers(this, _observacoes_initializers, void 0));
            this.justificativaRejeicao = (__runInitializers(this, _observacoes_extraInitializers), __runInitializers(this, _justificativaRejeicao_initializers, void 0));
            this.comentarioGestorDADM = (__runInitializers(this, _justificativaRejeicao_extraInitializers), __runInitializers(this, _comentarioGestorDADM_initializers, void 0));
            this.comentarioAdmin = (__runInitializers(this, _comentarioGestorDADM_extraInitializers), __runInitializers(this, _comentarioAdmin_initializers, void 0));
            this.comentarioAprovacao = (__runInitializers(this, _comentarioAdmin_extraInitializers), __runInitializers(this, _comentarioAprovacao_initializers, void 0));
            this.lastActionBy = (__runInitializers(this, _comentarioAprovacao_extraInitializers), __runInitializers(this, _lastActionBy_initializers, void 0));
            this.lastActionRole = (__runInitializers(this, _lastActionBy_extraInitializers), __runInitializers(this, _lastActionRole_initializers, void 0));
            // ...existing code...
            this.responsavelProcessamentoId = (__runInitializers(this, _lastActionRole_extraInitializers), __runInitializers(this, _responsavelProcessamentoId_initializers, void 0));
            this.fornecedorSugestaoId = (__runInitializers(this, _responsavelProcessamentoId_extraInitializers), __runInitializers(this, _fornecedorSugestaoId_initializers, void 0));
            __runInitializers(this, _fornecedorSugestaoId_extraInitializers);
        }
        return Requisicao_1;
    }());
    __setFunctionName(_classThis, "Requisicao");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _numeroRequisicao_decorators = [(0, typeorm_1.Column)({ unique: true })];
        _solicitante_decorators = [(0, typeorm_1.ManyToOne)(function () { return User_1.User; })];
        _areaSolicitante_decorators = [(0, typeorm_1.Column)()];
        _dataCriacao_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _dataUltimaAtualizacao_decorators = [(0, typeorm_1.UpdateDateColumn)({ nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)({ type: "enum", enum: StatusRequisicao, default: StatusRequisicao.PENDENTE })];
        _urgencia_decorators = [(0, typeorm_1.Column)()];
        _itens_decorators = [(0, typeorm_1.Column)("jsonb")];
        _observacoes_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _justificativaRejeicao_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _comentarioGestorDADM_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _comentarioAdmin_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _comentarioAprovacao_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _lastActionBy_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _lastActionRole_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _responsavelProcessamentoId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fornecedorSugestaoId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _numeroRequisicao_decorators, { kind: "field", name: "numeroRequisicao", static: false, private: false, access: { has: function (obj) { return "numeroRequisicao" in obj; }, get: function (obj) { return obj.numeroRequisicao; }, set: function (obj, value) { obj.numeroRequisicao = value; } }, metadata: _metadata }, _numeroRequisicao_initializers, _numeroRequisicao_extraInitializers);
        __esDecorate(null, null, _solicitante_decorators, { kind: "field", name: "solicitante", static: false, private: false, access: { has: function (obj) { return "solicitante" in obj; }, get: function (obj) { return obj.solicitante; }, set: function (obj, value) { obj.solicitante = value; } }, metadata: _metadata }, _solicitante_initializers, _solicitante_extraInitializers);
        __esDecorate(null, null, _areaSolicitante_decorators, { kind: "field", name: "areaSolicitante", static: false, private: false, access: { has: function (obj) { return "areaSolicitante" in obj; }, get: function (obj) { return obj.areaSolicitante; }, set: function (obj, value) { obj.areaSolicitante = value; } }, metadata: _metadata }, _areaSolicitante_initializers, _areaSolicitante_extraInitializers);
        __esDecorate(null, null, _dataCriacao_decorators, { kind: "field", name: "dataCriacao", static: false, private: false, access: { has: function (obj) { return "dataCriacao" in obj; }, get: function (obj) { return obj.dataCriacao; }, set: function (obj, value) { obj.dataCriacao = value; } }, metadata: _metadata }, _dataCriacao_initializers, _dataCriacao_extraInitializers);
        __esDecorate(null, null, _dataUltimaAtualizacao_decorators, { kind: "field", name: "dataUltimaAtualizacao", static: false, private: false, access: { has: function (obj) { return "dataUltimaAtualizacao" in obj; }, get: function (obj) { return obj.dataUltimaAtualizacao; }, set: function (obj, value) { obj.dataUltimaAtualizacao = value; } }, metadata: _metadata }, _dataUltimaAtualizacao_initializers, _dataUltimaAtualizacao_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _urgencia_decorators, { kind: "field", name: "urgencia", static: false, private: false, access: { has: function (obj) { return "urgencia" in obj; }, get: function (obj) { return obj.urgencia; }, set: function (obj, value) { obj.urgencia = value; } }, metadata: _metadata }, _urgencia_initializers, _urgencia_extraInitializers);
        __esDecorate(null, null, _itens_decorators, { kind: "field", name: "itens", static: false, private: false, access: { has: function (obj) { return "itens" in obj; }, get: function (obj) { return obj.itens; }, set: function (obj, value) { obj.itens = value; } }, metadata: _metadata }, _itens_initializers, _itens_extraInitializers);
        __esDecorate(null, null, _observacoes_decorators, { kind: "field", name: "observacoes", static: false, private: false, access: { has: function (obj) { return "observacoes" in obj; }, get: function (obj) { return obj.observacoes; }, set: function (obj, value) { obj.observacoes = value; } }, metadata: _metadata }, _observacoes_initializers, _observacoes_extraInitializers);
        __esDecorate(null, null, _justificativaRejeicao_decorators, { kind: "field", name: "justificativaRejeicao", static: false, private: false, access: { has: function (obj) { return "justificativaRejeicao" in obj; }, get: function (obj) { return obj.justificativaRejeicao; }, set: function (obj, value) { obj.justificativaRejeicao = value; } }, metadata: _metadata }, _justificativaRejeicao_initializers, _justificativaRejeicao_extraInitializers);
        __esDecorate(null, null, _comentarioGestorDADM_decorators, { kind: "field", name: "comentarioGestorDADM", static: false, private: false, access: { has: function (obj) { return "comentarioGestorDADM" in obj; }, get: function (obj) { return obj.comentarioGestorDADM; }, set: function (obj, value) { obj.comentarioGestorDADM = value; } }, metadata: _metadata }, _comentarioGestorDADM_initializers, _comentarioGestorDADM_extraInitializers);
        __esDecorate(null, null, _comentarioAdmin_decorators, { kind: "field", name: "comentarioAdmin", static: false, private: false, access: { has: function (obj) { return "comentarioAdmin" in obj; }, get: function (obj) { return obj.comentarioAdmin; }, set: function (obj, value) { obj.comentarioAdmin = value; } }, metadata: _metadata }, _comentarioAdmin_initializers, _comentarioAdmin_extraInitializers);
        __esDecorate(null, null, _comentarioAprovacao_decorators, { kind: "field", name: "comentarioAprovacao", static: false, private: false, access: { has: function (obj) { return "comentarioAprovacao" in obj; }, get: function (obj) { return obj.comentarioAprovacao; }, set: function (obj, value) { obj.comentarioAprovacao = value; } }, metadata: _metadata }, _comentarioAprovacao_initializers, _comentarioAprovacao_extraInitializers);
        __esDecorate(null, null, _lastActionBy_decorators, { kind: "field", name: "lastActionBy", static: false, private: false, access: { has: function (obj) { return "lastActionBy" in obj; }, get: function (obj) { return obj.lastActionBy; }, set: function (obj, value) { obj.lastActionBy = value; } }, metadata: _metadata }, _lastActionBy_initializers, _lastActionBy_extraInitializers);
        __esDecorate(null, null, _lastActionRole_decorators, { kind: "field", name: "lastActionRole", static: false, private: false, access: { has: function (obj) { return "lastActionRole" in obj; }, get: function (obj) { return obj.lastActionRole; }, set: function (obj, value) { obj.lastActionRole = value; } }, metadata: _metadata }, _lastActionRole_initializers, _lastActionRole_extraInitializers);
        __esDecorate(null, null, _responsavelProcessamentoId_decorators, { kind: "field", name: "responsavelProcessamentoId", static: false, private: false, access: { has: function (obj) { return "responsavelProcessamentoId" in obj; }, get: function (obj) { return obj.responsavelProcessamentoId; }, set: function (obj, value) { obj.responsavelProcessamentoId = value; } }, metadata: _metadata }, _responsavelProcessamentoId_initializers, _responsavelProcessamentoId_extraInitializers);
        __esDecorate(null, null, _fornecedorSugestaoId_decorators, { kind: "field", name: "fornecedorSugestaoId", static: false, private: false, access: { has: function (obj) { return "fornecedorSugestaoId" in obj; }, get: function (obj) { return obj.fornecedorSugestaoId; }, set: function (obj, value) { obj.fornecedorSugestaoId = value; } }, metadata: _metadata }, _fornecedorSugestaoId_initializers, _fornecedorSugestaoId_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Requisicao = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Requisicao = _classThis;
}();
exports.Requisicao = Requisicao;
