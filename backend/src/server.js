// src/server.js
// Servidor principal - Versão simplificada para teste

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PrismaClient } = require('@prisma/client');

// Inicializar
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ===============================================
// MIDDLEWARES
// ===============================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs simples
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ===============================================
// ROTAS DE SAÚDE
// ===============================================

// Health check geral
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected',
      services: {
        auth: 'Running',
        empresas: 'Running',
        premissas: 'Running (test mode)'
      }
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Falha na verificação de saúde do sistema',
      database: 'Disconnected'
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Sistema Mondarc Financial API',
    version: '1.0.0',
    status: 'Running',
    documentation: '/health',
    endpoints: [
      'GET /health - Status do sistema',
      'POST /api/auth/register - Cadastrar usuário',
      'POST /api/auth/login - Fazer login',
      'GET /api/empresas - Listar empresas',
      'GET /api/premissas - Listar premissas (test mode)'
    ]
  });
});

// ===============================================
// REGISTRAR ROTAS DE API
// ===============================================

// Rotas de autenticação (completas)
app.use('/api/auth', require('./routes/auth'));

// Rotas de empresas (completas)
app.use('/api/empresas', require('./routes/empresas'));

// Rotas de premissas (teste básico)
app.use('/api/premissas', require('./routes/premissas'));

// ===============================================
// TRATAMENTO DE ERROS
// ===============================================

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `Endpoint ${req.method} ${req.originalUrl} não existe`,
    available_endpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/empresas',
      'GET /api/premissas'
    ]
  });
});

// Erro global
app.use((error, req, res, next) => {
  console.error('💥 Erro não tratado:', error);
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: 'Falha inesperada no sistema',
    timestamp: new Date().toISOString()
  });
});

// ===============================================
// INICIAR SERVIDOR
// ===============================================

const startServer = async () => {
  try {
    // Testar conexão com banco
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 =======================================');
      console.log('🚀 MONDARC FINANCIAL SYSTEM - BACKEND');
      console.log('🚀 =======================================');
      console.log(`🚀 Servidor rodando na porta: ${PORT}`);
      console.log(`🚀 URL: http://localhost:${PORT}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
      console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 =======================================');
      console.log('🚀 APIs Disponíveis:');
      console.log('🚀 • Autenticação: /api/auth/*');
      console.log('🚀 • Empresas: /api/empresas/*');
      console.log('🚀 • Premissas: /api/premissas/* (teste)');
      console.log('🚀 =======================================');
      console.log('');
    });

  } catch (error) {
    console.error('💥 Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar o servidor
startServer();

module.exports = app;