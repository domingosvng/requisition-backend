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
    let query = requisicaoRepository.createQueryBuilder('requisicao')
      .leftJoinAndSelect('requisicao.solicitante', 'solicitante')
      .orderBy('requisicao.id', 'DESC');

    if (user.role === 'SOLICITANTE') {
      query = query.where('requisicao.solicitanteId = :userId', { userId: user.id });
    } else if (user.role === 'GESTOR_DADM') {
      // Managers should see pending requests and also see the result after admin/manager actions
      const statuses = ['PENDENTE', 'AGUARDANDO_APROV_FINAL', 'APROVADA_GERENCIA', 'APROVADA', 'REJEITADA'];
      query = query.where('requisicao.status IN (:...statuses)', { statuses });
    } // For ADMIN_TEC and ADMIN, do not add any WHERE clause. They see all requisitions.
    requisicoes = await query.getMany();
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
  comentarioAdmin: (r as any).comentarioAdmin || null,
  comentarioGestorDADM: (r as any).comentarioGestorDADM || null,
  comentarioAprovacao: (r as any).comentarioAprovacao || null,
  lastActionBy: (r as any).lastActionBy || null,
  lastActionRole: (r as any).lastActionRole || null,
  // ...existing code...
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
  // Remove comment logic
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User authentication required.' });
    }
    const requisicao = await requisicaoRepository.findOne({ where: { id: Number(id) } });
    if (!requisicao) return res.status(404).json({ message: 'Requisition not found.' });
    // Strict role/status enforcement
    if (user.role === 'GESTOR_DADM') {
      if (requisicao.status !== StatusRequisicao.PENDENTE) {
        return res.status(403).json({ message: 'Requisition is not in the correct status for this action (Expected: PENDENTE).' });
      }
      requisicao.status = StatusRequisicao.AGUARDANDO_APROV_FINAL;
      await requisicaoRepository.save(requisicao);
      return res.status(200).json(requisicao);
    }
    else if (user.role === 'ADMIN') {
      if (requisicao.status !== StatusRequisicao.AGUARDANDO_APROV_FINAL) {
        return res.status(403).json({ message: 'Requisition is not in the correct status for this action (Expected: AGUARDANDO_APROV_FINAL).' });
      }
      requisicao.status = StatusRequisicao.APROVADA;
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
      await requisicaoRepository.save(requisicao);
      return res.status(200).json(requisicao);
    }
    return res.status(403).json({ message: 'Permission denied for this role.' });
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
    // Strict role/status enforcement
    if (user.role === 'GESTOR_DADM') {
      if (requisicao.status !== StatusRequisicao.PENDENTE) {
        return res.status(403).json({ message: 'Requisition is not in the correct status for this action (Expected: PENDENTE).' });
      }
      requisicao.status = StatusRequisicao.REJEITADA;
      requisicao.justificativaRejeicao = comment || '';
      await requisicaoRepository.save(requisicao);
      return res.status(200).json(requisicao);
    }
    else if (user.role === 'ADMIN') {
      if (requisicao.status !== StatusRequisicao.AGUARDANDO_APROV_FINAL) {
        return res.status(403).json({ message: 'Requisition is not in the correct status for this action (Expected: AGUARDANDO_APROV_FINAL).' });
      }
      requisicao.status = StatusRequisicao.REJEITADA;
      requisicao.justificativaRejeicao = comment || '';
      await requisicaoRepository.save(requisicao);
      return res.status(200).json(requisicao);
    }
    return res.status(403).json({ message: 'Permission denied for this role.' });
  } catch (error) {
    console.error('Erro ao rejeitar requisição:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao rejeitar requisição.' });
  }
});

router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || user.role !== 'ADMIN') {
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
    if (user.role === 'GESTOR_DADM' && requisicao.status === StatusRequisicao.PENDENTE && (newStatus === 'APROVADA_MANAGER' || newStatus === 'AGUARDANDO_APROV_FINAL')) {
      // Accept both possible manager verbs: 'APROVADA_MANAGER' (legacy) and 'AGUARDANDO_APROV_FINAL'
      // Set to AGUARDANDO_APROV_FINAL to indicate manager approved and awaiting final admin approval
      requisicao.status = StatusRequisicao.AGUARDANDO_APROV_FINAL;
      // Save manager comment if provided
      if (comentario) requisicao.comentarioGestorDADM = comentario;
      requisicao.lastActionBy = user.id.toString();
      requisicao.lastActionRole = user.role;
    }
    // Final Approval by Admin
    else if (user.role === 'ADMIN' && (requisicao.status === StatusRequisicao.APROVADA_GERENCIA || requisicao.status === StatusRequisicao.AGUARDANDO_APROV_FINAL || requisicao.status === StatusRequisicao.PENDENTE) && newStatus === 'APROVADA_FINAL') {
      // Admin may finalize when the request is either APROVADA_GERENCIA, AGUARDANDO_APROV_FINAL or PENDENTE (allow admin to shortcut manager step)
      requisicao.status = StatusRequisicao.APROVADA;
  // ...existing code...
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
      requisicao.lastActionBy = user.id.toString();
      requisicao.lastActionRole = user.role;
    }
    // Rejection by Manager or Admin
    else if ((user.role === 'GESTOR_DADM' && requisicao.status === StatusRequisicao.PENDENTE && newStatus === 'REJEITADA') ||
             (user.role === 'ADMIN' && (requisicao.status === StatusRequisicao.APROVADA_GERENCIA || requisicao.status === StatusRequisicao.AGUARDANDO_APROV_FINAL || requisicao.status === StatusRequisicao.PENDENTE) && newStatus === 'REJEITADA')) {
      requisicao.status = StatusRequisicao.REJEITADA;
      // Save both justificativa and admin comment where appropriate
      requisicao.justificativaRejeicao = comentario || requisicao.justificativaRejeicao || '';
      if (user.role === 'ADMIN' && comentario) requisicao.comentarioAdmin = comentario;
      requisicao.lastActionBy = user.id.toString();
      requisicao.lastActionRole = user.role;
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

router.put('/:id/process', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || user.role !== 'ADMIN_TEC') {
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