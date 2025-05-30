// src/controllers/despesasController.js
// Controller completo para gerenciamento de despesas fixas

const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ===============================================
// LISTAR DESPESAS FIXAS POR EMPRESA
// ===============================================

const listarDespesas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { empresa_id, categoria, ativa } = req.query;

    // Validar se empresa_id foi fornecido
    if (!empresa_id) {
      return res.status(400).json({
        error: 'Parâmetro obrigatório',
        message: 'ID da empresa é obrigatório (empresa_id)'
      });
    }

    const empresaId = parseInt(empresa_id);
    if (isNaN(empresaId)) {
      return res.status(400).json({
        error: 'Parâmetro inválido',
        message: 'ID da empresa deve ser um número válido'
      });
    }

    // Verificar se empresa pertence ao usuário
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId,
        ativa: true
      }
    });

    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    // Construir filtro
    const filtro = {
      empresa_id: empresaId
    };

    // Filtrar por categoria se especificado
    if (categoria) {
      filtro.categoria = {
        contains: categoria,
        mode: 'insensitive'
      };
    }

    // Filtrar por status se especificado
    if (ativa !== undefined) {
      filtro.ativa = ativa === 'true';
    }

    // Buscar despesas
    const despesas = await prisma.despesaFixa.findMany({
      where: filtro,
      orderBy: [
        { ativa: 'desc' },     // Ativas primeiro
        { ordem: 'asc' },      // Por ordem
        { valor_mensal: 'desc' }, // Maiores valores primeiro
        { categoria: 'asc' }   // Por categoria
      ]
    });

    // Calcular estatísticas
    const estatisticas = {
      total_despesas: despesas.length,
      despesas_ativas: despesas.filter(d => d.ativa).length,
      despesas_inativas: despesas.filter(d => !d.ativa).length,
      valor_total_mensal: despesas
        .filter(d => d.ativa)
        .reduce((sum, d) => sum + parseFloat(d.valor_mensal || 0), 0),
      valor_total_anual: despesas
        .filter(d => d.ativa)
        .reduce((sum, d) => sum + (parseFloat(d.valor_mensal || 0) * 12), 0),
      categorias_distintas: [...new Set(despesas.map(d => d.categoria))],
      maior_despesa: despesas.length > 0 
        ? Math.max(...despesas.map(d => parseFloat(d.valor_mensal || 0)))
        : 0
    };

    res.status(200).json({
      success: true,
      message: `${despesas.length} despesa(s) encontrada(s) para ${empresa.nome}`,
      data: {
        empresa: {
          id: empresa.id,
          nome: empresa.nome
        },
        despesas: despesas,
        estatisticas: estatisticas
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar despesas:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as despesas'
    });
  }
};

// ===============================================
// BUSCAR DESPESA ESPECÍFICA
// ===============================================

const buscarDespesa = async (req, res) => {
  try {
    const despesaId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!despesaId || isNaN(despesaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da despesa deve ser um número válido'
      });
    }

    // Buscar despesa e verificar propriedade
    const despesa = await prisma.despesaFixa.findFirst({
      where: {
        id: despesaId,
        empresa: {
          usuario_id: userId
        }
      },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            tipo_pessoa: true
          }
        }
      }
    });

    if (!despesa) {
      return res.status(404).json({
        error: 'Despesa não encontrada',
        message: 'Esta despesa não existe ou não pertence a você'
      });
    }

    // Calcular informações adicionais
    const informacoesAdicionais = {
      valor_anual: parseFloat(despesa.valor_mensal) * 12,
      categoria_formatada: despesa.categoria?.charAt(0).toUpperCase() + despesa.categoria?.slice(1).toLowerCase(),
      subcategoria_formatada: despesa.subcategoria?.charAt(0).toUpperCase() + despesa.subcategoria?.slice(1).toLowerCase(),
      percentual_do_total: 0, // Será calculado se necessário
      status_texto: despesa.ativa ? 'Ativa' : 'Inativa'
    };

    res.status(200).json({
      success: true,
      data: {
        despesa: {
          ...despesa,
          informacoes_adicionais: informacoesAdicionais
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar despesa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar a despesa'
    });
  }
};

// ===============================================
// CRIAR NOVA DESPESA
// ===============================================

