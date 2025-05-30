// src/controllers/authController.js
// Controller com toda lógica de autenticação

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// ===============================================
// REGISTRO DE NOVO USUÁRIO
// ===============================================

const register = async (req, res) => {
  try {
    // 1. Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Verifique os campos obrigatórios',
        details: errors.array()
      });
    }

    const { nome, email, senha } = req.body;

    // 2. Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Este email já está sendo usado por outro usuário'
      });
    }

    // 3. Hash da senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 4. Criar usuário no banco
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha_hash: senhaHash,
        ativo: true
      }
    });

    // 5. Gerar token JWT
    const token = generateToken(novoUsuario.id);

    // 6. Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: novoUsuario.id,
        acao: 'CREATE',
        tabela: 'usuarios',
        registro_id: novoUsuario.id,
        dados_depois: {
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          ativo: novoUsuario.ativo
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    // 7. Resposta de sucesso (sem senha)
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: {
        token,
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          created_at: novoUsuario.created_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar a conta. Tente novamente.',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// ===============================================
// LOGIN DE USUÁRIO
// ===============================================

const login = async (req, res) => {
  try {
    // 1. Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Email e senha são obrigatórios',
        details: errors.array()
      });
    }

    const { email, senha } = req.body;

    // 2. Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { 
        email: email.toLowerCase(),
        ativo: true // Só usuários ativos podem fazer login
      },
      include: {
        empresas: {
          where: { ativa: true },
          select: {
            id: true,
            nome: true,
            tipo_pessoa: true,
            ramo_atividade: true,
            created_at: true
          }
        }
      }
    });

    // 3. Verificar se usuário existe
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // 4. Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        message: 'Email ou senha incorretos'
      });
    }

    // 5. Gerar token JWT
    const token = generateToken(usuario.id);

    // 6. Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: usuario.id,
        acao: 'LOGIN',
        tabela: 'usuarios',
        registro_id: usuario.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    // 7. Resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          empresas: usuario.empresas,
          last_login: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível realizar o login. Tente novamente.',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// ===============================================
// OBTER DADOS DO USUÁRIO LOGADO
// ===============================================

const me = async (req, res) => {
  try {
    // req.user já foi definido pelo middleware authenticateToken
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        empresas: {
          where: { ativa: true },
          select: {
            id: true,
            nome: true,
            tipo_pessoa: true,
            ramo_atividade: true,
            created_at: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Faça login novamente'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          ativo: usuario.ativo,
          created_at: usuario.created_at,
          updated_at: usuario.updated_at,
          empresas: usuario.empresas
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do usuário:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar os dados do usuário'
    });
  }
};

// ===============================================
// LOGOUT (OPCIONAL - para logs)
// ===============================================

const logout = async (req, res) => {
  try {
    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: req.user.id,
        acao: 'LOGOUT',
        tabela: 'usuarios',
        registro_id: req.user.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    
    res.status(200).json({
      success: true,
      message: 'Logout realizado'
    });
  }
};

// ===============================================
// ATUALIZAR PERFIL DO USUÁRIO
// ===============================================

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome } = req.body;
    const userId = req.user.id;

    // Dados anteriores para auditoria
    const usuarioAnterior = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome: nome.trim(),
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        acao: 'UPDATE',
        tabela: 'usuarios',
        registro_id: userId,
        dados_antes: {
          nome: usuarioAnterior.nome
        },
        dados_depois: {
          nome: usuarioAtualizado.nome
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        usuario: {
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          email: usuarioAtualizado.email,
          updated_at: usuarioAtualizado.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o perfil'
    });
  }
};

// ===============================================
// ALTERAR SENHA
// ===============================================

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { senhaAtual, novaSenha } = req.body;
    const userId = req.user.id;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
    
    if (!senhaValida) {
      return res.status(400).json({
        error: 'Senha atual incorreta',
        message: 'A senha atual informada está incorreta'
      });
    }

    // Hash da nova senha
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        senha_hash: novaSenhaHash,
        updated_at: new Date()
      }
    });

    // Log de auditoria
    await prisma.logAuditoria.create({
      data: {
        usuario_id: userId,
        acao: 'UPDATE',
        tabela: 'usuarios',
        registro_id: userId,
        dados_depois: { acao: 'senha_alterada' },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      }
    });

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível alterar a senha'
    });
  }
};

// ===============================================
// EXPORTAR FUNÇÕES
// ===============================================

module.exports = {
  register,
  login,
  me,
  logout,
  updateProfile,
  changePassword
};