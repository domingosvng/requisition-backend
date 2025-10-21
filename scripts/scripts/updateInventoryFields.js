"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var data_source_1 = require("../src/data-source");
var ItemInventario_1 = require("../src/entity/ItemInventario");
/**
 * Script to update existing inventory items with missing fields.
 * This fills in empty or null values for categoria, unidadeMedida, and localizacao
 * with sensible defaults so items can be displayed properly in the frontend.
 */
function updateInventoryFields() {
    return __awaiter(this, void 0, void 0, function () {
        var itemRepository, items, updatedCount, _i, items_1, item, needsUpdate, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, data_source_1.AppDataSource.initialize()];
                case 1:
                    _a.sent();
                    console.log('Database connection established');
                    itemRepository = data_source_1.AppDataSource.getRepository(ItemInventario_1.ItemInventario);
                    return [4 /*yield*/, itemRepository.find()];
                case 2:
                    items = _a.sent();
                    console.log("Found ".concat(items.length, " inventory items to check"));
                    updatedCount = 0;
                    _i = 0, items_1 = items;
                    _a.label = 3;
                case 3:
                    if (!(_i < items_1.length)) return [3 /*break*/, 6];
                    item = items_1[_i];
                    needsUpdate = false;
                    // Fill missing categoria
                    if (!item.categoria || item.categoria.trim() === '') {
                        item.categoria = 'Geral';
                        needsUpdate = true;
                    }
                    // Fill missing unidadeMedida
                    if (!item.unidadeMedida || item.unidadeMedida.trim() === '') {
                        item.unidadeMedida = 'unidades';
                        needsUpdate = true;
                    }
                    // Fill missing localizacao
                    if (!item.localizacao || item.localizacao.trim() === '') {
                        item.localizacao = 'Armazém Principal';
                        needsUpdate = true;
                    }
                    // Fill missing descricao if null (but allow empty string)
                    if (item.descricao === null) {
                        item.descricao = '';
                        needsUpdate = true;
                    }
                    // Ensure status is valid
                    if (!item.status || item.status.trim() === '') {
                        item.status = 'ATIVO';
                        needsUpdate = true;
                    }
                    if (!needsUpdate) return [3 /*break*/, 5];
                    return [4 /*yield*/, itemRepository.save(item)];
                case 4:
                    _a.sent();
                    updatedCount++;
                    console.log("Updated item ".concat(item.id, ": ").concat(item.nome));
                    console.log("  - categoria: \"".concat(item.categoria, "\""));
                    console.log("  - unidadeMedida: \"".concat(item.unidadeMedida, "\""));
                    console.log("  - localizacao: \"".concat(item.localizacao, "\""));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("\nSuccessfully updated ".concat(updatedCount, " items"));
                    return [4 /*yield*/, data_source_1.AppDataSource.destroy()];
                case 7:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error('Error updating inventory items:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
updateInventoryFields();