const criarDespesa = async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Verifique os campos obrigatórios',
        details: errors.array()
      });
    }

    const { empresa_id, categoria, subcategoria, descricao, valor_mensal, cor, ordem } = req.body;
    const userId = req.user.id;

    // Verificar se empresa pertence ao usuário
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresa_id,
        usuario_id: userId,
        ativa: true
      }
    });

    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    // Verificar se já existe despesa com mesma categoria/subcategoria
    if (subcategoria) {
      const despesaExistente = await prisma.despesaFixa.findFirst({
        where: {
          empresa_id: empresa_id,
          categoria: categoria,
          subcategoria: subcategoria,
          ativa: true
        }
      });

      if (despesaExistente) {
        return res.status(409).json({
          error: 'Despesa já existe',
          message: `Já existe uma despesa ativa para ${categoria} > ${subcategoria}`
        });
      }
    }

    // Definir ordem automática se não fornecida
    let ordemFinal = ordem;
    if (!ordemFinal) {
      const ultimaDespesa = await prisma.despesaFixa.findFirst({
        where: { empresa_id: empresa_id },
        orderBy: { ordem: 'desc' }
      });
      ordemFinal = (ultimaDespesa?.ordem || 0) + 1;
    }

    // Criar despesa
    const novaDespesa = await prisma.despesaFixa.create({
      data: {
        empresa_id: empresa_id,
        categoria: categoria.trim(),
        subcategoria: subcategoria?.trim() || null,
        descricao: descricao?.trim() || null,
        valor_mensal: parseFloat(valor_mensal),
        cor: cor || '#6B7280', // Cor padrão cinza
        ordem: ordemFinal,
        ativa: true
      },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: empresa_id,
        acao: 'CREATE',
        tabela: 'despesas_fixas',
        registro_id: novaDespesa.id,
        dados_depois: {
          categoria: novaDespesa.categoria,
          subcategoria: novaDespesa.subcategoria,
          valor_mensal: novaDespesa.valor_mensal,
          ativa: novaDespesa.ativa
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Despesa fixa criada com sucesso',
      data: {
        despesa: {
          ...novaDespesa,
          valor_anual: parseFloat(novaDespesa.valor_mensal) * 12
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar despesa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar a despesa'
    });
  }
};

// ===============================================
// ATUALIZAR DESPESA
// ===============================================

const atualizarDespesa = async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const despesaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { categoria, subcategoria, descricao, valor_mensal, cor, ordem, ativa } = req.body;

    if (!despesaId || isNaN(despesaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da despesa deve ser um número válido'
      });
    }

    // Verificar se despesa existe e pertence ao usuário
    const despesaExistente = await prisma.despesaFixa.findFirst({
      where: {
        id: despesaId,
        empresa: {
          usuario_id: userId
        }
      }
    });

    if (!despesaExistente) {
      return res.status(404).json({
        error: 'Despesa não encontrada',
        message: 'Esta despesa não existe ou não pertence a você'
      });
    }

    // Verificar conflito de categoria/subcategoria se alterada
    if ((categoria && categoria !== despesaExistente.categoria) || 
        (subcategoria && subcategoria !== despesaExistente.subcategoria)) {
      
      const conflito = await prisma.despesaFixa.findFirst({
        where: {
          empresa_id: despesaExistente.empresa_id,
          categoria: categoria || despesaExistente.categoria,
          subcategoria: subcategoria || despesaExistente.subcategoria,
          id: { not: despesaId },
          ativa: true
        }
      });

      if (conflito) {
        return res.status(409).json({
          error: 'Conflito de categoria',
          message: 'Já existe outra despesa ativa com esta categoria/subcategoria'
        });
      }
    }

    // Atualizar despesa
    const despesaAtualizada = await prisma.despesaFixa.update({
      where: { id: despesaId },
      data: {
        categoria: categoria?.trim() || despesaExistente.categoria,
        subcategoria: subcategoria?.trim() || despesaExistente.subcategoria,
        descricao: descricao?.trim() || despesaExistente.descricao,
        valor_mensal: valor_mensal ? parseFloat(valor_mensal) : despesaExistente.valor_mensal,
        cor: cor || despesaExistente.cor,
        ordem: ordem !== undefined ? parseInt(ordem) : despesaExistente.ordem,
        ativa: ativa !== undefined ? ativa : despesaExistente.ativa,
        updated_at: new Date()
      },
      include: {
        empresa: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: despesaExistente.empresa_id,
        acao: 'UPDATE',
        tabela: 'despesas_fixas',
        registro_id: despesaId,
        dados_antes: {
          categoria: despesaExistente.categoria,
          subcategoria: despesaExistente.subcategoria,
          valor_mensal: despesaExistente.valor_mensal,
          ativa: despesaExistente.ativa
        },
        dados_depois: {
          categoria: despesaAtualizada.categoria,
          subcategoria: despesaAtualizada.subcategoria,
          valor_mensal: despesaAtualizada.valor_mensal,
          ativa: despesaAtualizada.ativa
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Despesa atualizada com sucesso',
      data: {
        despesa: {
          ...despesaAtualizada,
          valor_anual: parseFloat(despesaAtualizada.valor_mensal) * 12
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar despesa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar a despesa'
    });
  }
};

// ===============================================
// ATIVAR/DESATIVAR DESPESA
// ===============================================

const toggleDespesa = async (req, res) => {
  try {
    const despesaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { ativa } = req.body;

    if (!despesaId || isNaN(despesaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da despesa deve ser um número válido'
      });
    }

    if (typeof ativa !== 'boolean') {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'Campo "ativa" deve ser true ou false'
      });
    }

    // Verificar se despesa existe e pertence ao usuário
    const despesaExistente = await prisma.despesaFixa.findFirst({
      where: {
        id: despesaId,
        empresa: {
          usuario_id: userId
        }
      }
    });

    if (!despesaExistente) {
      return res.status(404).json({
        error: 'Despesa não encontrada',
        message: 'Esta despesa não existe ou não pertence a você'
      });
    }

    // Atualizar status
    const despesaAtualizada = await prisma.despesaFixa.update({
      where: { id: despesaId },
      data: {
        ativa,
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: despesaExistente.empresa_id,
        acao: 'UPDATE',
        tabela: 'despesas_fixas',
        registro_id: despesaId,
        dados_antes: { ativa: despesaExistente.ativa },
        dados_depois: { ativa },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: `Despesa ${ativa ? 'ativada' : 'desativada'} com sucesso`,
      data: { despesa: despesaAtualizada }
    });

  } catch (error) {
    console.error('❌ Erro ao alterar status da despesa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível alterar o status da despesa'
    });
  }
};

