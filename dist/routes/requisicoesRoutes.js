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
// Helper to generate unique requisition number
function generateRequisicaoNumber() {
    return __awaiter(this, void 0, void 0, function* () {
        const requisicaoRepository = data_source_1.AppDataSource.getRepository(Requisicao_1.Requisicao);
        const latestRequisicao = yield requisicaoRepository.findOne({ where: {}, order: { id: 'DESC' } });
        const nextSequence = (latestRequisicao ? latestRequisicao.id : 0) + 1;
        const sequenceString = String(nextSequence).padStart(4, '0');
        const year = new Date().getFullYear();
        return `REQ-${year}-${sequenceString}`;
    });
}
// ...existing code...
// ...existing code...
// src/routes/requisicoesRoutes.ts
const express_1 = require("express");
const data_source_1 = require("../data-source");
const Requisicao_1 = require("../entity/Requisicao");
const User_1 = require("../entity/User");
const ItemInventario_1 = require("../entity/ItemInventario");
const authMiddleware_1 = require("../middleware/authMiddleware");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
const requisicaoRepository = data_source_1.AppDataSource.getRepository(Requisicao_1.Requisicao);
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
const itemInventarioRepository = data_source_1.AppDataSource.getRepository(ItemInventario_1.ItemInventario);
// Create a new requisition (Requester only)
// Requires: userId, numeroRequisicao, areaSolicitante, urgencia, itens, observacoes
// Use authentication middleware to get user from JWT
router.post('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user info from token
        const { id: userId, role } = req.user || {};
        // Get requisition data from request body
        let { areaSolicitante, urgencia, observacoes } = req.body;
        const items = req.body.items || req.body.itens || [];
        // Generate unique requisition number
        const numeroRequisicao = yield generateRequisicaoNumber();
        // Fetch the full User entity
        const solicitante = yield userRepository.findOne({ where: { id: userId } });
        // If areaSolicitante is not provided, use a default value
        if (!areaSolicitante) {
            areaSolicitante = 'Não Informada';
        }
        if (!solicitante) {
            return res.status(404).json({ message: 'Solicitante não encontrado.' });
        }
        if (solicitante.role !== 'SOLICITANTE' && solicitante.role !== 'GESTOR_DADM') {
            return res.status(403).json({ message: 'Apenas solicitantes e gestores podem criar requisições.' });
        }
        // Validate and link items to inventory
        const validatedItems = [];
        for (const item of items) {
            if (item.itemId) {
                const inventoryItem = yield itemInventarioRepository.findOne({ where: { id: Number(item.itemId) } });
                if (!inventoryItem) {
                    return res.status(400).json({ message: `Inventory item with ID ${item.itemId} not found.` });
                }
                validatedItems.push(Object.assign(Object.assign({}, item), { nome: inventoryItem.nome, unidadeMedida: inventoryItem.unidadeMedida }));
            }
            else {
                validatedItems.push(item);
            }
        }
        // Create requisition
        // Map form fields to itens array if needed
        let itensArray = validatedItems;
        if (itensArray.length === 0 && req.body.descricao && req.body.quantidade) {
            itensArray = [{
                    descricao: req.body.descricao,
                    quantidade: req.body.quantidade,
                    especificacoes: req.body.especificacoes || ''
                }];
        }
        const novaRequisicao = requisicaoRepository.create({
            numeroRequisicao,
            solicitante,
            areaSolicitante,
            urgencia,
            itens: itensArray,
            status: Requisicao_1.StatusRequisicao.PENDENTE,
            observacoes: req.body.observacoes || observacoes || '',
        });
        yield requisicaoRepository.save(novaRequisicao);
        return res.status(201).json({ message: 'Requisição criada com sucesso.', requisicao: novaRequisicao });
    }
    catch (error) {
        console.error('Erro ao criar requisição:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao criar requisição.' });
    }
}));
// Get all requisitions (role-based)
// Admin/Manager: all, Requester: own
router.get('/', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: 'User not found.' });
        let requisicoes;
        let findOptions = { order: { dataCriacao: 'DESC' }, relations: ['solicitante'] };
        if (user.role === 'GESTOR_DADM' || user.role === 'ADMIN') {
            requisicoes = yield requisicaoRepository.find(findOptions);
        }
        else if (user.role === 'ADMIN_TEC') {
            // Show both own requests and those to process
            const own = yield requisicaoRepository.find(Object.assign(Object.assign({}, findOptions), { where: { solicitante: { id: user.id } } }));
            const toProcess = yield requisicaoRepository.find(Object.assign(Object.assign({}, findOptions), { where: { status: (0, typeorm_1.In)([Requisicao_1.StatusRequisicao.APROVADA, Requisicao_1.StatusRequisicao.EM_PROCESSAMENTO, Requisicao_1.StatusRequisicao.CONCLUIDA]) } }));
            // Merge and deduplicate by id
            const all = [...own, ...toProcess];
            const unique = Array.from(new Map(all.map(r => [r.id, r])).values());
            requisicoes = unique;
        }
        else {
            requisicoes = yield requisicaoRepository.find(Object.assign(Object.assign({}, findOptions), { where: { solicitante: { id: user.id } } }));
        }
        res.status(200).json(requisicoes);
    }
    catch (error) {
        console.error('Erro ao obter requisições:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter requisições.' });
    }
}));
// Get a specific requisition by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const requisicao = yield requisicaoRepository.findOne({ where: { id: Number(id) }, relations: ['solicitante'] });
        if (!requisicao)
            return res.status(404).json({ message: 'Requisition not found.' });
        res.status(200).json(requisicao);
    }
    catch (error) {
        console.error('Erro ao obter requisição:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter requisição.' });
    }
}));
// Approve a requisition (Manager/Admin only)
router.put('/:id/approve', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User authentication required.' });
        }
        const requisicao = yield requisicaoRepository.findOne({ where: { id: Number(id) } });
        if (!requisicao)
            return res.status(404).json({ message: 'Requisition not found.' });
        let newStatus = null;
        // CLEANUP: Use direct enum comparison
        if (user.role === 'GESTOR_DADM' && requisicao.status === Requisicao_1.StatusRequisicao.PENDENTE) {
            newStatus = Requisicao_1.StatusRequisicao.APROVADA_GERENCIA;
        }
        else if (user.role === 'ADMIN' && requisicao.status === Requisicao_1.StatusRequisicao.APROVADA_GERENCIA) {
            newStatus = Requisicao_1.StatusRequisicao.APROVADA;
            // Inventory Deduction Logic (Permanent Fix)
            for (const item of requisicao.itens) {
                if (item.itemId) {
                    const inventoryItem = yield itemInventarioRepository.findOne({ where: { id: item.itemId } });
                    if (inventoryItem) {
                        inventoryItem.quantidade = inventoryItem.quantidade - item.quantidade;
                        yield itemInventarioRepository.save(inventoryItem);
                    }
                }
            }
        }
        else {
            return res.status(403).json({ message: 'Permission denied or requisition is not in the correct status for your approval tier.' });
        }
        requisicao.status = newStatus;
        requisicao.comentarioAprovacao = comment || '';
        yield requisicaoRepository.save(requisicao);
        res.status(200).json(requisicao);
    }
    catch (error) {
        console.error('Erro ao aprovar requisição:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao aprovar requisição.' });
    }
}));
// Reject a requisition (Manager/Admin only)
router.put('/:id/reject', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User authentication required.' });
        }
        const requisicao = yield requisicaoRepository.findOne({ where: { id: Number(id) } });
        if (!requisicao)
            return res.status(404).json({ message: 'Requisition not found.' });
        // CLEANUP: Use direct enum comparison
        if ((user.role === 'GESTOR_DADM' && requisicao.status === Requisicao_1.StatusRequisicao.PENDENTE) ||
            (user.role === 'ADMIN' && requisicao.status === Requisicao_1.StatusRequisicao.APROVADA_GERENCIA)) {
            requisicao.status = Requisicao_1.StatusRequisicao.REJEITADA;
            requisicao.justificativaRejeicao = comment || '';
            yield requisicaoRepository.save(requisicao);
            res.status(200).json(requisicao);
        }
        else {
            return res.status(403).json({ message: 'Permission denied or requisition is not in the correct status for rejection.' });
        }
    }
    catch (error) {
        console.error('Erro ao rejeitar requisição:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao rejeitar requisição.' });
    }
}));
// Delete a requisition (Admin only)
router.delete('/:id', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete requisitions.' });
        }
        const requisicao = yield requisicaoRepository.findOne({ where: { id: Number(id) } });
        if (!requisicao)
            return res.status(404).json({ message: 'Requisition not found.' });
        yield requisicaoRepository.remove(requisicao);
        res.status(200).json({ message: `Requisition ${id} deleted successfully.` });
    }
    catch (error) {
        console.error('Erro ao apagar requisição:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao apagar requisição.' });
    }
}));
// All endpoints above should be protected by JWT middleware in production.
exports.default = router;
// Move requisition status to EM_PROCESSAMENTO (Admin Tech only)
router.put('/:id/process', authMiddleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || user.role !== 'admin_dept_tech') {
            return res.status(403).json({ message: 'Permission denied. Only Admin Tech can start processing.' });
        }
        const requisicao = yield requisicaoRepository.findOne({ where: { id: Number(id) } });
        if (!requisicao)
            return res.status(404).json({ message: 'Requisition not found.' });
        // Only move to EM_PROCESSAMENTO if currently APROVADA
        if (requisicao.status === Requisicao_1.StatusRequisicao.APROVADA) {
            requisicao.status = Requisicao_1.StatusRequisicao.EM_PROCESSAMENTO;
            // ADDED: Save the technician's ID here for tracking
            requisicao.responsavelProcessamentoId = user.id.toString();
            yield requisicaoRepository.save(requisicao);
            res.status(200).json(requisicao);
        }
        else {
            return res.status(400).json({
                message: `Cannot start processing. Requisition status must be ${Requisicao_1.StatusRequisicao.APROVADA}. Current status: ${requisicao.status}`
            });
        }
    }
    catch (error) {
        console.error('Erro ao iniciar processamento:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao iniciar processamento.' });
    }
}));
