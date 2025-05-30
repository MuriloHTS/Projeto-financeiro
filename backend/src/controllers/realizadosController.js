// src/controllers/realizadosController.js
// Controller completo para gerenciamento de valores realizados

const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ===============================================
// LISTAR VALORES REALIZADOS POR EMPRESA
// ===============================================

const listarRealizados = async (req, res) => {
  try {
    const userId = req.user.id;
    const { empresa_id, ano, mes } = req.query;

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

    // Filtrar por ano se especificado
    if (ano) {
      const anoInt = parseInt(ano);
      if (!isNaN(anoInt) && anoInt >= 2020 && anoInt <= 2030) {
        filtro.ano = anoInt;
      }
    }

    // Filtrar por mês se especificado
    if (mes) {
      const mesInt = parseInt(mes);
      if (!isNaN(mesInt) && mesInt >= 1 && mesInt <= 12) {
        filtro.mes = mesInt;
      }
    }

    // Buscar valores realizados
    const realizados = await prisma.valorRealizado.findMany({
      where: filtro,
      orderBy: [
        { ano: 'desc' },
        { mes: 'desc' }
      ],
      include: {
        empresa: {
          select: {
            id: true,
            nome: true,
            tipo_pessoa: true
          }
        },
        detalhes_realizados: {
          select: {
            id: true,
            categoria_nome: true,
            valor: true
          },
          orderBy: {
            valor: 'desc'
          }
        }
      }
    });

    // Calcular estatísticas
    const estatisticas = calcularEstatisticasRealizados(realizados);

    res.status(200).json({
      success: true,
      message: `${realizados.length} valor(es) realizado(s) encontrado(s) para ${empresa.nome}`,
      data: {
        empresa: {
          id: empresa.id,
          nome: empresa.nome
        },
        realizados: realizados,
        estatisticas: estatisticas
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar valores realizados:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar os valores realizados'
    });
  }
};

// ===============================================
// BUSCAR VALOR REALIZADO ESPECÍFICO
// ===============================================

const buscarRealizado = async (req, res) => {
  try {
    const realizadoId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!realizadoId || isNaN(realizadoId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID do valor realizado deve ser um número válido'
      });
    }

    // Buscar valor realizado e verificar propriedade
    const realizado = await prisma.valorRealizado.findFirst({
      where: {
        id: realizadoId,
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
        },
        detalhes_realizados: {
          select: {
            id: true,
            categoria_nome: true,
            valor: true
          },
          orderBy: {
            valor: 'desc'
          }
        }
      }
    });

    if (!realizado) {
      return res.status(404).json({
        error: 'Valor realizado não encontrado',
        message: 'Este registro não existe ou não pertence a você'
      });
    }

    // Adicionar informações calculadas
    const informacoesAdicionais = {
      mes_nome: obterNomeMes(realizado.mes),
      trimestre: Math.ceil(realizado.mes / 3),
      total_detalhes: realizado.detalhes_realizados.reduce(
        (sum, det) => sum + parseFloat(det.valor || 0), 0
      ),
      diferenca_total_detalhes: parseFloat(realizado.valor) - 
        realizado.detalhes_realizados.reduce((sum, det) => sum + parseFloat(det.valor || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: {
        realizado: {
          ...realizado,
          informacoes_adicionais: informacoesAdicionais
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar valor realizado:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar o valor realizado'
    });
  }
};

// ===============================================
// CRIAR/ATUALIZAR VALOR REALIZADO
// ===============================================

const salvarRealizado = async (req, res) => {
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

    const { empresa_id, ano, mes, valor, observacao, fonte, detalhes } = req.body;
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

    // Verificar se já existe valor para este mês/ano
    const realizadoExistente = await prisma.valorRealizado.findFirst({
      where: {
        empresa_id: empresa_id,
        ano: ano,
        mes: mes
      }
    });

    let valorRealizado;

    if (realizadoExistente) {
      // Atualizar existente
      valorRealizado = await prisma.valorRealizado.update({
        where: { id: realizadoExistente.id },
        data: {
          valor: parseFloat(valor),
          observacao: observacao?.trim() || null,
          fonte: fonte || 'Manual',
          updated_at: new Date()
        }
      });

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuario_id: userId,
          empresa_id: empresa_id,
          acao: 'UPDATE',
          tabela: 'valores_realizados',
          registro_id: valorRealizado.id,
          dados_antes: {
            valor: realizadoExistente.valor,
            observacao: realizadoExistente.observacao
          },
          dados_depois: {
            valor: valorRealizado.valor,
            observacao: valorRealizado.observacao
          },
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });

    } else {
      // Criar novo
      valorRealizado = await prisma.valorRealizado.create({
        data: {
          empresa_id: empresa_id,
          ano: ano,
          mes: mes,
          valor: parseFloat(valor),
          observacao: observacao?.trim() || null,
          fonte: fonte || 'Manual'
        }
      });

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuario_id: userId,
          empresa_id: empresa_id,
          acao: 'CREATE',
          tabela: 'valores_realizados',
          registro_id: valorRealizado.id,
          dados_depois: {
            ano: valorRealizado.ano,
            mes: valorRealizado.mes,
            valor: valorRealizado.valor
          },
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        }
      });
    }

    // Processar detalhes se fornecidos
    if (detalhes && Array.isArray(detalhes)) {
      // Remover detalhes existentes
      await prisma.detalheRealizado.deleteMany({
        where: { valor_realizado_id: valorRealizado.id }
      });

      // Criar novos detalhes
      for (const detalhe of detalhes) {
        if (detalhe.categoria_nome && detalhe.valor) {
          await prisma.detalheRealizado.create({
            data: {
              valor_realizado_id: valorRealizado.id,
              categoria_nome: detalhe.categoria_nome.trim(),
              valor: parseFloat(detalhe.valor)
            }
          });
        }
      }
    }

    // Buscar valor completo com detalhes
    const valorCompleto = await prisma.valorRealizado.findUnique({
      where: { id: valorRealizado.id },
      include: {
        empresa: {
          select: { id: true, nome: true }
        },
        detalhes_realizados: true
      }
    });

    res.status(realizadoExistente ? 200 : 201).json({
      success: true,
      message: `Valor realizado ${realizadoExistente ? 'atualizado' : 'criado'} com sucesso`,
      data: {
        realizado: {
          ...valorCompleto,
          mes_nome: obterNomeMes(valorCompleto.mes)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar valor realizado:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível salvar o valor realizado'
    });
  }
};

