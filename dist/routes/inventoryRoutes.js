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
const ItemInventario_1 = require("../entity/ItemInventario");
const Fornecedor_1 = require("../entity/Fornecedor");
const User_1 = require("../entity/User");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const itemRepository = data_source_1.AppDataSource.getRepository(ItemInventario_1.ItemInventario);
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const fornecedorRepository = data_source_1.AppDataSource.getRepository(Fornecedor_1.Fornecedor);
// Dev-only public read route: useful for local development where frontend may not have a token.
// This route is intentionally not protected and should NOT be enabled in production.
if (process.env.NODE_ENV !== 'production') {
    router.get('/public', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const items = yield itemRepository.find();
            res.status(200).json(items);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            res.status(500).json({ message: 'Erro interno ao obter inventário (public).', error: errorMsg });
        }
    }));
    // Dev helper: return a short-lived admin token to the frontend for local development
    router.get('/dev-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const secret = process.env.JWT_SECRET || 'yourSuperSecretKey';
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: 1, username: 'dev-autotoken', role: 'ADMIN' }, secret, { expiresIn: '1h' });
            return res.json({ token });
        }
        catch (err) {
            return res.status(500).json({ message: 'Failed to create dev token.' });
        }
    }));
    // Dev helper: serve a small HTML page that writes a fresh dev token into localStorage and redirects back.
    router.get('/set-dev-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const secret = process.env.JWT_SECRET || 'yourSuperSecretKey';
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: 1, username: 'dev-autotoken', role: 'ADMIN' }, secret, { expiresIn: '1h' });
            const html = `<!doctype html><html><head><meta charset="utf-8"><title>Set Dev Token</title></head><body><script>localStorage.setItem('userToken', '${token}'); localStorage.setItem('userRole','ADMIN'); setTimeout(()=>{window.location.href='/'},300);</script><p>Setting dev token and redirecting...</p></body></html>`;
            res.setHeader('Content-Type', 'text/html');
            return res.send(html);
        }
        catch (err) {
            return res.status(500).send('Failed to set dev token');
        }
    }));
}
// Get all inventory items (admin only)
router.get('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User info is now attached to req.user by middleware
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
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
router.post('/', authMiddleware_1.authenticateJWT, 
// validation middleware
[
    (0, express_validator_1.body)('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 200 }).withMessage('Nome muito longo'),
    (0, express_validator_1.body)('descricao').optional().isLength({ max: 1000 }).withMessage('Descricao muito longa'),
    (0, express_validator_1.body)('categoria').optional().isString().withMessage('Categoria inválida'),
    (0, express_validator_1.body)('quantidade').optional().isInt({ min: 0 }).withMessage('Quantidade deve ser inteiro >= 0'),
    (0, express_validator_1.body)('unidadeMedida').optional().isLength({ max: 50 }).withMessage('Unidade muito longa'),
    (0, express_validator_1.body)('localizacao').optional().isLength({ max: 200 }).withMessage('Localizacao muito longa'),
    (0, express_validator_1.body)('status').optional().isIn(['ATIVO', 'INATIVO']).withMessage('Status inválido'),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => ({ field: e.param, message: e.msg })) });
    }
    try {
        const user = req.user;
        let { nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status } = req.body;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can create inventory items.' });
        }
        // Normalize inputs: categoria may be array from frontend, quantidade may be string
        if (Array.isArray(categoria)) {
            categoria = categoria.join(', ');
        }
        else if (typeof categoria !== 'string') {
            categoria = String(categoria || '');
        }
        quantidade = Number(quantidade || 0);
        unidadeMedida = unidadeMedida || '';
        localizacao = localizacao || '';
        status = status || 'ATIVO';
        const newItem = itemRepository.create({ nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status });
        yield itemRepository.save(newItem);
        res.status(201).json(newItem);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Failed to create inventory item:', error);
        res.status(500).json({ message: 'Erro interno ao criar item de inventário.', error: errorMsg });
    }
}));
// Edit inventory item (admin only)
router.put('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        const body = req.body || {};
        console.debug('[inventoryRoutes] PUT /inventario/' + id + ' body:', JSON.stringify(body).slice(0, 1000));
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
            return res.status(403).json({ message: 'Only admins or technical admins can edit inventory items.' });
        }
        const item = yield itemRepository.findOne({ where: { id: Number(id) }, relations: ['fornecedor'] });
        if (!item)
            return res.status(404).json({ message: 'Item not found.' });
        // Only copy allowed scalar fields to avoid assigning incompatible types
        const allowed = ['nome', 'descricao', 'categoria', 'quantidade', 'unidadeMedida', 'localizacao', 'dataEntrada', 'dataUltimaSaida', 'valorUnitario', 'status'];
        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(body, key)) {
                // basic normalization
                if (key === 'quantidade')
                    item.quantidade = Number(body[key] || 0);
                else if (key === 'valorUnitario')
                    item.valorUnitario = body[key] != null ? Number(body[key]) : undefined;
                else
                    item[key] = body[key];
            }
        }
        // Handle fornecedor relation safely: accept id (number), object with id, or string (try to find by nome)
        if (Object.prototype.hasOwnProperty.call(body, 'fornecedor')) {
            const f = body.fornecedor;
            let foundFornecedor = null;
            if (!f) {
                foundFornecedor = null;
            }
            else if (typeof f === 'number') {
                foundFornecedor = yield fornecedorRepository.findOne({ where: { id: Number(f) } });
            }
            else if (typeof f === 'object' && f.id) {
                foundFornecedor = yield fornecedorRepository.findOne({ where: { id: Number(f.id) } });
            }
            else if (typeof f === 'string') {
                // try to find by nome (best-effort)
                foundFornecedor = yield fornecedorRepository.findOne({ where: { nome: String(f) } });
            }
            item.fornecedor = foundFornecedor || undefined;
        }
        yield itemRepository.save(item);
        res.status(200).json(item);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Erro ao editar item de inventario:', error);
        res.status(500).json({ message: 'Erro interno ao editar item de inventário.', error: errorMsg });
    }
}));
// Delete inventory item (admin only)
router.delete('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
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
