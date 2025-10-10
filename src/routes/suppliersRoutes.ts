import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Fornecedor } from '../entity/Fornecedor';
import { User } from '../entity/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const fornecedorRepository = AppDataSource.getRepository(Fornecedor);
const userRepository = AppDataSource.getRepository(User);

// Get all suppliers (admin only)
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'tec_admin')) {
      return res.status(403).json({ message: 'Only admins or technical admins can view suppliers.' });
    }
    const fornecedores = await fornecedorRepository.find();
    res.status(200).json(fornecedores);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao obter fornecedores.', error: errorMsg });
  }
});

// Create new supplier (admin only)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user;
    const { nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos } = req.body;
    if (!user || (user.role !== 'admin' && user.role !== 'tec_admin')) {
      return res.status(403).json({ message: 'Only admins or technical admins can create suppliers.' });
    }
    const newFornecedor = fornecedorRepository.create({ nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos });
    await fornecedorRepository.save(newFornecedor);
    res.status(201).json(newFornecedor);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao criar fornecedor.', error: errorMsg });
  }
});

// Edit supplier (admin only)
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const updateData = req.body;
    if (!user || (user.role !== 'admin' && user.role !== 'tec_admin')) {
      return res.status(403).json({ message: 'Only admins or technical admins can edit suppliers.' });
    }
    const fornecedor = await fornecedorRepository.findOne({ where: { id: Number(id) } });
    if (!fornecedor) return res.status(404).json({ message: 'Supplier not found.' });
    Object.assign(fornecedor, updateData);
    await fornecedorRepository.save(fornecedor);
    res.status(200).json(fornecedor);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao editar fornecedor.', error: errorMsg });
  }
});

// Delete supplier (admin only)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'tec_admin')) {
      return res.status(403).json({ message: 'Only admins or technical admins can delete suppliers.' });
    }
    const fornecedor = await fornecedorRepository.findOne({ where: { id: Number(id) } });
    if (!fornecedor) return res.status(404).json({ message: 'Supplier not found.' });
    await fornecedorRepository.remove(fornecedor);
    res.status(200).json({ message: `Supplier ${id} deleted successfully.` });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao apagar fornecedor.', error: errorMsg });
  }
});

export default router;
