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
exports.Fornecedor = void 0;
var typeorm_1 = require("typeorm");
var Fornecedor = function () {
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
    var _contactoPrincipal_decorators;
    var _contactoPrincipal_initializers = [];
    var _contactoPrincipal_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _telefone_decorators;
    var _telefone_initializers = [];
    var _telefone_extraInitializers = [];
    var _nif_decorators;
    var _nif_initializers = [];
    var _nif_extraInitializers = [];
    var _endereco_decorators;
    var _endereco_initializers = [];
    var _endereco_extraInitializers = [];
    var _servicosFornecidos_decorators;
    var _servicosFornecidos_initializers = [];
    var _servicosFornecidos_extraInitializers = [];
    var _dataRegisto_decorators;
    var _dataRegisto_initializers = [];
    var _dataRegisto_extraInitializers = [];
    var _ativo_decorators;
    var _ativo_initializers = [];
    var _ativo_extraInitializers = [];
    var Fornecedor = _classThis = /** @class */ (function () {
        function Fornecedor_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.nome = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _nome_initializers, void 0));
            this.contactoPrincipal = (__runInitializers(this, _nome_extraInitializers), __runInitializers(this, _contactoPrincipal_initializers, void 0));
            this.email = (__runInitializers(this, _contactoPrincipal_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.telefone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _telefone_initializers, void 0));
            this.nif = (__runInitializers(this, _telefone_extraInitializers), __runInitializers(this, _nif_initializers, void 0));
            this.endereco = (__runInitializers(this, _nif_extraInitializers), __runInitializers(this, _endereco_initializers, void 0));
            this.servicosFornecidos = (__runInitializers(this, _endereco_extraInitializers), __runInitializers(this, _servicosFornecidos_initializers, void 0));
            this.dataRegisto = (__runInitializers(this, _servicosFornecidos_extraInitializers), __runInitializers(this, _dataRegisto_initializers, void 0));
            this.ativo = (__runInitializers(this, _dataRegisto_extraInitializers), __runInitializers(this, _ativo_initializers, void 0));
            __runInitializers(this, _ativo_extraInitializers);
        }
        return Fornecedor_1;
    }());
    __setFunctionName(_classThis, "Fornecedor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _nome_decorators = [(0, typeorm_1.Column)()];
        _contactoPrincipal_decorators = [(0, typeorm_1.Column)()];
        _email_decorators = [(0, typeorm_1.Column)()];
        _telefone_decorators = [(0, typeorm_1.Column)()];
        _nif_decorators = [(0, typeorm_1.Column)()];
        _endereco_decorators = [(0, typeorm_1.Column)()];
        _servicosFornecidos_decorators = [(0, typeorm_1.Column)("simple-array")];
        _dataRegisto_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _ativo_decorators = [(0, typeorm_1.Column)({ default: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _nome_decorators, { kind: "field", name: "nome", static: false, private: false, access: { has: function (obj) { return "nome" in obj; }, get: function (obj) { return obj.nome; }, set: function (obj, value) { obj.nome = value; } }, metadata: _metadata }, _nome_initializers, _nome_extraInitializers);
        __esDecorate(null, null, _contactoPrincipal_decorators, { kind: "field", name: "contactoPrincipal", static: false, private: false, access: { has: function (obj) { return "contactoPrincipal" in obj; }, get: function (obj) { return obj.contactoPrincipal; }, set: function (obj, value) { obj.contactoPrincipal = value; } }, metadata: _metadata }, _contactoPrincipal_initializers, _contactoPrincipal_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _telefone_decorators, { kind: "field", name: "telefone", static: false, private: false, access: { has: function (obj) { return "telefone" in obj; }, get: function (obj) { return obj.telefone; }, set: function (obj, value) { obj.telefone = value; } }, metadata: _metadata }, _telefone_initializers, _telefone_extraInitializers);
        __esDecorate(null, null, _nif_decorators, { kind: "field", name: "nif", static: false, private: false, access: { has: function (obj) { return "nif" in obj; }, get: function (obj) { return obj.nif; }, set: function (obj, value) { obj.nif = value; } }, metadata: _metadata }, _nif_initializers, _nif_extraInitializers);
        __esDecorate(null, null, _endereco_decorators, { kind: "field", name: "endereco", static: false, private: false, access: { has: function (obj) { return "endereco" in obj; }, get: function (obj) { return obj.endereco; }, set: function (obj, value) { obj.endereco = value; } }, metadata: _metadata }, _endereco_initializers, _endereco_extraInitializers);
        __esDecorate(null, null, _servicosFornecidos_decorators, { kind: "field", name: "servicosFornecidos", static: false, private: false, access: { has: function (obj) { return "servicosFornecidos" in obj; }, get: function (obj) { return obj.servicosFornecidos; }, set: function (obj, value) { obj.servicosFornecidos = value; } }, metadata: _metadata }, _servicosFornecidos_initializers, _servicosFornecidos_extraInitializers);
        __esDecorate(null, null, _dataRegisto_decorators, { kind: "field", name: "dataRegisto", static: false, private: false, access: { has: function (obj) { return "dataRegisto" in obj; }, get: function (obj) { return obj.dataRegisto; }, set: function (obj, value) { obj.dataRegisto = value; } }, metadata: _metadata }, _dataRegisto_initializers, _dataRegisto_extraInitializers);
        __esDecorate(null, null, _ativo_decorators, { kind: "field", name: "ativo", static: false, private: false, access: { has: function (obj) { return "ativo" in obj; }, get: function (obj) { return obj.ativo; }, set: function (obj, value) { obj.ativo = value; } }, metadata: _metadata }, _ativo_initializers, _ativo_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Fornecedor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Fornecedor = _classThis;
}();
exports.Fornecedor = Fornecedor;
