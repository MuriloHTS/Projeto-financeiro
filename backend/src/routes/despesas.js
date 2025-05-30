// src/routes/despesas.js
// Rotas para gerenciamento de despesas fixas

const express = require('express');
const router = express.Router();

// Importar controllers e middlewares
const {
  listarDespesas,
  buscarDespesa,
  criarDespesa,
  atualizarDespesa,
  toggleDespesa,
  deletarDespesa,
  estatisticasPorCategoria
} = require('../controllers/despesasController');

const { authenticateToken } = require('../middleware/auth');

const {
  validateCreateDespesa,
  validateUpdateDespesa,
  validateToggleDespesa
} = require('../utils/validations');

// ===============================================
// TODAS AS ROTAS REQUEREM AUTENTICAÇÃO
// ===============================================

router.use(authenticateToken);

// ===============================================
// ROTAS PRINCIPAIS
// ===============================================

// GET /api/despesas?empresa_id=1&categoria=Administrativas&ativa=true
// Listar despesas por empresa (obrigatório informar empresa_id)
router.get('/', listarDespesas);

// POST /api/despesas
// Criar nova despesa fixa
router.post('/', validateCreateDespesa, criarDespesa);

// GET /api/despesas/:id
// Buscar despesa específica
router.get('/:id', buscarDespesa);

// PUT /api/despesas/:id
// Atualizar despesa
router.put('/:id', validateUpdateDespesa, atualizarDespesa);

// PATCH /api/despesas/:id/toggle
// Ativar/desativar despesa
router.patch('/:id/toggle', validateToggleDespesa, toggleDespesa);

// DELETE /api/despesas/:id
// Deletar despesa (soft delete)
router.delete('/:id', deletarDespesa);

// ===============================================
// ROTAS DE RELATÓRIOS E ESTATÍSTICAS
// ===============================================

// GET /api/despesas/stats/categorias?empresa_id=1
// Estatísticas por categoria
router.get('/stats/categorias', estatisticasPorCategoria);

// ===============================================
// ROTAS DE INFORMAÇÕES E UTILITÁRIOS
// ===============================================

// GET /api/despesas/health
// Health check específico de despesas
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Despesas Fixas Service',
    timestamp: new Date().toISOString(),
    user: req.user ? {
      id: req.user.id,
      nome: req.user.nome
    } : null,
    endpoints: {
      list: 'GET /api/despesas?empresa_id=1',
      create: 'POST /api/despesas',
      get: 'GET /api/despesas/:id',
      update: 'PUT /api/despesas/:id',
      toggle: 'PATCH /api/despesas/:id/toggle',
      delete: 'DELETE /api/despesas/:id',
      stats: 'GET /api/despesas/stats/categorias?empresa_id=1'
    },
    parametros: {
      empresa_id: 'Obrigatório para listar',
      categoria: 'Opcional para filtrar por categoria',
      ativa: 'Opcional para filtrar por status (true/false)'
    }
  });
});

// GET /api/despesas/template/categorias
// Template de categorias padrão
router.get('/template/categorias', (req, res) => {
  res.json({
    success: true,
    message: 'Templates de categorias para despesas fixas',
    data: {
      categorias_comuns: [
        'Administrativas',
        'Operacionais', 
        'Financeiras',
        'Pessoal',
        'Marketing',
        'Tecnologia',
        'Infraestrutura',
        'Jurídico',
        'Impostos'
      ],
      subcategorias_por_categoria: {
        Administrativas: [
          'Telefone e Internet',
          'Material de Escritório',
          'Correios e Malote',
          'Aluguel e Condomínio',
          'IPTU',
          'Seguros'
        ],
        Operacionais: [
          'Energia Elétrica',
          'Água e Esgoto',
          'Combustível',
          'Manutenção',
          'Limpeza',
          'Segurança'
        ],
        Financeiras: [
          'Tarifas Bancárias',
          'Taxas de Cartão',
          'Juros',
          'IOF',
          'Contabilidade'
        ],
        Pessoal: [
          'Salários',
          'Encargos Sociais',
          'Vale Refeição',
          'Vale Transporte',
          'Plano de Saúde',
          'Treinamentos'
        ],
        Marketing: [
          'Publicidade Online',
          'Material Gráfico',
          'Eventos',
          'Site e Domínio',
          'Mídias Sociais'
        ],
        Tecnologia: [
          'Software/Licenças',
          'Hospedagem',
          'Equipamentos TI',
          'Suporte Técnico',
          'Backup/Nuvem'
        ]
      },
      cores_sugeridas: {
        Administrativas: '#6B7280',
        Operacionais: '#F59E0B', 
        Financeiras: '#EF4444',
        Pessoal: '#10B981',
        Marketing: '#8B5CF6',
        Tecnologia: '#3B82F6',
        Infraestrutura: '#F97316',
        Jurídico: '#84CC16',
        Impostos: '#EC4899'
      },
      observacoes: [
        'Use categorias que fazem sentido para seu negócio',
        'Subcategorias ajudam na organização detalhada',
        'Cores facilitam a visualização em gráficos',
        'Mantenha consistência na nomenclatura'
      ]
    }
  });
});

// ===============================================
// MIDDLEWARE DE TRATAMENTO DE ERROS ESPECÍFICO
// ===============================================

router.use((error, req, res, next) => {
  console.error('❌ Erro nas rotas de despesas:', error);

  // Erro de validação do Prisma - Constraint única
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Dados duplicados',
      message: 'Já existe uma despesa com esta categoria/subcategoria'
    });
  }

  // Erro de registro não encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Despesa não encontrada',
      message: 'A despesa solicitada não existe'
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
    error: 'Erro interno de despesas',
    message: 'Tente novamente em alguns minutos'
  });
});

module.exports = router;