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
const Fornecedor_1 = require("../entity/Fornecedor");
const User_1 = require("../entity/User");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const fornecedorRepository = data_source_1.AppDataSource.getRepository(Fornecedor_1.Fornecedor);
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
// Get all suppliers (admin only)
router.get('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can view suppliers.' });
        }
        const fornecedores = yield fornecedorRepository.find();
        res.status(200).json(fornecedores);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao obter fornecedores.', error: errorMsg });
    }
}));
// Create new supplier (admin only)
router.post('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos } = req.body;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can create suppliers.' });
        }
        const newFornecedor = fornecedorRepository.create({ nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos });
        yield fornecedorRepository.save(newFornecedor);
        res.status(201).json(newFornecedor);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao criar fornecedor.', error: errorMsg });
    }
}));
// Edit supplier (admin only)
router.put('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        const updateData = req.body;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can edit suppliers.' });
        }
        const fornecedor = yield fornecedorRepository.findOne({ where: { id: Number(id) } });
        if (!fornecedor)
            return res.status(404).json({ message: 'Supplier not found.' });
        Object.assign(fornecedor, updateData);
        yield fornecedorRepository.save(fornecedor);
        res.status(200).json(fornecedor);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao editar fornecedor.', error: errorMsg });
    }
}));
// Delete supplier (admin only)
router.delete('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can delete suppliers.' });
        }
        const fornecedor = yield fornecedorRepository.findOne({ where: { id: Number(id) } });
        if (!fornecedor)
            return res.status(404).json({ message: 'Supplier not found.' });
        yield fornecedorRepository.remove(fornecedor);
        res.status(200).json({ message: `Supplier ${id} deleted successfully.` });
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao apagar fornecedor.', error: errorMsg });
    }
}));
exports.default = router;
