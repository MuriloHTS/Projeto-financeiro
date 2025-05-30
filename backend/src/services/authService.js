// src/services/authService.js
// Serviço completo de autenticação

import { apiService } from './api';

// ===============================================
// CONFIGURAÇÕES
// ===============================================

const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'mondarc_token';
const USER_KEY = process.env.REACT_APP_USER_KEY || 'mondarc_user';

// ===============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ===============================================

/**
 * Fazer login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário e token
 */
export const login = async (email, senha) => {
  try {
    console.log('🔐 Tentando fazer login...');
    
    const response = await apiService.post('/api/auth/login', {
      email: email.trim().toLowerCase(),
      senha
    });

    if (response.success && response.data.token) {
      // Salvar token e dados do usuário
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario));

      console.log('✅ Login realizado com sucesso');
      
      return {
        success: true,
        user: response.data.usuario,
        token: response.data.token,
        message: response.message
      };
    } else {
      throw new Error('Resposta de login inválida');
    }

  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    // Limpar dados em caso de erro
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    throw {
      success: false,
      message: error.message || 'Erro ao fazer login',
      details: error.details || []
    };
  }
};

/**
 * Registrar novo usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Dados do usuário registrado
 */
export const register = async (userData) => {
  try {
    console.log('📝 Tentando registrar usuário...');
    
    const response = await apiService.post('/api/auth/register', {
      nome: userData.nome.trim(),
      email: userData.email.trim().toLowerCase(),
      senha: userData.senha,
      confirmarSenha: userData.confirmarSenha
    });

    if (response.success && response.data.token) {
      // Salvar token e dados do usuário automaticamente após registro
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario));

      console.log('✅ Usuário registrado com sucesso');
      
      return {
        success: true,
        user: response.data.usuario,
        token: response.data.token,
        message: response.message
      };
    } else {
      throw new Error('Resposta de registro inválida');
    }

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    
    throw {
      success: false,
      message: error.message || 'Erro ao registrar usuário',
      details: error.details || []
    };
  }
};

/**
 * Fazer logout do usuário
 * @returns {Promise<Object>} Resultado do logout
 */
export const logout = async () => {
  try {
    console.log('🚪 Fazendo logout...');
    
    // Tentar fazer logout no servidor (opcional - mesmo se falhar, vamos limpar local)
    try {
      await apiService.post('/api/auth/logout');
    } catch (error) {
      console.warn('⚠️ Erro ao fazer logout no servidor (continuando mesmo assim):', error);
    }

    // Limpar dados locais
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    console.log('✅ Logout realizado com sucesso');
    
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    
    // Mesmo com erro, vamos limpar os dados locais
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    return {
      success: true, // Consideramos sucesso pois limpamos os dados locais
      message: 'Logout realizado (dados locais limpos)'
    };
  }
};

/**
 * Obter dados do usuário atual
 * @returns {Promise<Object>} Dados do usuário
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiService.get('/api/auth/me');
    
    if (response.success && response.data.user) {
      // Atualizar dados do usuário no localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      
      return {
        success: true,
        user: response.data.user
      };
    } else {
      throw new Error('Dados do usuário inválidos');
    }

  } catch (error) {
    console.error('❌ Erro ao obter usuário atual:', error);
    
    // Se falhar, limpar dados locais
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    throw {
      success: false,
      message: error.message || 'Erro ao obter dados do usuário'
    };
  }
};

/**
 * Atualizar perfil do usuário
 * @param {Object} profileData - Novos dados do perfil
 * @returns {Promise<Object>} Dados atualizados
 */
export const updateProfile = async (profileData) => {
  try {
    console.log('👤 Atualizando perfil...');
    
    const response = await apiService.put('/api/auth/profile', {
      nome: profileData.nome.trim()
    });

    if (response.success && response.data.usuario) {
      // Atualizar dados do usuário no localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.usuario));

      console.log('✅ Perfil atualizado com sucesso');
      
      return {
        success: true,
        user: response.data.usuario,
        message: response.message
      };
    } else {
      throw new Error('Resposta de atualização inválida');
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    
    throw {
      success: false,
      message: error.message || 'Erro ao atualizar perfil',
      details: error.details || []
    };
  }
};

/**
 * Alterar senha do usuário
 * @param {Object} passwordData - Dados das senhas
 * @returns {Promise<Object>} Resultado da alteração
 */
export const changePassword = async (passwordData) => {
  try {
    console.log('🔒 Alterando senha...');
    
    const response = await apiService.put('/api/auth/password', {
      senhaAtual: passwordData.senhaAtual,
      novaSenha: passwordData.novaSenha,
      confirmarNovaSenha: passwordData.confirmarNovaSenha
    });

    console.log('✅ Senha alterada com sucesso');
    
    return {
      success: true,
      message: response.message
    };

  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    
    throw {
      success: false,
      message: error.message || 'Erro ao alterar senha',
      details: error.details || []
    };
  }
};

// ===============================================
// FUNÇÕES UTILITÁRIAS
// ===============================================

/**
 * Verificar se usuário está logado
 * @returns {boolean} True se logado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  
  return !!(token && user);
};

/**
 * Obter token armazenado
 * @returns {string|null} Token ou null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Obter dados do usuário armazenados
 * @returns {Object|null} Dados do usuário ou null
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Erro ao parsear dados do usuário:', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Limpar todos os dados de autenticação
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  console.log('🧹 Dados de autenticação limpos');
};

/**
 * Verificar se token está próximo do vencimento
 * @returns {boolean} True se próximo do vencimento
 */
export const isTokenExpiringSoon = () => {
  // Implementação simples - pode ser melhorada decodificando o JWT
  const token = getToken();
  if (!token) return true;
  
  // Por enquanto, apenas verificar se existe
  // Em produção, seria bom decodificar o JWT e verificar o exp
  return false;
};

// ===============================================
// OBJETO DE EXPORTAÇÃO PRINCIPAL
// ===============================================

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
  isAuthenticated,
  getToken,
  getStoredUser,
  clearAuthData,
  isTokenExpiringSoon
};

export default authService;