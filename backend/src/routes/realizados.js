// src/routes/realizados.js
// Rotas para gerenciamento de valores realizados

const express = require('express');
const router = express.Router();

// Importar controllers e middlewares
const {
  listarRealizados,
  buscarRealizado,
  salvarRealizado,
  deletarRealizado,
  comparativoRealizadoPlanejado
} = require('../controllers/realizadosController');

const { authenticateToken } = require('../middleware/auth');

const {
  validateSalvarRealizado
} = require('../utils/validations');

// ===============================================
// TODAS AS ROTAS REQUEREM AUTENTICAÇÃO
// ===============================================

router.use(authenticateToken);

// ===============================================
// ROTAS PRINCIPAIS
// ===============================================

// GET /api/realizados?empresa_id=1&ano=2025&mes=3
// Listar valores realizados por empresa (obrigatório informar empresa_id)
router.get('/', listarRealizados);

// POST /api/realizados
// Criar/atualizar valor realizado (upsert)
router.post('/', validateSalvarRealizado, salvarRealizado);

// GET /api/realizados/:id
// Buscar valor realizado específico
router.get('/:id', buscarRealizado);

// DELETE /api/realizados/:id
// Deletar valor realizado
router.delete('/:id', deletarRealizado);

// ===============================================
// ROTAS DE RELATÓRIOS E COMPARATIVOS
// ===============================================

// GET /api/realizados/comparativo/planejado?empresa_id=1&ano=2025
// Comparativo realizado vs planejado
router.get('/comparativo/planejado', comparativoRealizadoPlanejado);

// ===============================================
// ROTAS DE INFORMAÇÕES E UTILITÁRIOS
// ===============================================

// GET /api/realizados/health
// Health check específico de valores realizados
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Valores Realizados Service',
    timestamp: new Date().toISOString(),
    user: req.user ? {
      id: req.user.id,
      nome: req.user.nome
    } : null,
    endpoints: {
      list: 'GET /api/realizados?empresa_id=1',
      create_update: 'POST /api/realizados',
      get: 'GET /api/realizados/:id',
      delete: 'DELETE /api/realizados/:id',
      comparativo: 'GET /api/realizados/comparativo/planejado?empresa_id=1&ano=2025'
    },
    parametros: {
      empresa_id: 'Obrigatório para listar e comparar',
      ano: 'Opcional para filtrar/comparar por ano específico',
      mes: 'Opcional para filtrar por mês específico'
    },
    observacoes: [
      'POST funciona como upsert - cria novo ou atualiza existente',
      'Filtro por empresa_id é sempre obrigatório',
      'Comparativo requer premissa cadastrada para funcionar corretamente'
    ]
  });
});

// GET /api/realizados/template/importacao
// Template para importação em lote
router.get('/template/importacao', (req, res) => {
  res.json({
    success: true,
    message: 'Template para importação de valores realizados',
    data: {
      formato_csv: {
        cabecalho: ['ano', 'mes', 'valor', 'observacao', 'fonte'],
        exemplo_linhas: [
          '2025,1,85000.00,"Vendas Janeiro",Manual',
          '2025,2,92000.00,"Vendas Fevereiro",Manual',
          '2025,3,78000.00,"Vendas Março",Manual'
        ]
      },
      formato_json: {
        exemplo: [
          {
            ano: 2025,
            mes: 1,
            valor: 85000.00,
            observacao: "Vendas Janeiro",
            fonte: "Manual",
            detalhes: [
              { categoria_nome: "Vendas Produto A", valor: 50000.00 },
              { categoria_nome: "Vendas Produto B", valor: 35000.00 }
            ]
          }
        ]
      },
      validacoes: {
        ano: 'Entre 2020 e 2030',
        mes: 'Entre 1 e 12',
        valor: 'Maior que 0, até 999.999.999,99',
        observacao: 'Opcional, máximo 255 caracteres',
        fonte: 'Opcional, padrão "Manual"'
      },
      fontes_disponiveis: [
        'Manual',
        'Importação',
        'API Externa',
        'Sistema ERP',
        'Planilha Excel',
        'Nota Fiscal',
        'Extrato Bancário'
      ]
    }
  });
});

// GET /api/realizados/meses/nomes
// Lista de meses para formulários
router.get('/meses/nomes', (req, res) => {
  res.json({
    success: true,
    data: {
      meses: [
        { numero: 1, nome: 'Janeiro', abrev: 'Jan' },
        { numero: 2, nome: 'Fevereiro', abrev: 'Fev' },
        { numero: 3, nome: 'Março', abrev: 'Mar' },
        { numero: 4, nome: 'Abril', abrev: 'Abr' },
        { numero: 5, nome: 'Maio', abrev: 'Mai' },
        { numero: 6, nome: 'Junho', abrev: 'Jun' },
        { numero: 7, nome: 'Julho', abrev: 'Jul' },
        { numero: 8, nome: 'Agosto', abrev: 'Ago' },
        { numero: 9, nome: 'Setembro', abrev: 'Set' },
        { numero: 10, nome: 'Outubro', abrev: 'Out' },
        { numero: 11, nome: 'Novembro', abrev: 'Nov' },
        { numero: 12, nome: 'Dezembro', abrev: 'Dez' }
      ],
      trimestres: [
        { numero: 1, nome: '1º Trimestre', meses: [1, 2, 3] },
        { numero: 2, nome: '2º Trimestre', meses: [4, 5, 6] },
        { numero: 3, nome: '3º Trimestre', meses: [7, 8, 9] },
        { numero: 4, nome: '4º Trimestre', meses: [10, 11, 12] }
      ]
    }
  });
});

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS ESPECÍFICO
// ===============================================

router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de valores realizados:', error);

  // Erro de validação do Prisma - Constraint única
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Dados duplicados',
      message: 'Já existe um valor realizado para este mês/ano nesta empresa'
    });
  }

  // Erro de registro não encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Valor realizado não encontrado',
      message: 'O registro solicitado não existe'
    });
  }

  // Erro de foreign key (empresa não existe)
  if (error.code === 'P2003') {
    return res.status(400).json({
      error: 'Empresa inválida',
      message: 'A empresa especificada não existe'
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
    error: 'Erro interno de valores realizados',
    message: 'Tente novamente em alguns minutos'
  });
});

module.exports = router;