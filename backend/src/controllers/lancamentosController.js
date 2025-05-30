// src/controllers/lancamentosController.js
// Controller completo para gerenciamento de lançamentos pontuais

const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ===============================================
// LISTAR LANÇAMENTOS POR EMPRESA
// ===============================================

const listarLancamentos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { empresa_id, ano, mes, tipo, status } = req.query;

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

    // Filtros opcionais
    if (ano) {
      const anoInt = parseInt(ano);
      if (!isNaN(anoInt) && anoInt >= 2020 && anoInt <= 2030) {
        filtro.ano = anoInt;
      }
    }

    if (mes) {
      const mesInt = parseInt(mes);
      if (!isNaN(mesInt) && mesInt >= 1 && mesInt <= 12) {
        filtro.mes = mesInt;
      }
    }

    if (tipo && ['RECEITA', 'DESPESA'].includes(tipo.toUpperCase())) {
      filtro.tipo = tipo.toUpperCase();
    }

    if (status && ['PLANEJADO', 'REALIZADO', 'CANCELADO'].includes(status.toUpperCase())) {
      filtro.status = status.toUpperCase();
    }

    // Buscar lançamentos
    const lancamentos = await prisma.lancamentoPontual.findMany({
      where: filtro,
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' },
        { data_vencimento: 'asc' },
        { valor: 'desc' }
      ]
    });

    // Calcular estatísticas
    const estatisticas = calcularEstatisticasLancamentos(lancamentos);

    res.status(200).json({
      success: true,
      message: `${lancamentos.length} lançamento(s) encontrado(s) para ${empresa.nome}`,
      data: {
        empresa: {
          id: empresa.id,
          nome: empresa.nome
        },
        lancamentos: lancamentos.map(l => ({
          ...l,
          mes_nome: obterNomeMes(l.mes),
          data_vencimento_formatada: l.data_vencimento ? 
            l.data_vencimento.toISOString().split('T')[0] : null
        })),
        estatisticas: estatisticas
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar lançamentos:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar os lançamentos'
    });
  }
};

// ===============================================
// BUSCAR LANÇAMENTO ESPECÍFICO
// ===============================================

