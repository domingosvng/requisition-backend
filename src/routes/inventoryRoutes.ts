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
if (process.env.NODE_ENV !== 'production') {
  router.get('/public', async (req, res) => {
    try {
      const items = await itemRepository.find();
      res.status(200).json(items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: 'Erro interno ao obter inventário (public).', error: errorMsg });
    }
  });
  // Dev helper: return a short-lived admin token to the frontend for local development
  router.get('/dev-token', async (req, res) => {
    try {
      const secret = process.env.JWT_SECRET || 'yourSuperSecretKey';
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 1, username: 'dev-autotoken', role: 'ADMIN' }, secret, { expiresIn: '1h' });
      return res.json({ token });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to create dev token.' });
    }
  });
  // Dev helper: serve a small HTML page that writes a fresh dev token into localStorage and redirects back.
  router.get('/set-dev-token', async (req, res) => {
    try {
      const secret = process.env.JWT_SECRET || 'yourSuperSecretKey';
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: 1, username: 'dev-autotoken', role: 'ADMIN' }, secret, { expiresIn: '1h' });
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Set Dev Token</title></head><body><script>localStorage.setItem('userToken', '${token}'); localStorage.setItem('userRole','ADMIN'); setTimeout(()=>{window.location.href='/'},300);</script><p>Setting dev token and redirecting...</p></body></html>`;
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err) {
      return res.status(500).send('Failed to set dev token');
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
    body('categoria').optional().isString().withMessage('Categoria inválida'),
    body('quantidade').optional().isInt({ min: 0 }).withMessage('Quantidade deve ser inteiro >= 0'),
    body('unidadeMedida').optional().isLength({ max: 50 }).withMessage('Unidade muito longa'),
    body('localizacao').optional().isLength({ max: 200 }).withMessage('Localizacao muito longa'),
    body('status').optional().isIn(['ATIVO', 'INATIVO']).withMessage('Status inválido'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e: any) => ({ field: e.param, message: e.msg })) });
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
  if (key === 'quantidade') item.quantidade = Number(body[key] || 0);
  else if (key === 'valorUnitario') item.valorUnitario = body[key] != null ? Number(body[key]) : undefined;
  else (item as any)[key] = body[key];
      }
    }

    // Handle fornecedor relation safely: accept id (number), object with id, or string (try to find by nome)
    if (Object.prototype.hasOwnProperty.call(body, 'fornecedor')) {
      const f = body.fornecedor;
      let foundFornecedor = null;
      if (!f) {
        foundFornecedor = null;
      } else if (typeof f === 'number') {
        foundFornecedor = await fornecedorRepository.findOne({ where: { id: Number(f) } });
      } else if (typeof f === 'object' && f.id) {
        foundFornecedor = await fornecedorRepository.findOne({ where: { id: Number(f.id) } });
      } else if (typeof f === 'string') {
        // try to find by nome (best-effort)
        foundFornecedor = await fornecedorRepository.findOne({ where: { nome: String(f) } });
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
