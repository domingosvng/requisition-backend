import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
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
router.post('/',
  authenticateJWT,
  // Basic sanitization and validation
  body('nome').trim().isString().isLength({ min: 2, max: 200 }).withMessage('Nome é obrigatório e deve ter entre 2 e 200 caracteres.'),
  body('email').optional().isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('telefone').optional().trim().isLength({ min: 6, max: 30 }).withMessage('Telefone inválido.'),
  body('contactoPrincipal').optional().trim().isLength({ max: 100 }).withMessage('Contacto inválido.'),
  body('nif').optional().trim().matches(/^\d{5,20}$/).withMessage('NIF inválido. Deve conter apenas dígitos (5-20).'),
  body('endereco').optional().trim().isLength({ max: 500 }).withMessage('Endereço muito longo.'),
  body('servicosFornecidos').optional().custom((val) => {
    // allow array or comma-separated string on incoming payload
    if (Array.isArray(val)) {
      if (val.length > 50) throw new Error('Máximo 50 serviços permitidos.');
      for (const s of val) {
        if (typeof s !== 'string' || s.trim().length === 0 || s.trim().length > 200) throw new Error('Cada serviço deve ser texto (1-200 caracteres).');
      }
      return true;
    }
    if (typeof val === 'string') {
      // allow comma-separated list
      const parts = val.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (parts.length > 50) throw new Error('Máximo 50 serviços permitidos.');
      return true;
    }
    throw new Error('servicosFornecidos deve ser uma lista ou string separada por vírgulas.');
  }),
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Map to concise field/message shape
      const mapped = errors.array().map((e: any) => ({ field: e.param || e.path || e.location || 'body', message: e.msg || e.message }));
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
        const existing = await fornecedorRepository.findOne({ where: { nif } });
        if (existing) return res.status(409).json({ message: 'Já existe um fornecedor com esse NIF.' });
      }

      // Normalize servicosFornecidos if client sent a comma-separated string
      const normalizedServicos = Array.isArray(servicosFornecidos)
        ? servicosFornecidos.map((s: string) => s.trim()).filter(Boolean)
        : (typeof servicosFornecidos === 'string' ? servicosFornecidos.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

      const newFornecedor = fornecedorRepository.create({ nome, contactoPrincipal, email, telefone, nif, endereco, servicosFornecidos: normalizedServicos });
      await fornecedorRepository.save(newFornecedor);
      res.status(201).json(newFornecedor);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Erro interno ao criar fornecedor.', error: errorMsg });
    }
  }
);

// Edit supplier (admin only)
router.put('/:id',
  authenticateJWT,
  body('nome').optional().trim().isString().isLength({ min: 2, max: 200 }).withMessage('Nome deve ter entre 2 e 200 caracteres.'),
  body('email').optional().isEmail().withMessage('Email inválido.').normalizeEmail(),
  body('telefone').optional().trim().isLength({ min: 6, max: 30 }).withMessage('Telefone inválido.'),
  body('nif').optional().trim().matches(/^\d{5,20}$/).withMessage('NIF inválido. Deve conter apenas dígitos (5-20).'),
  body('servicosFornecidos').optional().custom((val) => {
    if (Array.isArray(val)) {
      if (val.length > 50) throw new Error('Máximo 50 serviços permitidos.');
      for (const s of val) {
        if (typeof s !== 'string' || s.trim().length === 0 || s.trim().length > 200) throw new Error('Cada serviço deve ser texto (1-200 caracteres).');
      }
      return true;
    }
    if (typeof val === 'string') return true; // will normalize in handler
    throw new Error('servicosFornecidos deve ser uma lista ou string separada por vírgulas.');
  }),
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mapped = errors.array().map((e: any) => ({ field: e.param || e.path || e.location || 'body', message: e.msg || e.message }));
      return res.status(400).json({ errors: mapped });
    }

    try {
      const { id } = req.params;
      const user = req.user;
      const updateData = req.body;
      if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
        return res.status(403).json({ message: 'Only admins or technical admins can edit suppliers.' });
      }
      const fornecedor = await fornecedorRepository.findOne({ where: { id: Number(id) } });
      if (!fornecedor) return res.status(404).json({ message: 'Supplier not found.' });

      // If updating NIF, ensure uniqueness
      if (updateData && updateData.nif && updateData.nif !== fornecedor.nif) {
        const existing = await fornecedorRepository.findOne({ where: { nif: updateData.nif } });
        if (existing) return res.status(409).json({ message: 'Já existe um fornecedor com esse NIF.' });
      }

      // Normalize services if provided as string
      if (updateData && typeof updateData.servicosFornecidos === 'string') {
        updateData.servicosFornecidos = updateData.servicosFornecidos.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (updateData && Array.isArray(updateData.servicosFornecidos)) {
        updateData.servicosFornecidos = updateData.servicosFornecidos.map((s: string) => s.trim()).filter(Boolean);
      }

      Object.assign(fornecedor, updateData);
      await fornecedorRepository.save(fornecedor);
      res.status(200).json(fornecedor);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Erro interno ao editar fornecedor.', error: errorMsg });
    }
  }
);

// Delete supplier (admin only)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
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
