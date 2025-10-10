// Helper to generate unique requisition number
async function generateRequisicaoNumber(): Promise<string> {
  const requisicaoRepository = AppDataSource.getRepository(Requisicao);
  const latestRequisicao = await requisicaoRepository.findOne({ where: {}, order: { id: 'DESC' } });
  const nextSequence = (latestRequisicao ? latestRequisicao.id : 0) + 1;
  const sequenceString = String(nextSequence).padStart(4, '0');
  const year = new Date().getFullYear();
  return `REQ-${year}-${sequenceString}`;
}
// ...existing code...

// ...existing code...
// src/routes/requisicoesRoutes.ts

import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Requisicao, StatusRequisicao } from '../entity/Requisicao';
import { User } from '../entity/User';
import { ItemInventario } from '../entity/ItemInventario';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/authMiddleware';
import { In } from 'typeorm';

const router = Router();
const requisicaoRepository = AppDataSource.getRepository(Requisicao);
const userRepository = AppDataSource.getRepository(User);
const itemInventarioRepository = AppDataSource.getRepository(ItemInventario);

// Create a new requisition (Requester only)
// Requires: userId, numeroRequisicao, areaSolicitante, urgencia, itens, observacoes
// Use authentication middleware to get user from JWT
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
  // Get user info from token
      const { id: userId, role } = req.user || {};
  // Get requisition data from request body
  const { area, urgencia, observacoes } = req.body;
  const items: any[] = req.body.items || req.body.itens || [];
  // Generate unique requisition number
  const numeroRequisicao = await generateRequisicaoNumber();
      // Fetch the full User entity using userId from JWT
      const solicitante = await userRepository.findOne({ where: { id: userId } });
    if (!solicitante) {
      return res.status(404).json({ message: 'Solicitante não encontrado.' });
    }
    if (solicitante.role !== 'SOLICITANTE' && solicitante.role !== 'GESTOR_DADM' && solicitante.role !== 'ADMIN_TEC') {
      return res.status(403).json({ message: 'Apenas solicitantes, gestores e técnicos podem criar requisições.' });
    }
    // Validate and link items to inventory
    const validatedItems = [];
    for (const item of items) {
      if (item.itemId) {
        const inventoryItem = await itemInventarioRepository.findOne({ where: { id: Number(item.itemId) } });
        if (!inventoryItem) {
          return res.status(400).json({ message: `Inventory item with ID ${item.itemId} not found.` });
        }
        validatedItems.push({ ...item, nome: inventoryItem.nome, unidadeMedida: inventoryItem.unidadeMedida });
      } else {
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
  areaSolicitante: area,
  urgencia,
  itens: itensArray,
  status: StatusRequisicao.PENDENTE,
  observacoes: observacoes || '',
    });
    await requisicaoRepository.save(novaRequisicao);
    return res.status(201).json({ message: 'Requisição criada com sucesso.', requisicao: novaRequisicao });
  } catch (error) {
    console.error('Erro ao criar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar requisição.' });
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
    if (user.role === 'GESTOR_DADM' || user.role === 'ADMIN') {
      requisicoes = await requisicaoRepository.find(findOptions);
  } else if (user.role === 'ADMIN_TEC' || user.role === 'admin_dept_tech' || user.role === 'SOLICITANTE') {
      // Show both own requests and those to process
      const own = await requisicaoRepository.find({
        ...findOptions,
        where: { solicitante: { id: user.id } }
      });
      const toProcess = await requisicaoRepository.find({
        ...findOptions,
        where: { status: In([StatusRequisicao.APROVADA, StatusRequisicao.EM_PROCESSAMENTO, StatusRequisicao.CONCLUIDA]) }
      });
      // Merge and deduplicate by id
      const all = [...own, ...toProcess];
      const unique = Array.from(new Map(all.map(r => [r.id, r])).values());
      requisicoes = unique;
    } else if (user.role === 'requester' || user.role === 'SOLICITANTE') {
      requisicoes = await requisicaoRepository.find({ 
        ...findOptions, 
        where: { solicitante: { id: user.id } } 
      });
    } else {
      requisicoes = await requisicaoRepository.find(findOptions);
    }
    // Always include all fields in response
    requisicoes = requisicoes.map(r => ({
      id: r.id,
      numeroRequisicao: r.numeroRequisicao,
      status: r.status,
      solicitante: r.solicitante,
      areaSolicitante: r.areaSolicitante,
      urgencia: r.urgencia,
      observacoes: r.observacoes,
      fornecedorSugestaoId: r.fornecedorSugestaoId,
      justificativaRejeicao: r.justificativaRejeicao,
      comentarioAprovacao: r.comentarioAprovacao,
      responsavelProcessamentoId: r.responsavelProcessamentoId,
      itens: r.itens
    }));
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

