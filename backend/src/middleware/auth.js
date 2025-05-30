// src/middleware/auth.js
// Middleware para proteger rotas e validar JWT

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===============================================
// MIDDLEWARE PRINCIPAL DE AUTENTICAÇÃO
// ===============================================

const authenticateToken = async (req, res, next) => {
  try {
    // 1. Pegar token do header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // 2. Verificar se token existe
    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso necessário',
        message: 'Faça login para acessar este recurso'
      });
    }

    // 3. Verificar se token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscar usuário no banco para validar se ainda existe e está ativo
    const usuario = await prisma.usuario.findUnique({
      where: { 
        id: decoded.userId,
        ativo: true // Só usuários ativos
      },
      include: {
        empresas: {
          where: { ativa: true }, // Só empresas ativas
          select: {
            id: true,
            nome: true,
            tipo_pessoa: true,
            ramo_atividade: true
          }
        }
      }
    });

    // 5. Verificar se usuário existe
    if (!usuario) {
      return res.status(401).json({
        error: 'Usuário não encontrado ou inativo',
        message: 'Faça login novamente'
      });
    }

    // 6. Adicionar dados do usuário na requisição
    req.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      empresas: usuario.empresas
    };

    // 7. Continuar para próxima função
    next();

  } catch (error) {
    console.error('❌ Erro na autenticação:', error);

    // Tratar diferentes tipos de erro JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token corrompido ou modificado'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'Faça login novamente'
      });
    }

    // Erro genérico
    return res.status(500).json({
      error: 'Erro interno de autenticação',
      message: 'Tente novamente em alguns minutos'
    });
  }
};

// ===============================================
// MIDDLEWARE OPCIONAL - SÓ ADICIONA USER SE TIVER TOKEN
// ===============================================

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // Sem token, mas continua
      req.user = null;
      return next();
    }

    // Com token, tenta validar
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({
      where: { 
        id: decoded.userId,
        ativo: true 
      }
    });

    req.user = usuario ? {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    } : null;

    next();
  } catch (error) {
    // Ignora erros, só não seta o user
    req.user = null;
    next();
  }
};

// ===============================================
// MIDDLEWARE PARA VERIFICAR PROPRIEDADE DE EMPRESA
// ===============================================

const checkEmpresaOwnership = async (req, res, next) => {
  try {
    const empresaId = req.params.empresaId || req.body.empresa_id;

    if (!empresaId) {
      return res.status(400).json({
        error: 'ID da empresa necessário',
        message: 'Empresa não especificada'
      });
    }

    // Verificar se empresa pertence ao usuário
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: parseInt(empresaId),
        usuario_id: req.user.id,
        ativa: true
      }
    });

    if (!empresa) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar esta empresa'
      });
    }

    // Adicionar empresa na requisição
    req.empresa = empresa;
    next();

  } catch (error) {
    console.error('❌ Erro na verificação de empresa:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Erro ao verificar permissões'
    });
  }
};

// ===============================================
// UTILITÁRIO PARA GERAR TOKEN
// ===============================================

const generateToken = (userId) => {
  return jwt.sign(
    { 
      userId: userId,
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );
};

// ===============================================
// UTILITÁRIO PARA DECODIFICAR TOKEN
// ===============================================

const decodeToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// ===============================================
// EXPORTAR FUNÇÕES
// ===============================================

module.exports = {
  authenticateToken,
  optionalAuth,
  checkEmpresaOwnership,
  generateToken,
  decodeToken
};