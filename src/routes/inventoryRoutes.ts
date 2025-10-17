import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { ItemInventario } from '../entity/ItemInventario';
import { User } from '../entity/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const itemRepository = AppDataSource.getRepository(ItemInventario);
const userRepository = AppDataSource.getRepository(User);

// Get all inventory items (admin only)
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    // User info is now attached to req.user by middleware
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can view inventory.' });
    }
    const items = await itemRepository.find();
    res.status(200).json(items);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao obter inventário.', error: errorMsg });
  }
});

// Create new inventory item (admin only)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    let { nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status } = req.body;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can create inventory items.' });
    }
    // Normalize inputs: categoria may be array from frontend, quantidade may be string
    if (Array.isArray(categoria)) {
      categoria = categoria.join(', ');
    } else if (typeof categoria !== 'string') {
      categoria = String(categoria || '');
    }
    quantidade = Number(quantidade || 0);
    unidadeMedida = unidadeMedida || '';
    localizacao = localizacao || '';
    status = status || 'ATIVO';

    const newItem = itemRepository.create({ nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status });
    await itemRepository.save(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to create inventory item:', error);
    res.status(500).json({ message: 'Erro interno ao criar item de inventário.', error: errorMsg });
  }
});

// Edit inventory item (admin only)
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const updateData = req.body;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can edit inventory items.' });
    }
    const item = await itemRepository.findOne({ where: { id: Number(id) } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    Object.assign(item, updateData);
    await itemRepository.save(item);
    res.status(200).json(item);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao editar item de inventário.', error: errorMsg });
  }
});

// Delete inventory item (admin only)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can delete inventory items.' });
    }
    const item = await itemRepository.findOne({ where: { id: Number(id) } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    await itemRepository.remove(item);
    res.status(200).json({ message: `Item ${id} deleted successfully.` });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao apagar item de inventário.', error: errorMsg });
  }
});

export default router;
