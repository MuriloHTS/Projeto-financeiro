// src/routes/auth.js
// Rotas de autenticação

const express = require('express');
const router = express.Router();

// Importar controllers e middlewares
const {
  register,
  login,
  me,
  logout,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');

const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('../utils/validations');

// ===============================================
// ROTAS PÚBLICAS (sem autenticação)
// ===============================================

// POST /api/auth/register
// Cadastrar novo usuário
router.post('/register', validateRegister, register);

// POST /api/auth/login  
// Fazer login
router.post('/login', validateLogin, login);

// GET /api/auth/health
// Health check específico da autenticação
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Authentication Service',
    timestamp: new Date().toISOString(),
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
      logout: 'POST /api/auth/logout',
      updateProfile: 'PUT /api/auth/profile',
      changePassword: 'PUT /api/auth/password'
    }
  });
});

// ===============================================
// ROTAS PROTEGIDAS (requerem autenticação)
// ===============================================

// GET /api/auth/me
// Obter dados do usuário logado
router.get('/me', authenticateToken, me);

// POST /api/auth/logout
// Fazer logout (opcional - para logs)
router.post('/logout', authenticateToken, logout);

// PUT /api/auth/profile
// Atualizar perfil do usuário
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);

// PUT /api/auth/password
// Alterar senha do usuário
router.put('/password', authenticateToken, validateChangePassword, changePassword);

// ===============================================
// ROTA DE TESTE (apenas desenvolvimento)
// ===============================================

if (process.env.NODE_ENV === 'development') {
  // GET /api/auth/test
  // Testar se middleware de auth funciona
  router.get('/test', authenticateToken, (req, res) => {
    res.json({
      message: 'Autenticação funcionando!',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  });
}

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS ESPECÍFICO
// ===============================================

router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de auth:', error);

  // Erro de validação
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'Verifique a formatação dos dados enviados'
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno de autenticação',
    message: 'Tente novamente em alguns minutos'
  });
});

module.exports = router;