const buscarLancamento = async (req, res) => {
  try {
    const lancamentoId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!lancamentoId || isNaN(lancamentoId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID do lançamento deve ser um número válido'
      });
    }

    // Buscar lançamento e verificar propriedade
    const lancamento = await prisma.lancamentoPontual.findFirst({
      where: {
        id: lancamentoId,
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

    if (!lancamento) {
      return res.status(404).json({
        error: 'Lançamento não encontrado',
        message: 'Este lançamento não existe ou não pertence a você'
      });
    }

    // Adicionar informações calculadas
    const informacoesAdicionais = {
      mes_nome: obterNomeMes(lancamento.mes),
      data_vencimento_formatada: lancamento.data_vencimento ? 
        lancamento.data_vencimento.toISOString().split('T')[0] : null,
      status_descricao: obterDescricaoStatus(lancamento.status),
      tipo_descricao: lancamento.tipo === 'RECEITA' ? 'Receita' : 'Despesa',
      impacto_fluxo: lancamento.tipo === 'RECEITA' ? '+' + lancamento.valor : '-' + lancamento.valor
    };

    res.status(200).json({
      success: true,
      data: {
        lancamento: {
          ...lancamento,
          informacoes_adicionais: informacoesAdicionais
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar lançamento:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar o lançamento'
    });
  }
};

// ===============================================
// CRIAR NOVO LANÇAMENTO
// ===============================================

const criarLancamento = async (req, res) => {
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

    const { 
      empresa_id, tipo, ano, mes, descricao, valor, 
      categoria, data_vencimento, observacao, status
    } = req.body;
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

    // Processar data de vencimento
    let dataVencimento = null;
    if (data_vencimento) {
      dataVencimento = new Date(data_vencimento);
      if (isNaN(dataVencimento.getTime())) {
        return res.status(400).json({
          error: 'Data inválida',
          message: 'Formato de data de vencimento inválido'
        });
      }
    }

    // Criar lançamento
    const novoLancamento = await prisma.lancamentoPontual.create({
      data: {
        empresa_id: empresa_id,
        tipo: tipo.toUpperCase(),
        ano: ano,
        mes: mes,
        descricao: descricao.trim(),
        valor: parseFloat(valor),
        categoria: categoria?.trim() || null,
        data_vencimento: dataVencimento,
        observacao: observacao?.trim() || null,
        status: status?.toUpperCase() || 'PLANEJADO'
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
        tabela: 'lancamentos_pontuais',
        registro_id: novoLancamento.id,
        dados_depois: {
          tipo: novoLancamento.tipo,
          descricao: novoLancamento.descricao,
          valor: novoLancamento.valor,
          ano: novoLancamento.ano,
          mes: novoLancamento.mes
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lançamento criado com sucesso',
      data: {
        lancamento: {
          ...novoLancamento,
          mes_nome: obterNomeMes(novoLancamento.mes),
          data_vencimento_formatada: novoLancamento.data_vencimento ? 
            novoLancamento.data_vencimento.toISOString().split('T')[0] : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar lançamento:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o lançamento'
    });
  }
};

// ===============================================
// ATUALIZAR LANÇAMENTO
// ===============================================

const atualizarLancamento = async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const lancamentoId = parseInt(req.params.id);
    const userId = req.user.id;
    const { tipo, descricao, valor, categoria, data_vencimento, observacao, status } = req.body;

    if (!lancamentoId || isNaN(lancamentoId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID do lançamento deve ser um número válido'
      });
    }

    // Verificar se lançamento existe e pertence ao usuário
    const lancamentoExistente = await prisma.lancamentoPontual.findFirst({
      where: {
        id: lancamentoId,
        empresa: {
          usuario_id: userId
        }
      }
    });

    if (!lancamentoExistente) {
      return res.status(404).json({
        error: 'Lançamento não encontrado',
        message: 'Este lançamento não existe ou não pertence a você'
      });
    }

    // Processar data de vencimento se fornecida
    let dataVencimento = lancamentoExistente.data_vencimento;
    if (data_vencimento !== undefined) {
      if (data_vencimento) {
        dataVencimento = new Date(data_vencimento);
        if (isNaN(dataVencimento.getTime())) {
          return res.status(400).json({
            error: 'Data inválida',
            message: 'Formato de data de vencimento inválido'
          });
        }
      } else {
        dataVencimento = null;
      }
    }

    // Atualizar lançamento
    const lancamentoAtualizado = await prisma.lancamentoPontual.update({
      where: { id: lancamentoId },
      data: {
        tipo: tipo ? tipo.toUpperCase() : lancamentoExistente.tipo,
        descricao: descricao?.trim() || lancamentoExistente.descricao,
        valor: valor ? parseFloat(valor) : lancamentoExistente.valor,
        categoria: categoria?.trim() || lancamentoExistente.categoria,
        data_vencimento: dataVencimento,
        observacao: observacao?.trim() || lancamentoExistente.observacao,
        status: status ? status.toUpperCase() : lancamentoExistente.status,
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
        empresa_id: lancamentoExistente.empresa_id,
        acao: 'UPDATE',
        tabela: 'lancamentos_pontuais',
        registro_id: lancamentoId,
        dados_antes: {
          tipo: lancamentoExistente.tipo,
          descricao: lancamentoExistente.descricao,
          valor: lancamentoExistente.valor,
          status: lancamentoExistente.status
        },
        dados_depois: {
          tipo: lancamentoAtualizado.tipo,
          descricao: lancamentoAtualizado.descricao,
          valor: lancamentoAtualizado.valor,
          status: lancamentoAtualizado.status
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Lançamento atualizado com sucesso',
      data: {
        lancamento: {
          ...lancamentoAtualizado,
          mes_nome: obterNomeMes(lancamentoAtualizado.mes),
          data_vencimento_formatada: lancamentoAtualizado.data_vencimento ? 
            lancamentoAtualizado.data_vencimento.toISOString().split('T')[0] : null
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar lançamento:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o lançamento'
    });
  }
};

// ===============================================
// ALTERAR STATUS DO LANÇAMENTO
// ===============================================

const alterarStatusLancamento = async (req, res) => {
  try {
    const lancamentoId = parseInt(req.params.id);
    const userId = req.user.id;
    const { status } = req.body;

    if (!lancamentoId || isNaN(lancamentoId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID do lançamento deve ser um número válido'
      });
    }

    if (!status || !['PLANEJADO', 'REALIZADO', 'CANCELADO'].includes(status.toUpperCase())) {
      return res.status(400).json({
        error: 'Status inválido',
        message: 'Status deve ser PLANEJADO, REALIZADO ou CANCELADO'
      });
    }

    // Verificar se lançamento existe e pertence ao usuário
    const lancamentoExistente = await prisma.lancamentoPontual.findFirst({
      where: {
        id: lancamentoId,
        empresa: {
          usuario_id: userId
        }
      }
    });

    if (!lancamentoExistente) {
      return res.status(404).json({
        error: 'Lançamento não encontrado',
        message: 'Este lançamento não existe ou não pertence a você'
      });
    }

    // Atualizar status
    const lancamentoAtualizado = await prisma.lancamentoPontual.update({
      where: { id: lancamentoId },
      data: {
        status: status.toUpperCase(),
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: lancamentoExistente.empresa_id,
        acao: 'UPDATE',
        tabela: 'lancamentos_pontuais',
        registro_id: lancamentoId,
        dados_antes: { status: lancamentoExistente.status },
        dados_depois: { status: status.toUpperCase() },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: `Status alterado para ${obterDescricaoStatus(status.toUpperCase())}`,
      data: { lancamento: lancamentoAtualizado }
    });

  } catch (error) {
    console.error('❌ Erro ao alterar status:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível alterar o status'
    });
  }
};

// ===============================================
// DELETAR LANÇAMENTO
// ===============================================

const deletarLancamento = async (req, res) => {
  try {
    const lancamentoId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!lancamentoId || isNaN(lancamentoId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID do lançamento deve ser um número válido'
      });
    }

    // Verificar se lançamento existe e pertence ao usuário
    const lancamentoExistente = await prisma.lancamentoPontual.findFirst({
      where: {
        id: lancamentoId,
        empresa: {
          usuario_id: userId
        }
      },
      include: {
        empresa: {
          select: { nome: true }
        }
      }
    });

    if (!lancamentoExistente) {
      return res.status(404).json({
        error: 'Lançamento não encontrado',
        message: 'Este lançamento não existe ou não pertence a você'
      });
    }

    // Deletar lançamento
    await prisma.lancamentoPontual.delete({
      where: { id: lancamentoId }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: lancamentoExistente.empresa_id,
        acao: 'DELETE',
        tabela: 'lancamentos_pontuais',
        registro_id: lancamentoId,
        dados_antes: {
          tipo: lancamentoExistente.tipo,
          descricao: lancamentoExistente.descricao,
          valor: lancamentoExistente.valor,
          ano: lancamentoExistente.ano,
          mes: lancamentoExistente.mes
        },
        dados_depois: null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: `Lançamento "${lancamentoExistente.descricao}" removido com sucesso`
    });

  } catch (error) {
    console.error('❌ Erro ao deletar lançamento:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar o lançamento'
    });
  }
};

// ===============================================
// RESUMO FINANCEIRO POR PERÍODO
// ===============================================

const resumoFinanceiroPeriodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { empresa_id, ano, mes_inicio, mes_fim } = req.query;

    if (!empresa_id || !ano) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'ID da empresa e ano são obrigatórios'
      });
    }

    const empresaId = parseInt(empresa_id);
    const anoInt = parseInt(ano);
    const mesInicioInt = mes_inicio ? parseInt(mes_inicio) : 1;
    const mesFimInt = mes_fim ? parseInt(mes_fim) : 12;

    // Verificar empresa
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId,
        ativa: true
      }
    });

    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa não encontrada'
      });
    }

    // Buscar lançamentos do período
    const lancamentos = await prisma.lancamentoPontual.findMany({
      where: {
        empresa_id: empresaId,
        ano: anoInt,
        mes: {
          gte: mesInicioInt,
          lte: mesFimInt
        }
      },
      orderBy: [
        { mes: 'asc' },
        { data_vencimento: 'asc' }
      ]
    });

    // Calcular resumo
    const resumo = {
      periodo: {
        ano: anoInt,
        mes_inicio: mesInicioInt,
        mes_fim: mesFimInt
      },
      totais: {
        receitas_planejadas: 0,
        receitas_realizadas: 0,
        despesas_planejadas: 0,
        despesas_realizadas: 0,
        saldo_planejado: 0,
        saldo_realizado: 0
      },
      por_mes: {},
      por_categoria: {}
    };

    // Processar lançamentos
    for (const lancamento of lancamentos) {
      const valor = parseFloat(lancamento.valor);
      const isReceita = lancamento.tipo === 'RECEITA';
      const isRealizado = lancamento.status === 'REALIZADO';

      // Totais gerais
      if (isReceita) {
        if (isRealizado) {
          resumo.totais.receitas_realizadas += valor;
        } else {
          resumo.totais.receitas_planejadas += valor;
        }
      } else {
        if (isRealizado) {
          resumo.totais.despesas_realizadas += valor;
        } else {
          resumo.totais.despesas_planejadas += valor;
        }
      }

      // Por mês
      if (!resumo.por_mes[lancamento.mes]) {
        resumo.por_mes[lancamento.mes] = {
          mes: lancamento.mes,
          mes_nome: obterNomeMes(lancamento.mes),
          receitas: 0,
          despesas: 0,
          saldo: 0
        };
      }

      if (isReceita) {
        resumo.por_mes[lancamento.mes].receitas += valor;
      } else {
        resumo.por_mes[lancamento.mes].despesas += valor;
      }

      // Por categoria
      const categoria = lancamento.categoria || 'Sem Categoria';
      if (!resumo.por_categoria[categoria]) {
        resumo.por_categoria[categoria] = {
          categoria: categoria,
          receitas: 0,
          despesas: 0,
          total: 0
        };
      }

      if (isReceita) {
        resumo.por_categoria[categoria].receitas += valor;
      } else {
        resumo.por_categoria[categoria].despesas += valor;
      }
    }

    // Calcular saldos
    resumo.totais.saldo_planejado = resumo.totais.receitas_planejadas - resumo.totais.despesas_planejadas;
    resumo.totais.saldo_realizado = resumo.totais.receitas_realizadas - resumo.totais.despesas_realizadas;

    // Finalizar cálculos por mês
    for (const mes in resumo.por_mes) {
      resumo.por_mes[mes].saldo = resumo.por_mes[mes].receitas - resumo.por_mes[mes].despesas;
    }

    // Finalizar cálculos por categoria
    for (const categoria in resumo.por_categoria) {
      resumo.por_categoria[categoria].total = 
        resumo.por_categoria[categoria].receitas - resumo.por_categoria[categoria].despesas;
    }

    // Converter objetos em arrays ordenados
    resumo.por_mes = Object.values(resumo.por_mes).sort((a, b) => a.mes - b.mes);
    resumo.por_categoria = Object.values(resumo.por_categoria).sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    res.status(200).json({
      success: true,
      message: `Resumo financeiro ${anoInt} para ${empresa.nome}`,
      data: {
        empresa: { id: empresa.id, nome: empresa.nome },
        total_lancamentos: lancamentos.length,
        resumo: resumo
      }
    });

  } catch (error) {
    console.error('❌ Erro no resumo financeiro:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível gerar o resumo financeiro'
    });
  }
};

