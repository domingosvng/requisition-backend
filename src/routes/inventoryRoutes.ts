import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AppDataSource } from '../data-source';
import { ItemInventario } from '../entity/ItemInventario';
import { Fornecedor } from '../entity/Fornecedor';
import { User } from '../entity/User';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const itemRepository = AppDataSource.getRepository(ItemInventario);
const userRepository = AppDataSource.getRepository(User);
const fornecedorRepository = AppDataSource.getRepository(Fornecedor);

// Dev-only public read route: useful for local development where frontend may not have a token.
// This route is intentionally not protected and should NOT be enabled in production.
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';
console.log('Dev routes enabled:', isDevelopment, 'NODE_ENV:', process.env.NODE_ENV);
if (isDevelopment) {
  router.get('/public', async (req, res) => {
    try {
      const items = await itemRepository.find();
      res.status(200).json(items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Erro interno ao obter inventário (public).', error: errorMsg });
    }
  });

}

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
router.post('/', authenticateJWT,
  // validation middleware
  [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 200 }).withMessage('Nome muito longo'),
    body('descricao').optional().isLength({ max: 1000 }).withMessage('Descricao muito longa'),
    body('categoria').optional().custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      if (Array.isArray(value)) {
        return value.every(cat => typeof cat === 'string' && cat.trim().length > 0);
      }
      if (typeof value === 'string') return value.trim().length > 0;
      return false;
    }).withMessage('Categoria deve ser uma string ou array de strings válidas'),
    body('quantidade').optional().isInt({ min: 0 }).withMessage('Quantidade deve ser inteiro >= 0'),
    body('unidadeMedida').optional().isLength({ max: 50 }).withMessage('Unidade muito longa'),
    body('localizacao').optional().isLength({ max: 200 }).withMessage('Localizacao muito longa'),
    body('status').optional().isIn(['Em Stock', 'Sem Stock']).withMessage('Status inválido'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mapped = errors.array().map((e: any) => ({ 
        field: e.param || e.path || e.location || 'body', 
        message: e.msg || e.message,
        value: e.value
      }));
      return res.status(400).json({ 
        message: 'Dados de entrada inválidos. Verifique os campos destacados.',
        errors: mapped,
        errorType: 'VALIDATION_ERROR'
      });
    }
  try {
    const user = req.user;
    let { nome, descricao, categoria, quantidade, unidadeMedida, localizacao, status, dataEntrada, dataUltimaSaida, fornecedor, valorUnitario } = req.body;
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
    status = status || (quantidade === 0 ? 'Sem Stock' : 'Em Stock');

    // Handle dates
    const parsedDataEntrada = dataEntrada ? new Date(dataEntrada) : undefined;
    const parsedDataUltimaSaida = dataUltimaSaida ? new Date(dataUltimaSaida) : undefined;

    // Handle fornecedor
    let foundFornecedor = null;
    let fornecedorNome = null;
    if (fornecedor) {
      if (typeof fornecedor === 'number') {
        foundFornecedor = await fornecedorRepository.findOne({ where: { id: Number(fornecedor) } });
      } else if (typeof fornecedor === 'object' && fornecedor.id) {
        foundFornecedor = await fornecedorRepository.findOne({ where: { id: Number(fornecedor.id) } });
      } else if (typeof fornecedor === 'string') {
        // First try to find existing fornecedor
        foundFornecedor = await fornecedorRepository.findOne({ where: { nome: String(fornecedor) } });
        // If not found, store as string name
        if (!foundFornecedor) {
          fornecedorNome = String(fornecedor);
        }
      }
    }

    const newItem = itemRepository.create({ 
      nome, 
      descricao, 
      categoria, 
      quantidade, 
      unidadeMedida, 
      localizacao, 
      status,
      dataEntrada: parsedDataEntrada,
      dataUltimaSaida: parsedDataUltimaSaida,
      fornecedor: foundFornecedor || undefined,
      fornecedorNome: fornecedorNome || undefined,
      valorUnitario: valorUnitario != null ? Number(valorUnitario) : undefined
    });
    await itemRepository.save(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Failed to create inventory item:', error);
    res.status(500).json({ message: 'Erro interno ao criar item de inventário.', error: errorMsg });
  }
});

