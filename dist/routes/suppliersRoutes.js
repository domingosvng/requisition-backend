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
const express_validator_1 = require("express-validator");
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
router.post('/', authMiddleware_1.authenticateJWT, 
// Basic sanitization and validation
(0, express_validator_1.body)('nome').trim().isString().isLength({ min: 2, max: 200 }).withMessage('Nome é obrigatório e deve ter entre 2 e 200 caracteres.'), (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email inválido.').normalizeEmail(), (0, express_validator_1.body)('telefone').optional().trim().isLength({ min: 6, max: 30 }).withMessage('Telefone inválido.'), (0, express_validator_1.body)('contactoPrincipal').optional().trim().isLength({ max: 100 }).withMessage('Contacto inválido.'), (0, express_validator_1.body)('nif').optional().trim().matches(/^\d{5,20}$/).withMessage('NIF inválido. Deve conter apenas dígitos (5-20).'), (0, express_validator_1.body)('endereco').optional().trim().isLength({ max: 500 }).withMessage('Endereço muito longo.'), (0, express_validator_1.body)('servicosFornecidos').optional().custom((val) => {
    // allow array or comma-separated string on incoming payload
    if (Array.isArray(val)) {
        if (val.length > 50)
            throw new Error('Máximo 50 serviços permitidos.');
        for (const s of val) {
            if (typeof s !== 'string' || s.trim().length === 0 || s.trim().length > 200)
                throw new Error('Cada serviço deve ser texto (1-200 caracteres).');
        }
        return true;
    }
    if (typeof val === 'string') {
        // allow comma-separated list
        const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
        if (parts.length > 50)
            throw new Error('Máximo 50 serviços permitidos.');
        return true;
    }
    throw new Error('servicosFornecidos deve ser uma lista ou string separada por vírgulas.');
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        // Map to concise field/message shape
        const mapped = errors.array().map((e) => ({ field: e.param || e.path || e.location || 'body', message: e.msg || e.message }));
        return res.status(400).json({ errors: mapped });
    }
    try {
        const user = req.user;
        const { nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos } = req.body;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can create suppliers.' });
        }
        // Check uniqueness of NIF if provided
        if (nif) {
            const existing = yield fornecedorRepository.findOne({ where: { nif } });
            if (existing)
                return res.status(409).json({ message: 'Já existe um fornecedor com esse NIF.' });
        }
        // Normalize servicosFornecidos if client sent a comma-separated string
        const normalizedServicos = Array.isArray(servicosFornecidos)
            ? servicosFornecidos.map((s) => s.trim()).filter(Boolean)
            : (typeof servicosFornecidos === 'string' ? servicosFornecidos.split(',').map((s) => s.trim()).filter(Boolean) : []);
        const newFornecedor = fornecedorRepository.create({ nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos: normalizedServicos });
        yield fornecedorRepository.save(newFornecedor);
        res.status(201).json(newFornecedor);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: 'Erro interno ao criar fornecedor.', error: errorMsg });
    }
}));
// Edit supplier (admin only)
router.put('/:id', authMiddleware_1.authenticateJWT, (0, express_validator_1.body)('nome').optional().trim().isString().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres.'), (0, express_validator_1.body)('email').optional().isEmail().withMessage('Email inválido.').normalizeEmail(), (0, express_validator_1.body)('telefone').optional().trim().isLength({ min: 6, max: 30 }).withMessage('Telefone inválido.'), (0, express_validator_1.body)('nif').optional().trim().matches(/^\d{5,20}$/).withMessage('NIF inválido. Deve conter apenas dígitos (5-20).'), (0, express_validator_1.body)('servicosFornecidos').optional().custom((val) => {
    if (Array.isArray(val)) {
        if (val.length > 50)
            throw new Error('Máximo 50 serviços permitidos.');
        for (const s of val) {
            if (typeof s !== 'string' || s.trim().length === 0 || s.trim().length > 200)
                throw new Error('Cada serviço deve ser texto (1-200 caracteres).');
        }
        return true;
    }
    if (typeof val === 'string')
        return true; // will normalize in handler
    throw new Error('servicosFornecidos deve ser uma lista ou string separada por vírgulas.');
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const mapped = errors.array().map((e) => ({ field: e.param || e.path || e.location || 'body', message: e.msg || e.message }));
        return res.status(400).json({ errors: mapped });
    }
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
        // If updating NIF, ensure uniqueness
        if (updateData && updateData.nif && updateData.nif !== fornecedor.nif) {
            const existing = yield fornecedorRepository.findOne({ where: { nif: updateData.nif } });
            if (existing)
                return res.status(409).json({ message: 'Já existe um fornecedor com esse NIF.' });
        }
        // Normalize services if provided as string
        if (updateData && typeof updateData.servicosFornecidos === 'string') {
            updateData.servicosFornecidos = updateData.servicosFornecidos.split(',').map((s) => s.trim()).filter(Boolean);
        }
        if (updateData && Array.isArray(updateData.servicosFornecidos)) {
            updateData.servicosFornecidos = updateData.servicosFornecidos.map((s) => s.trim()).filter(Boolean);
        }
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
