// src/routes/empresas.js
// Rotas para gerenciamento de empresas

const express = require('express');
const router = express.Router();

// Importar controllers e middlewares
const {
  listarEmpresas,
  buscarEmpresa,
  criarEmpresa,
  atualizarEmpresa,
  toggleEmpresa,
  deletarEmpresa
} = require('../controllers/empresasController');

const { authenticateToken, checkEmpresaOwnership } = require('../middleware/auth');

const {
  validateCreateEmpresa,
  validateUpdateEmpresa,
  validateToggleEmpresa
} = require('../utils/validations');

// ===============================================
// TODAS AS ROTAS REQUEREM AUTENTICAÇÃO
// ===============================================

router.use(authenticateToken);

// ===============================================
// ROTAS PRINCIPAIS
// ===============================================

// GET /api/empresas
// Listar todas as empresas do usuário logado
router.get('/', listarEmpresas);

// POST /api/empresas
// Criar nova empresa
router.post('/', validateCreateEmpresa, criarEmpresa);

// GET /api/empresas/:id
// Buscar empresa específica
router.get('/:id', buscarEmpresa);

// PUT /api/empresas/:id
// Atualizar empresa
router.put('/:id', validateUpdateEmpresa, atualizarEmpresa);

// PATCH /api/empresas/:id/toggle
// Ativar/desativar empresa
router.patch('/:id/toggle', validateToggleEmpresa, toggleEmpresa);

// DELETE /api/empresas/:id
// Deletar empresa (soft delete)
router.delete('/:id', deletarEmpresa);

// ===============================================
// ROTAS DE INFORMAÇÕES
// ===============================================

// GET /api/empresas/health
// Health check específico de empresas
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Empresas Service',
    timestamp: new Date().toISOString(),
    user: req.user ? {
      id: req.user.id,
      nome: req.user.nome
    } : null,
    endpoints: {
      list: 'GET /api/empresas',
      create: 'POST /api/empresas',
      get: 'GET /api/empresas/:id',
      update: 'PUT /api/empresas/:id',
      toggle: 'PATCH /api/empresas/:id/toggle',
      delete: 'DELETE /api/empresas/:id'
    }
  });
});

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS ESPECÍFICO
// ===============================================

router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de empresas:', error);

  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Dados duplicados',
      message: 'CNPJ/CPF já cadastrado para este usuário'
    });
  }

  // Erro de registro não encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Empresa não encontrada',
      message: 'A empresa solicitada não existe'
    });
  }

  // Erro de validação
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'Verifique a formatação dos dados enviados'
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno de empresas',
    message: 'Tente novamente em alguns minutos'
  });
});

module.exports = router;