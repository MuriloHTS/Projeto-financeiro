// src/controllers/empresasController.js
// Controller completo para gerenciamento de empresas

const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ===============================================
// LISTAR EMPRESAS DO USUÁRIO
// ===============================================

const listarEmpresas = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ativa } = req.query; // Filtro opcional: ?ativa=true

    // Construir filtro
    const filtro = {
      usuario_id: userId
    };

    // Adicionar filtro de ativa se especificado
    if (ativa !== undefined) {
      filtro.ativa = ativa === 'true';
    }

    // Buscar empresas
    const empresas = await prisma.empresa.findMany({
      where: filtro,
      orderBy: [
        { ativa: 'desc' }, // Ativas primeiro
        { nome: 'asc' }    // Depois por nome
      ],
      select: {
        id: true,
        nome: true,
        tipo_pessoa: true,
        cnpj: true,
        cpf: true,
        ramo_atividade: true,
        ativa: true,
        created_at: true,
        updated_at: true,
        // Contadores relacionados
        _count: {
          select: {
            premissas: true,
            despesas_fixas: true,
            valores_realizados: true,
            lancamentos: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: `${empresas.length} empresa(s) encontrada(s)`,
      data: {
        empresas,
        total: empresas.length,
        ativas: empresas.filter(e => e.ativa).length,
        inativas: empresas.filter(e => !e.ativa).length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar empresas:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as empresas'
    });
  }
};

// ===============================================
// BUSCAR EMPRESA ESPECÍFICA
// ===============================================

const buscarEmpresa = async (req, res) => {
  try {
    const empresaId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!empresaId || isNaN(empresaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da empresa deve ser um número válido'
      });
    }

    // Buscar empresa do usuário
    const empresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId
      },
      include: {
        _count: {
          select: {
            premissas: true,
            despesas_fixas: true,
            valores_realizados: true,
            lancamentos: true
          }
        }
      }
    });

    if (!empresa) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    res.status(200).json({
      success: true,
      data: { empresa }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar a empresa'
    });
  }
};

// ===============================================
// CRIAR NOVA EMPRESA
// ===============================================

const criarEmpresa = async (req, res) => {
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

    const { nome, tipo_pessoa, cnpj_cpf, ramo_atividade } = req.body;
    const userId = req.user.id;

    // Verificar se já existe empresa com mesmo CNPJ/CPF para o usuário
    if (cnpj_cpf) {
      const cnpjCpfLimpo = cnpj_cpf.replace(/\D/g, '');
      
      const whereCondition = tipo_pessoa === 'PJ' 
        ? { cnpj: cnpjCpfLimpo }
        : { cpf: cnpjCpfLimpo };

      const empresaExistente = await prisma.empresa.findFirst({
        where: {
          usuario_id: userId,
          ...whereCondition,
          ativa: true
        }
      });

      if (empresaExistente) {
        return res.status(409).json({
          error: 'CNPJ/CPF já cadastrado',
          message: 'Já existe uma empresa ativa com este CNPJ/CPF'
        });
      }
    }

    // Preparar dados para criação
    const cnpjCpfLimpo = cnpj_cpf ? cnpj_cpf.replace(/\D/g, '') : null;
    const dadosEmpresa = {
      nome: nome.trim(),
      tipo_pessoa,
      ramo_atividade: ramo_atividade?.trim() || null,
      usuario_id: userId,
      ativa: true
    };

    // Adicionar CNPJ ou CPF conforme o tipo
    if (tipo_pessoa === 'PJ' && cnpjCpfLimpo) {
      dadosEmpresa.cnpj = cnpjCpfLimpo;
    } else if (tipo_pessoa === 'PF' && cnpjCpfLimpo) {
      dadosEmpresa.cpf = cnpjCpfLimpo;
    }

    // Criar empresa
    const novaEmpresa = await prisma.empresa.create({
      data: dadosEmpresa
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        acao: 'CREATE',
        tabela: 'empresas',
        registro_id: novaEmpresa.id,
        dados_depois: {
          nome: novaEmpresa.nome,
          tipo_pessoa: novaEmpresa.tipo_pessoa,
          cnpj: novaEmpresa.cnpj,
          cpf: novaEmpresa.cpf,
          ramo_atividade: novaEmpresa.ramo_atividade,
          ativa: novaEmpresa.ativa
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Empresa criada com sucesso',
      data: { empresa: novaEmpresa }
    });

  } catch (error) {
    console.error('❌ Erro ao criar empresa:', error);
    
    // Erro de constraint única (CNPJ duplicado)
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'CNPJ/CPF já cadastrado',
        message: 'Este CNPJ/CPF já está sendo usado'
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar a empresa'
    });
  }
};

// ===============================================
// ATUALIZAR EMPRESA
// ===============================================

