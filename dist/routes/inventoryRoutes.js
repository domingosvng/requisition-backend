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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const ItemInventario_1 = require("../entity/ItemInventario");
const User_1 = require("../entity/User");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const itemRepository = data_source_1.AppDataSource.getRepository(ItemInventario_1.ItemInventario);
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
// Get all inventory items (admin/manager only)
router.get('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User info is now attached to req.user by middleware
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC' && user.role !== 'GESTOR_DADM')) {
            return res.status(403).json({ message: 'Only admins or technical admins can view inventory.' });
        }
        const items = yield itemRepository.find();
        res.status(200).json(items);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao obter inventário.', error: errorMsg });
    }
}));
// Create new inventory item (admin only)
router.post('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status } = req.body;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC' && user.role !== 'GESTOR_DADM')) {
            return res.status(403).json({ message: 'Only admins or technical admins can create inventory items.' });
        }
        const newItem = itemRepository.create({ nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status });
        yield itemRepository.save(newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao criar item de inventário.', error: errorMsg });
    }
}));
// Edit inventory item (admin only)
router.put('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        const updateData = req.body;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC' && user.role !== 'GESTOR_DADM')) {
            return res.status(403).json({ message: 'Only admins or technical admins can edit inventory items.' });
        }
        const item = yield itemRepository.findOne({ where: { id: Number(id) } });
        if (!item)
            return res.status(404).json({ message: 'Item not found.' });
        Object.assign(item, updateData);
        yield itemRepository.save(item);
        res.status(200).json(item);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao editar item de inventário.', error: errorMsg });
    }
}));
// Delete inventory item (admin only)
router.delete('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC' && user.role !== 'GESTOR_DADM')) {
            return res.status(403).json({ message: 'Only admins or technical admins can delete inventory items.' });
        }
        const item = yield itemRepository.findOne({ where: { id: Number(id) } });
        if (!item)
            return res.status(404).json({ message: 'Item not found.' });
        yield itemRepository.remove(item);
        res.status(200).json({ message: `Item ${id} deleted successfully.` });
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao apagar item de inventário.', error: errorMsg });
    }
}));
exports.default = router;