// ===============================================
// FUNÇÕES AUXILIARES
// ===============================================

function obterNomeMes(numeroMes) {
  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[numeroMes] || 'Mês Inválido';
}

function obterDescricaoStatus(status) {
  const descricoes = {
    'PLANEJADO': 'Planejado',
    'REALIZADO': 'Realizado',
    'CANCELADO': 'Cancelado'
  };
  return descricoes[status] || status;
}

function calcularEstatisticasLancamentos(lancamentos) {
  if (!lancamentos.length) {
    return {
      total_lancamentos: 0,
      receitas: { total: 0, realizadas: 0, planejadas: 0 },
      despesas: { total: 0, realizadas: 0, planejadas: 0 },
      saldo: { total: 0, realizado: 0, planejado: 0 }
    };
  }

  const stats = {
    total_lancamentos: lancamentos.length,
    receitas: { total: 0, realizadas: 0, planejadas: 0 },
    despesas: { total: 0, realizadas: 0, planejadas: 0 },
    saldo: { total: 0, realizado: 0, planejado: 0 }
  };

  for (const lancamento of lancamentos) {
    const valor = parseFloat(lancamento.valor || 0);
    const isReceita = lancamento.tipo === 'RECEITA';
    const isRealizado = lancamento.status === 'REALIZADO';

    if (isReceita) {
      stats.receitas.total += valor;
      if (isRealizado) {
        stats.receitas.realizadas += valor;
      } else {
        stats.receitas.planejadas += valor;
      }
    } else {
      stats.despesas.total += valor;
      if (isRealizado) {
        stats.despesas.realizadas += valor;
      } else {
        stats.despesas.planejadas += valor;
      }
    }
  }

  stats.saldo.total = stats.receitas.total - stats.despesas.total;
  stats.saldo.realizado = stats.receitas.realizadas - stats.despesas.realizadas;
  stats.saldo.planejado = stats.receitas.planejadas - stats.despesas.planejadas;

  return stats;
}

// ===============================================
// EXPORTAR FUNÇÕES
// ===============================================

module.exports = {
  listarLancamentos,
  buscarLancamento,
  criarLancamento,
  atualizarLancamento,
  alterarStatusLancamento,
  deletarLancamento,
  resumoFinanceiroPeriodo
};