// Approve a requisition (Manager/Admin only)
router.put('/:id/approve', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User authentication required.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    let isStatusValid = false;
    // --- 1. GESTOR_DADM (Tier 1 Review/Approval) ---
    if (user.role === 'GESTOR_DADM') {
      if (requisicao.status === StatusRequisicao.PENDENTE) {
        requisicao.status = StatusRequisicao.APROVADA_GERENCIA;
        requisicao.comentarioGestorDADM = comment || '';
        isStatusValid = true;
      }
    }
    // --- 2. ADMIN (Tier 2 Final Approval) ---
    else if (user.role === 'ADMIN') {
      if (requisicao.status === StatusRequisicao.APROVADA_GERENCIA) {
        requisicao.status = StatusRequisicao.APROVADA;
        requisicao.comentarioAdmin = comment || '';
        isStatusValid = true;
        // Inventory Deduction Logic
        for (const item of requisicao.itens) {
          if (item.itemId) {
            const inventoryItem = await itemInventarioRepository.findOne({ where: { id: item.itemId } });
            if (inventoryItem) {
              inventoryItem.quantidade = inventoryItem.quantidade - item.quantidade;
              await itemInventarioRepository.save(inventoryItem);
            }
          }
        }
      }
      // Admin can cancel/delete
      else if (comment === 'CANCELADA' || comment === 'DELETE') {
        requisicao.status = StatusRequisicao.REJEITADA;
        requisicao.justificativaRejeicao = 'Cancelada/Deletada pelo Admin';
        isStatusValid = true;
      }
    }
    if (!isStatusValid) {
      return res.status(403).json({ message: 'Permission denied or requisition is not in the correct status for your approval tier.' });
    }
    await requisicaoRepository.save(requisicao);
    res.status(200).json(requisicao);
  } catch (error) {
    console.error('Erro ao aprovar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao aprovar requisição.' });
  }
});

// Reject a requisition (Manager/Admin only)
router.put('/:id/reject', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User authentication required.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    // CLEANUP: Use direct enum comparison
    if (
      (user.role === 'GESTOR_DADM' && requisicao.status === StatusRequisicao.PENDENTE) ||
      (user.role === 'ADMIN' && requisicao.status === StatusRequisicao.APROVADA_GERENCIA)
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
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
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
// Unified status update route for approval, rejection, and deletion
router.put('/:id/status', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { newStatus, comentario } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User authentication required.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });

    // Approval by Manager
    if (user.role === 'GESTOR_DADM' && requisicao.status === StatusRequisicao.PENDENTE && newStatus === 'APROVADA_MANAGER') {
      requisicao.status = StatusRequisicao.APROVADA_GERENCIA;
      requisicao.comentarioGestorDADM = comentario || '';
    }
    // Final Approval by Admin
    else if (user.role === 'ADMIN' && requisicao.status === StatusRequisicao.APROVADA_GERENCIA && newStatus === 'APROVADA_FINAL') {
      requisicao.status = StatusRequisicao.APROVADA;
      requisicao.comentarioAdmin = comentario || '';
      // Inventory deduction logic
      for (const item of requisicao.itens) {
        if (item.itemId) {
          const inventoryItem = await itemInventarioRepository.findOne({ where: { id: item.itemId } });
          if (inventoryItem) {
            inventoryItem.quantidade = inventoryItem.quantidade - item.quantidade;
            await itemInventarioRepository.save(inventoryItem);
          }
        }
      }
    }
    // Rejection by Manager or Admin
    else if ((user.role === 'GESTOR_DADM' && requisicao.status === StatusRequisicao.PENDENTE && newStatus === 'REJEITADA') ||
             (user.role === 'ADMIN' && requisicao.status === StatusRequisicao.APROVADA_GERENCIA && newStatus === 'REJEITADA')) {
      requisicao.status = StatusRequisicao.REJEITADA;
      requisicao.justificativaRejeicao = comentario || '';
    }
    // Deletion by Admin
    else if (user.role === 'ADMIN' && newStatus === 'DELETE') {
      await requisicaoRepository.remove(requisicao);
      return res.status(200).json({ message: `Requisition ${id} deleted successfully.` });
    }
    else {
      return res.status(403).json({ message: 'Permission denied or requisition is not in the correct status for this action.' });
    }
    await requisicaoRepository.save(requisicao);
    res.status(200).json(requisicao);
  } catch (error) {
    console.error('Erro ao atualizar status da requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar status da requisição.' });
  }
});

export default router;

// Move requisition status to EM_PROCESSAMENTO (Admin Tech only)
router.put('/:id/process', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || user.role !== 'admin_dept_tech') {
      return res.status(403).json({ message: 'Permission denied. Only Admin Tech can start processing.' });
    }

    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });

    // Only move to EM_PROCESSAMENTO if currently APROVADA
    if (requisicao.status === StatusRequisicao.APROVADA) {
      requisicao.status = StatusRequisicao.EM_PROCESSAMENTO;
      // ADDED: Save the technician's ID here for tracking
  requisicao.responsavelProcessamentoId = user.id.toString();
      await requisicaoRepository.save(requisicao);
      res.status(200).json(requisicao);
    } else {
      return res.status(400).json({ 
        message: `Cannot start processing. Requisition status must be ${StatusRequisicao.APROVADA}. Current status: ${requisicao.status}` 
      });
    }
  } catch (error) {
    console.error('Erro ao iniciar processamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao iniciar processamento.' });
  }
});