// Edit inventory item (admin only)
router.put('/:id', authenticateJWT,
  // validation middleware for edit
  [
    body('nome').optional().trim().notEmpty().withMessage('Nome é obrigatório').isLength({ max: 200 }).withMessage('Nome muito longo'),
    body('descricao').optional().isLength({ max: 1000 }).withMessage('Descricao muito longa'),
    body('categoria').optional().custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      if (Array.isArray(value)) {
        return value.every(cat => typeof cat === 'string' && cat.trim().length > 0);
      }
      if (typeof value === 'string') return value.trim().length > 0;
      return false;
    }).withMessage('Categoria deve ser uma string ou array de strings válidas'),
    body('quantidade').optional().isInt({ min: 0 }).withMessage('Quantidade deve ser inteiro >= 0'),
    body('unidadeMedida').optional().isLength({ max: 50 }).withMessage('Unidade muito longa'),
    body('localizacao').optional().isLength({ max: 200 }).withMessage('Localizacao muito longa'),
    body('status').optional().isIn(['Em Stock', 'Sem Stock']).withMessage('Status inválido'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mapped = errors.array().map((e: any) => ({ 
        field: e.param || e.path || e.location || 'body', 
        message: e.msg || e.message,
        value: e.value
      }));
      return res.status(400).json({ 
        message: 'Dados de entrada inválidos. Verifique os campos destacados.',
        errors: mapped,
        errorType: 'VALIDATION_ERROR'
      });
    }
  try {
    const { id } = req.params;
    const user = req.user;
    const body = req.body || {};
    console.debug('[inventoryRoutes] PUT /inventario/' + id + ' body:', JSON.stringify(body).slice(0,1000));
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can edit inventory items.' });
    }
    const item = await itemRepository.findOne({ where: { id: Number(id) }, relations: ['fornecedor'] });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    // Only copy allowed scalar fields to avoid assigning incompatible types
    const allowed = ['nome','descricao','categoria','quantidade','unidadeMedida','localizacao','dataEntrada','dataUltimaSaida','valorUnitario','status'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        // basic normalization
        if (key === 'quantidade') {
          item.quantidade = Number(body[key] || 0);
          // Auto-update status based on quantity
          if (item.quantidade === 0 && item.status !== 'Sem Stock') {
            item.status = 'Sem Stock';
          } else if (item.quantidade > 0) {
            item.status = 'Em Stock';
          }
        } else if (key === 'valorUnitario') {
          item.valorUnitario = body[key] != null ? Number(body[key]) : undefined;
        } else if (key === 'categoria') {
          // Handle categoria as array or string
          if (Array.isArray(body[key])) {
            item.categoria = body[key].join(', ');
          } else if (typeof body[key] === 'string') {
            item.categoria = body[key];
          } else {
            item.categoria = String(body[key] || '');
          }
        } else if (key === 'dataEntrada' || key === 'dataUltimaSaida') {
          // Handle dates properly
          if (body[key]) {
            (item as any)[key] = new Date(body[key]);
          } else {
            (item as any)[key] = undefined;
          }
        } else {
          (item as any)[key] = body[key];
        }
      }
    }

    // Handle fornecedor relation safely: accept id (number), object with id, or string (try to find by nome)
    if (Object.prototype.hasOwnProperty.call(body, 'fornecedor')) {
      const f = body.fornecedor;
      let foundFornecedor = null;
      if (!f) {
        foundFornecedor = null;
        item.fornecedorNome = undefined;
      } else if (typeof f === 'number') {
        foundFornecedor = await fornecedorRepository.findOne({ where: { id: Number(f) } });
        item.fornecedorNome = undefined;
      } else if (typeof f === 'object' && f.id) {
        foundFornecedor = await fornecedorRepository.findOne({ where: { id: Number(f.id) } });
        item.fornecedorNome = undefined;
      } else if (typeof f === 'string') {
        // try to find by nome (best-effort)
        foundFornecedor = await fornecedorRepository.findOne({ where: { nome: String(f) } });
        // If not found as entity, store as string name
        if (!foundFornecedor) {
          item.fornecedorNome = String(f);
        } else {
          item.fornecedorNome = undefined;
        }
      }
      item.fornecedor = (foundFornecedor as Fornecedor) || undefined;
    }

    await itemRepository.save(item);
    res.status(200).json(item);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Erro ao editar item de inventario:', error);
    res.status(500).json({ message: 'Erro interno ao editar item de inventário.', error: errorMsg });
  }
});

// Increase quantity (admin only)
router.patch('/:id/increase', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { amount = 1 } = req.body;
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can modify inventory quantities.' });
    }
    const item = await itemRepository.findOne({ where: { id: Number(id) } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    
    item.quantidade += Number(amount);
    // Auto-update status when quantity changes
    if (item.quantidade > 0) {
      item.status = 'Em Stock';
    } else if (item.quantidade === 0) {
      item.status = 'Sem Stock';
    }
    
    await itemRepository.save(item);
    res.status(200).json(item);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao aumentar quantidade.', error: errorMsg });
  }
});

// Decrease quantity (admin only)
router.patch('/:id/decrease', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { amount = 1 } = req.body;
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'ADMIN_TEC')) {
      return res.status(403).json({ message: 'Only admins or technical admins can modify inventory quantities.' });
    }
    const item = await itemRepository.findOne({ where: { id: Number(id) } });
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    
    item.quantidade = Math.max(0, item.quantidade - Number(amount));
    // Auto-update status based on quantity
    if (item.quantidade > 0) {
      item.status = 'Em Stock';
    } else if (item.quantidade === 0) {
      item.status = 'Sem Stock';
    }
    
    await itemRepository.save(item);
    res.status(200).json(item);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: 'Erro interno ao diminuir quantidade.', error: errorMsg });
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