const atualizarEmpresa = async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const empresaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { nome, tipo_pessoa, cnpj_cpf, ramo_atividade } = req.body;

    if (!empresaId || isNaN(empresaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da empresa deve ser um número válido'
      });
    }

    // Verificar se empresa existe e pertence ao usuário
    const empresaExistente = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId
      }
    });

    if (!empresaExistente) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    // Verificar CNPJ/CPF duplicado (se foi alterado)
    if (cnpj_cpf) {
      const cnpjCpfLimpo = cnpj_cpf.replace(/\D/g, '');
      const campoAtual = tipo_pessoa === 'PJ' ? empresaExistente.cnpj : empresaExistente.cpf;
      
      if (cnpjCpfLimpo !== campoAtual) {
        const whereCondition = tipo_pessoa === 'PJ' 
          ? { cnpj: cnpjCpfLimpo }
          : { cpf: cnpjCpfLimpo };

        const cnpjDuplicado = await prisma.empresa.findFirst({
          where: {
            usuario_id: userId,
            ...whereCondition,
            id: { not: empresaId },
            ativa: true
          }
        });

        if (cnpjDuplicado) {
          return res.status(409).json({
            error: 'CNPJ/CPF já cadastrado',
            message: 'Já existe outra empresa com este CNPJ/CPF'
          });
        }
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      nome: nome?.trim() || empresaExistente.nome,
      tipo_pessoa: tipo_pessoa || empresaExistente.tipo_pessoa,
      ramo_atividade: ramo_atividade?.trim() || empresaExistente.ramo_atividade,
      updated_at: new Date()
    };

    // Atualizar CNPJ ou CPF se fornecido
    if (cnpj_cpf) {
      const cnpjCpfLimpo = cnpj_cpf.replace(/\D/g, '');
      if (tipo_pessoa === 'PJ' || empresaExistente.tipo_pessoa === 'PJ') {
        dadosAtualizacao.cnpj = cnpjCpfLimpo;
        dadosAtualizacao.cpf = null; // Limpar CPF se mudou para PJ
      } else {
        dadosAtualizacao.cpf = cnpjCpfLimpo;
        dadosAtualizacao.cnpj = null; // Limpar CNPJ se mudou para PF
      }
    }

    // Atualizar empresa
    const empresaAtualizada = await prisma.empresa.update({
      where: { id: empresaId },
      data: dadosAtualizacao
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        acao: 'UPDATE',
        tabela: 'empresas',
        registro_id: empresaId,
        dados_antes: {
          nome: empresaExistente.nome,
          tipo_pessoa: empresaExistente.tipo_pessoa,
          cnpj: empresaExistente.cnpj,
          cpf: empresaExistente.cpf,
          ramo_atividade: empresaExistente.ramo_atividade
        },
        dados_depois: {
          nome: empresaAtualizada.nome,
          tipo_pessoa: empresaAtualizada.tipo_pessoa,
          cnpj: empresaAtualizada.cnpj,
          cpf: empresaAtualizada.cpf,
          ramo_atividade: empresaAtualizada.ramo_atividade
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Empresa atualizada com sucesso',
      data: { empresa: empresaAtualizada }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar a empresa'
    });
  }
};

// ===============================================
// ATIVAR/DESATIVAR EMPRESA
// ===============================================

const toggleEmpresa = async (req, res) => {
  try {
    const empresaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { ativa } = req.body;

    if (!empresaId || isNaN(empresaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da empresa deve ser um número válido'
      });
    }

    if (typeof ativa !== 'boolean') {
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'Campo "ativa" deve ser true ou false'
      });
    }

    // Verificar se empresa existe e pertence ao usuário
    const empresaExistente = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId
      }
    });

    if (!empresaExistente) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    // Atualizar status
    const empresaAtualizada = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        ativa,
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        acao: 'UPDATE',
        tabela: 'empresas',
        registro_id: empresaId,
        dados_antes: { ativa: empresaExistente.ativa },
        dados_depois: { ativa },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: `Empresa ${ativa ? 'ativada' : 'desativada'} com sucesso`,
      data: { empresa: empresaAtualizada }
    });

  } catch (error) {
    console.error('❌ Erro ao alterar status da empresa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível alterar o status da empresa'
    });
  }
};

// ===============================================
// DELETAR EMPRESA (SOFT DELETE)
// ===============================================

const deletarEmpresa = async (req, res) => {
  try {
    const empresaId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!empresaId || isNaN(empresaId)) {
      return res.status(400).json({
        error: 'ID inválido',
        message: 'ID da empresa deve ser um número válido'
      });
    }

    // Verificar se empresa existe e pertence ao usuário
    const empresaExistente = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        usuario_id: userId
      }
    });

    if (!empresaExistente) {
      return res.status(404).json({
        error: 'Empresa não encontrada',
        message: 'Esta empresa não existe ou não pertence a você'
      });
    }

    // Soft delete (apenas desativar)
    const empresaDesativada = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        ativa: false,
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        acao: 'DELETE',
        tabela: 'empresas',
        registro_id: empresaId,
        dados_antes: {
          nome: empresaExistente.nome,
          ativa: empresaExistente.ativa
        },
        dados_depois: { ativa: false },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Empresa desativada com sucesso',
      data: { empresa: empresaDesativada }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar empresa:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar a empresa'
    });
  }
};

// ===============================================
// EXPORTAR FUNÇÕES
// ===============================================

module.exports = {
  listarEmpresas,
  buscarEmpresa,
  criarEmpresa,
  atualizarEmpresa,
  toggleEmpresa,
  deletarEmpresa
};