// src/routes/premissas.js
// Rotas básicas para premissas (versão para teste)

const express = require('express');
const router = express.Router();

// Importar controllers e middlewares
const {
  listarPremissas,
  buscarPremissa,
  criarPremissa,
  atualizarPremissa,
  deletarPremissa
} = require('../controllers/premissasController');

const { authenticateToken } = require('../middleware/auth');
const { validateCreatePremissa, validateUpdatePremissa } = require('../utils/validations');

// ===============================================
// TODAS AS ROTAS REQUEREM AUTENTICAÇÃO
// ===============================================

router.use(authenticateToken);

// ===============================================
// ROTAS PRINCIPAIS
// ===============================================

// GET /api/premissas?empresa_id=1&ano=2025
router.get('/', listarPremissas);

// POST /api/premissas
router.post('/', validateCreatePremissa, criarPremissa);

// GET /api/premissas/:id
router.get('/:id', buscarPremissa);

// PUT /api/premissas/:id
router.put('/:id', validateUpdatePremissa, atualizarPremissa);

// DELETE /api/premissas/:id
router.delete('/:id', deletarPremissa);

// ===============================================
// ROTAS DE INFORMAÇÕES
// ===============================================

// GET /api/premissas/health
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Premissas Service',
    timestamp: new Date().toISOString(),
    user: req.user ? {
      id: req.user.id,
      nome: req.user.nome
    } : null,
    endpoints: {
      list: 'GET /api/premissas',
      create: 'POST /api/premissas',
      get: 'GET /api/premissas/:id',
      update: 'PUT /api/premissas/:id',
      delete: 'DELETE /api/premissas/:id'
    }
  });
});

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ===============================================

router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de premissas:', error);
  
  res.status(500).json({
    error: 'Erro interno de premissas',
    message: 'Tente novamente em alguns minutos'
  });
});

module.exports = router;