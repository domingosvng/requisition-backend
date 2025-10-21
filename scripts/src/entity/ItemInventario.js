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
exports.ItemInventario = void 0;
var typeorm_1 = require("typeorm");
var Fornecedor_1 = require("./Fornecedor");
var ItemInventario = function () {
    var _classDecorators = [(0, typeorm_1.Entity)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _nome_decorators;
    var _nome_initializers = [];
    var _nome_extraInitializers = [];
    var _descricao_decorators;
    var _descricao_initializers = [];
    var _descricao_extraInitializers = [];
    var _categoria_decorators;
    var _categoria_initializers = [];
    var _categoria_extraInitializers = [];
    var _quantidade_decorators;
    var _quantidade_initializers = [];
    var _quantidade_extraInitializers = [];
    var _unidadeMedida_decorators;
    var _unidadeMedida_initializers = [];
    var _unidadeMedida_extraInitializers = [];
    var _localizacao_decorators;
    var _localizacao_initializers = [];
    var _localizacao_extraInitializers = [];
    var _dataEntrada_decorators;
    var _dataEntrada_initializers = [];
    var _dataEntrada_extraInitializers = [];
    var _dataUltimaSaida_decorators;
    var _dataUltimaSaida_initializers = [];
    var _dataUltimaSaida_extraInitializers = [];
    var _fornecedor_decorators;
    var _fornecedor_initializers = [];
    var _fornecedor_extraInitializers = [];
    var _valorUnitario_decorators;
    var _valorUnitario_initializers = [];
    var _valorUnitario_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var ItemInventario = _classThis = /** @class */ (function () {
        function ItemInventario_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nome = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nome_initializers, void 0));
            this.descricao = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _descricao_initializers, void 0));
            this.categoria = (__runInitializers(this, _descricao_extraInitializers), __runInitializers(this, _categoria_initializers, void 0));
            this.quantidade = (__runInitializers(this, _categoria_extraInitializers), __runInitializers(this, _quantidade_initializers, void 0));
            this.unidadeMedida = (__runInitializers(this, _quantidade_extraInitializers), __runInitializers(this, _unidadeMedida_initializers, void 0));
            this.localizacao = (__runInitializers(this, _unidadeMedida_extraInitializers), __runInitializers(this, _localizacao_initializers, void 0));
            this.dataEntrada = (__runInitializers(this, _localizacao_extraInitializers), __runInitializers(this, _dataEntrada_initializers, void 0));
            this.dataUltimaSaida = (__runInitializers(this, _dataEntrada_extraInitializers), __runInitializers(this, _dataUltimaSaida_initializers, void 0));
            this.fornecedor = (__runInitializers(this, _dataUltimaSaida_extraInitializers), __runInitializers(this, _fornecedor_initializers, void 0));
            this.valorUnitario = (__runInitializers(this, _fornecedor_extraInitializers), __runInitializers(this, _valorUnitario_initializers, void 0));
            this.status = (__runInitializers(this, _valorUnitario_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            __runInitializers(this, _status_extraInitializers);
        }
        return ItemInventario_1;
    }());
    __setFunctionName(_classThis, "ItemInventario");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _nome_decorators = [(0, typeorm_1.Column)()];
        _descricao_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _categoria_decorators = [(0, typeorm_1.Column)()];
        _quantidade_decorators = [(0, typeorm_1.Column)()];
        _unidadeMedida_decorators = [(0, typeorm_1.Column)()];
        _localizacao_decorators = [(0, typeorm_1.Column)()];
        _dataEntrada_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _dataUltimaSaida_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _fornecedor_decorators = [(0, typeorm_1.ManyToOne)(function () { return Fornecedor_1.Fornecedor; }, { nullable: true })];
        _valorUnitario_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: function (obj) { return "nome" in obj; }, get: function (obj) { return obj.nome; }, set: function (obj, value) { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
        __esDecorate(null, null, _descricao_decorators, { kind: "field", name: "descricao", static: false, private: false, access: { has: function (obj) { return "descricao" in obj; }, get: function (obj) { return obj.descricao; }, set: function (obj, value) { obj.descricao = value; } }, metadata: _metadata }, _descricao_initializers, _descricao_extraInitializers);
        __esDecorate(null, null, _categoria_decorators, { kind: "field", name: "categoria", static: false, private: false, access: { has: function (obj) { return "categoria" in obj; }, get: function (obj) { return obj.categoria; }, set: function (obj, value) { obj.categoria = value; } }, metadata: _metadata }, _categoria_initializers, _categoria_extraInitializers);
        __esDecorate(null, null, _quantidade_decorators, { kind: "field", name: "quantidade", static: false, private: false, access: { has: function (obj) { return "quantidade" in obj; }, get: function (obj) { return obj.quantidade; }, set: function (obj, value) { obj.quantidade = value; } }, metadata: _metadata }, _quantidade_initializers, _quantidade_extraInitializers);
        __esDecorate(null, null, _unidadeMedida_decorators, { kind: "field", name: "unidadeMedida", static: false, private: false, access: { has: function (obj) { return "unidadeMedida" in obj; }, get: function (obj) { return obj.unidadeMedida; }, set: function (obj, value) { obj.unidadeMedida = value; } }, metadata: _metadata }, _unidadeMedida_initializers, _unidadeMedida_extraInitializers);
        __esDecorate(null, null, _localizacao_decorators, { kind: "field", name: "localizacao", static: false, private: false, access: { has: function (obj) { return "localizacao" in obj; }, get: function (obj) { return obj.localizacao; }, set: function (obj, value) { obj.localizacao = value; } }, metadata: _metadata }, _localizacao_initializers, _localizacao_extraInitializers);
        __esDecorate(null, null, _dataEntrada_decorators, { kind: "field", name: "dataEntrada", static: false, private: false, access: { has: function (obj) { return "dataEntrada" in obj; }, get: function (obj) { return obj.dataEntrada; }, set: function (obj, value) { obj.dataEntrada = value; } }, metadata: _metadata }, _dataEntrada_initializers, _dataEntrada_extraInitializers);
        __esDecorate(null, null, _dataUltimaSaida_decorators, { kind: "field", name: "dataUltimaSaida", static: false, private: false, access: { has: function (obj) { return "dataUltimaSaida" in obj; }, get: function (obj) { return obj.dataUltimaSaida; }, set: function (obj, value) { obj.dataUltimaSaida = value; } }, metadata: _metadata }, _dataUltimaSaida_initializers, _dataUltimaSaida_extraInitializers);
        __esDecorate(null, null, _fornecedor_decorators, { kind: "field", name: "fornecedor", static: false, private: false, access: { has: function (obj) { return "fornecedor" in obj; }, get: function (obj) { return obj.fornecedor; }, set: function (obj, value) { obj.fornecedor = value; } }, metadata: _metadata }, _fornecedor_initializers, _fornecedor_extraInitializers);
        __esDecorate(null, null, _valorUnitario_decorators, { kind: "field", name: "valorUnitario", static: false, private: false, access: { has: function (obj) { return "valorUnitario" in obj; }, get: function (obj) { return obj.valorUnitario; }, set: function (obj, value) { obj.valorUnitario = value; } }, metadata: _metadata }, _valorUnitario_initializers, _valorUnitario_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ItemInventario = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ItemInventario = _classThis;
}();
exports.ItemInventario = ItemInventario;
