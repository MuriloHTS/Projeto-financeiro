// src/routes/lancamentos.js
// Rotas para gerenciamento de lançamentos pontuais

const express = require('express');
const router = express.Router();

// Importar controllers e middlewares
const {
  listarLancamentos,
  buscarLancamento,
  criarLancamento,
  atualizarLancamento,
  alterarStatusLancamento,
  deletarLancamento,
  resumoFinanceiroPeriodo
} = require('../controllers/lancamentosController');

const { authenticateToken } = require('../middleware/auth');

const {
  validateCreateLancamento,
  validateUpdateLancamento,
  validateStatusLancamento
} = require('../utils/validations');

// ===============================================
// TODAS AS ROTAS REQUEREM AUTENTICAÇÃO
// ===============================================

router.use(authenticateToken);

// ===============================================
// ROTAS PRINCIPAIS
// ===============================================

// GET /api/lancamentos?empresa_id=1&ano=2025&mes=3&tipo=RECEITA&status=REALIZADO
// Listar lançamentos por empresa (obrigatório informar empresa_id)
router.get('/', listarLancamentos);

// POST /api/lancamentos
// Criar novo lançamento pontual
router.post('/', validateCreateLancamento, criarLancamento);

// GET /api/lancamentos/:id
// Buscar lançamento específico
router.get('/:id', buscarLancamento);

// PUT /api/lancamentos/:id
// Atualizar lançamento
router.put('/:id', validateUpdateLancamento, atualizarLancamento);

// PATCH /api/lancamentos/:id/status
// Alterar status do lançamento
router.patch('/:id/status', validateStatusLancamento, alterarStatusLancamento);

// DELETE /api/lancamentos/:id
// Deletar lançamento
router.delete('/:id', deletarLancamento);

// ===============================================
// ROTAS DE RELATÓRIOS E RESUMOS
// ===============================================

// GET /api/lancamentos/resumo/periodo?empresa_id=1&ano=2025&mes_inicio=1&mes_fim=12
// Resumo financeiro por período
router.get('/resumo/periodo', resumoFinanceiroPeriodo);

// ===============================================
// ROTAS DE INFORMAÇÕES E UTILITÁRIOS
// ===============================================

// GET /api/lancamentos/health
// Health check específico de lançamentos
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Lançamentos Pontuais Service',
    timestamp: new Date().toISOString(),
    user: req.user ? {
      id: req.user.id,
      nome: req.user.nome
    } : null,
    endpoints: {
      list: 'GET /api/lancamentos?empresa_id=1',
      create: 'POST /api/lancamentos',
      get: 'GET /api/lancamentos/:id',
      update: 'PUT /api/lancamentos/:id',
      status: 'PATCH /api/lancamentos/:id/status',
      delete: 'DELETE /api/lancamentos/:id',
      resumo: 'GET /api/lancamentos/resumo/periodo?empresa_id=1&ano=2025'
    },
    parametros: {
      empresa_id: 'Obrigatório para listar e resumos',
      ano: 'Opcional para filtrar por ano',
      mes: 'Opcional para filtrar por mês',
      tipo: 'Opcional: RECEITA ou DESPESA',
      status: 'Opcional: PLANEJADO, REALIZADO ou CANCELADO'
    }
  });
});

// GET /api/lancamentos/template/categorias
// Template de categorias para lançamentos
router.get('/template/categorias', (req, res) => {
  res.json({
    success: true,
    message: 'Templates de categorias para lançamentos pontuais',
    data: {
      categorias_receita: [
        'Vendas Extraordinárias',
        'Bonificações',
        'Reembolsos',
        'Juros Recebidos',
        'Dividendos',
        'Venda de Ativos',
        'Consultoria Pontual',
        'Licenciamento',
        'Outros Recebimentos'
      ],
      categorias_despesa: [
        'Equipamentos',
        'Manutenção Corretiva',
        'Treinamentos',
        'Viagens',
        'Marketing Pontual',
        'Consultoria Externa',
        'Multas e Penalidades',
        'Reparos Emergenciais',
        'Investimentos',
        'Outras Despesas'
      ],
      tipos_disponíveis: [
        { valor: 'RECEITA', nome: 'Receita', cor: '#10B981' },
        { valor: 'DESPESA', nome: 'Despesa', cor: '#EF4444' }
      ],
      status_disponíveis: [
        { valor: 'PLANEJADO', nome: 'Planejado', cor: '#F59E0B' },
        { valor: 'REALIZADO', nome: 'Realizado', cor: '#10B981' },
        { valor: 'CANCELADO', nome: 'Cancelado', cor: '#6B7280' }
      ],
      observacoes: [
        'Lançamentos pontuais são eventos não recorrentes',
        'Diferem das receitas/despesas fixas mensais',
        'Úteis para planejamento de fluxo de caixa',
        'Status REALIZADO confirma que o evento ocorreu'
      ]
    }
  });
});

// GET /api/lancamentos/template/importacao
// Template para importação em lote
router.get('/template/importacao', (req, res) => {
  res.json({
    success: true,
    message: 'Template para importação de lançamentos pontuais',
    data: {
      formato_csv: {
        cabecalho: [
          'tipo', 'ano', 'mes', 'descricao', 'valor', 
          'categoria', 'data_vencimento', 'status', 'observacao'
        ],
        exemplo_linhas: [
          'RECEITA,2025,3,"Venda equipamento usado",15000.00,Venda de Ativos,2025-03-15,PLANEJADO,"Equipamento antigo do escritório"',
          'DESPESA,2025,4,"Reforma escritório",8500.00,Manutenção Corretiva,2025-04-10,PLANEJADO,"Pintura e reparo do teto"',
          'RECEITA,2025,5,"Consultoria especial",12000.00,Consultoria Pontual,2025-05-20,PLANEJADO,"Projeto especial cliente X"'
        ]
      },
      formato_json: {
        exemplo: [
          {
            tipo: "RECEITA",
            ano: 2025,
            mes: 3,
            descricao: "Venda equipamento usado",
            valor: 15000.00,
            categoria: "Venda de Ativos",
            data_vencimento: "2025-03-15",
            status: "PLANEJADO",
            observacao: "Equipamento antigo do escritório"
          }
        ]
      },
      validacoes: {
        tipo: 'RECEITA ou DESPESA',
        ano: 'Entre 2020 e 2030',
        mes: 'Entre 1 e 12',
        descricao: 'Obrigatório, até 255 caracteres',
        valor: 'Maior que 0, até 999.999.999,99',
        categoria: 'Opcional, até 100 caracteres',
        data_vencimento: 'Opcional, formato YYYY-MM-DD',
        status: 'PLANEJADO, REALIZADO ou CANCELADO',
        observacao: 'Opcional, até 500 caracteres'
      }
    }
  });
});

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS ESPECÍFICO
// ===============================================

router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de lançamentos:', error);

  // Erro de validação do Prisma - Constraint única
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Dados duplicados',
      message: 'Já existe um lançamento similar neste período'
    });
  }

  // Erro de registro não encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Lançamento não encontrado',
      message: 'O lançamento solicitado não existe'
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
    error: 'Erro interno de lançamentos',
    message: 'Tente novamente em alguns minutos'
  });
});

module.exports = router;