// ===============================================
// DELETAR DESPESA (SOFT DELETE)
// ===============================================

const deletarDespesa = async (req, res) => {
  try {
    const despesaId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!despesaId || isNaN(despesaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da despesa deve ser um número válido'
      });
    }

    // Verificar se despesa existe e pertence ao usuário
    const despesaExistente = await prisma.despesaFixa.findFirst({
      where: {
        id: despesaId,
        empresa: {
          usuario_id: userId
        }
      }
    });

    if (!despesaExistente) {
      return res.status(404).json({
        error: 'Despesa não encontrada',
        message: 'Esta despesa não existe ou não pertence a você'
      });
    }

    // Soft delete (desativar)
    const despesaDesativada = await prisma.despesaFixa.update({
      where: { id: despesaId },
      data: {
        ativa: false,
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: despesaExistente.empresa_id,
        acao: 'DELETE',
        tabela: 'despesas_fixas',
        registro_id: despesaId,
        dados_antes: {
          categoria: despesaExistente.categoria,
          subcategoria: despesaExistente.subcategoria,
          valor_mensal: despesaExistente.valor_mensal,
          ativa: despesaExistente.ativa
        },
        dados_depois: { ativa: false },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Despesa removida com sucesso',
      data: { despesa: despesaDesativada }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar despesa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar a despesa'
    });
  }
};

// ===============================================
// ESTATÍSTICAS POR CATEGORIA
// ===============================================

const estatisticasPorCategoria = async (req, res) => {
  try {
    const userId = req.user.id;
    const { empresa_id } = req.query;

    if (!empresa_id) {
      return res.status(400).json({
        error: 'Parâmetro obrigatório',
        message: 'ID da empresa é obrigatório (empresa_id)'
      });
    }

    const empresaId = parseInt(empresa_id);

    // Verificar propriedade da empresa
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId,
        ativa: true
      }
    });

    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    // Buscar despesas agrupadas por categoria
    const despesasPorCategoria = await prisma.despesaFixa.groupBy({
      by: ['categoria'],
      where: {
        empresa_id: empresaId,
        ativa: true
      },
      _sum: {
        valor_mensal: true
      },
      _count: {
        id: true
      },
      _avg: {
        valor_mensal: true
      }
    });

    // Calcular total geral
    const totalGeral = despesasPorCategoria.reduce(
      (sum, cat) => sum + parseFloat(cat._sum.valor_mensal || 0), 0
    );

    // Formatar resultado
    const estatisticas = despesasPorCategoria.map(categoria => ({
      categoria: categoria.categoria,
      total_mensal: parseFloat(categoria._sum.valor_mensal || 0),
      total_anual: parseFloat(categoria._sum.valor_mensal || 0) * 12,
      quantidade_despesas: categoria._count.id,
      valor_medio: parseFloat(categoria._avg.valor_mensal || 0),
      percentual_do_total: totalGeral > 0 
        ? ((parseFloat(categoria._sum.valor_mensal || 0) / totalGeral) * 100)
        : 0
    })).sort((a, b) => b.total_mensal - a.total_mensal);

    res.status(200).json({
      success: true,
      message: `Estatísticas por categoria para ${empresa.nome}`,
      data: {
        empresa: {
          id: empresa.id,
          nome: empresa.nome
        },
        total_geral_mensal: totalGeral,
        total_geral_anual: totalGeral * 12,
        categorias: estatisticas,
        resumo: {
          total_categorias: estatisticas.length,
          categoria_mais_cara: estatisticas[0]?.categoria || null,
          valor_categoria_mais_cara: estatisticas[0]?.total_mensal || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas'
    });
  }
};

// ===============================================
// EXPORTAR FUNÇÕES
// ===============================================

module.exports = {
  listarDespesas,
  buscarDespesa,
  criarDespesa,
  atualizarDespesa,
  toggleDespesa,
  deletarDespesa,
  estatisticasPorCategoria
};