// ===============================================
// DELETAR VALOR REALIZADO
// ===============================================

const deletarRealizado = async (req, res) => {
  try {
    const realizadoId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!realizadoId || isNaN(realizadoId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID do valor realizado deve ser um número válido'
      });
    }

    // Verificar se valor existe e pertence ao usuário
    const realizadoExistente = await prisma.valorRealizado.findFirst({
      where: {
        id: realizadoId,
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

    if (!realizadoExistente) {
      return res.status(404).json({
        error: 'Valor realizado não encontrado',
        message: 'Este registro não existe ou não pertence a você'
      });
    }

    // Deletar detalhes relacionados primeiro
    await prisma.detalheRealizado.deleteMany({
      where: { valor_realizado_id: realizadoId }
    });

    // Deletar valor realizado
    await prisma.valorRealizado.delete({
      where: { id: realizadoId }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        empresa_id: realizadoExistente.empresa_id,
        acao: 'DELETE',
        tabela: 'valores_realizados',
        registro_id: realizadoId,
        dados_antes: {
          ano: realizadoExistente.ano,
          mes: realizadoExistente.mes,
          valor: realizadoExistente.valor
        },
        dados_depois: null,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: `Valor realizado de ${obterNomeMes(realizadoExistente.mes)}/${realizadoExistente.ano} removido com sucesso`
    });

  } catch (error) {
    console.error('❌ Erro ao deletar valor realizado:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar o valor realizado'
    });
  }
};

// ===============================================
// COMPARATIVO REALIZADO VS PLANEJADO
// ===============================================

