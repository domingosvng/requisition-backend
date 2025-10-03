// src/routes/requisicoesRoutes.ts

import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Requisicao, StatusRequisicao } from '../entity/Requisicao';
import { User } from '../entity/User';
import { ItemInventario } from '../entity/ItemInventario';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const requisicaoRepository = AppDataSource.getRepository(Requisicao);
const userRepository = AppDataSource.getRepository(User);
const itemInventarioRepository = AppDataSource.getRepository(ItemInventario);

// Create a new requisition (Requester only)
// Requires: userId, numeroRequisicao, areaSolicitante, urgencia, itens, observacoes
router.post('/', async (req, res) => {
  try {
    const { userId, numeroRequisicao, areaSolicitante, urgencia, observacoes } = req.body;
    // Accept both 'items' and 'itens' from the request, default to empty array
    const items: any[] = req.body.items || req.body.itens || [];
    // Validate user
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role !== 'requester' && user.role !== 'dadm_manager') {
      return res.status(403).json({ message: 'Only requesters and managers can create requisitions.' });
    }
    // Validate and link items to inventory
    const validatedItems = [];
    for (const item of items) {
      if (item.itemId) {
        // Try to find the inventory item
        const inventoryItem = await itemInventarioRepository.findOne({ where: { id: Number(item.itemId) } });
        if (!inventoryItem) {
          return res.status(400).json({ message: `Inventory item with ID ${item.itemId} not found.` });
        }
        validatedItems.push({ ...item, nome: inventoryItem.nome, unidadeMedida: inventoryItem.unidadeMedida });
      } else {
        // Allow custom item (not in inventory)
        validatedItems.push(item);
      }
    }
    // Create requisition
    const novaRequisicao = requisicaoRepository.create({
      numeroRequisicao,
      solicitante: user,
      areaSolicitante,
      urgencia,
      itens: validatedItems, // entity expects 'itens'
      status: StatusRequisicao.PENDENTE,
      observacoes
    });
    await requisicaoRepository.save(novaRequisicao);
    res.status(201).json(novaRequisicao);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao criar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar requisição.', error: errorMsg });
  }
});

// Get all requisitions (role-based)
// Admin/Manager: all, Requester: own
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'User not found.' });
    let requisicoes;
    let findOptions = { order: { dataCriacao: 'DESC' as const }, relations: ['solicitante'] };
    if (user.role === 'admin' || user.role === 'dadm_manager') {
      requisicoes = await requisicaoRepository.find(findOptions);
    } else if (user.role === 'admin_dept_tech') {
      requisicoes = await requisicaoRepository.find({ 
        ...findOptions, 
        where: { status: StatusRequisicao.APROVADA } 
      });
    } else {
      requisicoes = await requisicaoRepository.find({ 
        ...findOptions, 
        where: { solicitante: { id: user.id } } 
      });
    }
    res.status(200).json(requisicoes);
  } catch (error) {
    console.error('Erro ao obter requisições:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter requisições.' });
  }
});

// Get a specific requisition by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) }, relations: ['solicitante'] });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    res.status(200).json(requisicao);
  } catch (error) {
    console.error('Erro ao obter requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao obter requisição.' });
  }
});

// Approve a requisition (Manager only)
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    let newStatus: StatusRequisicao | null = null;
    if (user.role === 'dadm_manager' && requisicao.status === StatusRequisicao.PENDENTE) {
      newStatus = StatusRequisicao.APROVADA_GERENCIA;
    } else if (user.role === 'admin' && requisicao.status === StatusRequisicao.APROVADA_GERENCIA) {
      newStatus = StatusRequisicao.APROVADA;
    } else {
      return res.status(403).json({ message: 'Permission denied or requisition is not in the correct status for your approval tier.' });
    }
    requisicao.status = newStatus;
    requisicao.observacoes = comment || requisicao.observacoes;
    await requisicaoRepository.save(requisicao);
    res.status(200).json(requisicao);
  } catch (error) {
    console.error('Erro ao aprovar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao aprovar requisição.' });
  }
});

// Reject a requisition (Manager only)
router.put('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, comment } = req.body;
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    // Only allow rejection if in correct status and by correct role
    if (
      (user.role === 'dadm_manager' && requisicao.status === StatusRequisicao.PENDENTE) ||
      (user.role === 'admin' && requisicao.status === StatusRequisicao.APROVADA_GERENCIA)
    ) {
      requisicao.status = StatusRequisicao.REJEITADA;
      requisicao.justificativaRejeicao = comment || '';
      await requisicaoRepository.save(requisicao);
      res.status(200).json(requisicao);
    } else {
      return res.status(403).json({ message: 'Permission denied or requisition is not in the correct status for rejection.' });
    }
  } catch (error) {
    console.error('Erro ao rejeitar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao rejeitar requisição.' });
  }
});

// Delete a requisition (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete requisitions.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    await requisicaoRepository.remove(requisicao);
    res.status(200).json({ message: `Requisition ${id} deleted successfully.` });
  } catch (error) {
    console.error('Erro ao apagar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao apagar requisição.' });
  }
});

// All endpoints above should be protected by JWT middleware in production.

export default router;