const comparativoRealizadoPlanejado = async (req, res) => {
  try {
    const userId = req.user.id;
    const { empresa_id, ano } = req.query;

    if (!empresa_id || !ano) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'ID da empresa e ano são obrigatórios'
      });
    }

    const empresaId = parseInt(empresa_id);
    const anoInt = parseInt(ano);

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

    // Buscar premissa do ano
    const premissa = await prisma.premissa.findFirst({
      where: {
        empresa_id: empresaId,
        ano: anoInt
      }
    });

    // Buscar valores realizados do ano
    const realizados = await prisma.valorRealizado.findMany({
      where: {
        empresa_id: empresaId,
        ano: anoInt
      },
      orderBy: { mes: 'asc' }
    });

    // Calcular comparativo mensal
    const comparativoMensal = [];
    let totalRealizadoAcumulado = 0;
    let totalPlanejadoAcumulado = 0;

    for (let mes = 1; mes <= 12; mes++) {
      const realizadoMes = realizados.find(r => r.mes === mes);
      const valorRealizado = realizadoMes ? parseFloat(realizadoMes.valor) : 0;
      
      // Calcular valor planejado do mês (baseado na premissa)
      const valorPlanejado = premissa ? calcularValorPlanejadoMes(premissa, mes) : 0;
      
      totalRealizadoAcumulado += valorRealizado;
      totalPlanejadoAcumulado += valorPlanejado;

      const diferenca = valorRealizado - valorPlanejado;
      const percentualAcumulado = totalPlanejadoAcumulado > 0 
        ? (totalRealizadoAcumulado / totalPlanejadoAcumulado) * 100 
        : 0;

      comparativoMensal.push({
        mes: mes,
        mes_nome: obterNomeMes(mes),
        valor_planejado: Math.round(valorPlanejado * 100) / 100,
        valor_realizado: valorRealizado,
        diferenca: Math.round(diferenca * 100) / 100,
        percentual_realizacao: valorPlanejado > 0 ? Math.round((valorRealizado / valorPlanejado) * 100) : 0,
        acumulado_planejado: Math.round(totalPlanejadoAcumulado * 100) / 100,
        acumulado_realizado: totalRealizadoAcumulado,
        percentual_acumulado: Math.round(percentualAcumulado * 100) / 100
      });
    }

    // Estatísticas gerais
    const estatisticas = {
      total_planejado_ano: totalPlanejadoAcumulado,
      total_realizado_ano: totalRealizadoAcumulado,
      diferenca_total: totalRealizadoAcumulado - totalPlanejadoAcumulado,
      percentual_realizacao_ano: totalPlanejadoAcumulado > 0 
        ? Math.round((totalRealizadoAcumulado / totalPlanejadoAcumulado) * 100) 
        : 0,
      meses_com_dados: realizados.length,
      melhor_mes: comparativoMensal.reduce((melhor, atual) => 
        atual.percentual_realizacao > melhor.percentual_realizacao ? atual : melhor
      ),
      pior_mes: comparativoMensal.reduce((pior, atual) => 
        atual.percentual_realizacao < pior.percentual_realizacao ? atual : pior
      )
    };

    res.status(200).json({
      success: true,
      message: `Comparativo ${ano} para ${empresa.nome}`,
      data: {
        empresa: { id: empresa.id, nome: empresa.nome },
        ano: anoInt,
        tem_premissa: !!premissa,
        comparativo_mensal: comparativoMensal,
        estatisticas: estatisticas
      }
    });

  } catch (error) {
    console.error('❌ Erro no comparativo:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível gerar o comparativo'
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

function calcularEstatisticasRealizados(realizados) {
  if (!realizados.length) {
    return {
      total_registros: 0,
      valor_total: 0,
      valor_medio_mensal: 0,
      anos_cobertos: [],
      maior_valor: 0,
      menor_valor: 0
    };
  }

  const valores = realizados.map(r => parseFloat(r.valor || 0));
  const anos = [...new Set(realizados.map(r => r.ano))].sort();

  return {
    total_registros: realizados.length,
    valor_total: valores.reduce((sum, val) => sum + val, 0),
    valor_medio_mensal: valores.reduce((sum, val) => sum + val, 0) / valores.length,
    anos_cobertos: anos,
    maior_valor: Math.max(...valores),
    menor_valor: Math.min(...valores),
    ultimo_registro: realizados[0] // já vem ordenado por data desc
  };
}

function calcularValorPlanejadoMes(premissa, mes) {
  if (!premissa || !premissa.sazonalidade) {
    return premissa ? (parseFloat(premissa.receita_anual) / 12) : 0;
  }

  const nomesMeses = [
    '', 'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const nomeMes = nomesMeses[mes];
  const percentualMes = premissa.sazonalidade[nomeMes] || 8.33;
  
  // Receita base do mês
  let receitaMes = (parseFloat(premissa.receita_anual) * percentualMes) / 100;
  
  // Aplicar crescimento acumulado
  if (premissa.crescimento_mensal && premissa.crescimento_mensal > 0) {
    const fatorCrescimento = Math.pow(1 + (parseFloat(premissa.crescimento_mensal) / 100), mes - 1);
    receitaMes = receitaMes * fatorCrescimento;
  }
  
  return receitaMes;
}

// ===============================================
// EXPORTAR FUNÇÕES
// ===============================================

module.exports = {
  listarRealizados,
  buscarRealizado,
  salvarRealizado,
  deletarRealizado,
  comparativoRealizadoPlanejado
};