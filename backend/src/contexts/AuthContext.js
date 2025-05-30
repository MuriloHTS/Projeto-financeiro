// src/contexts/AuthContext.js
// Context API para gerenciamento global de autenticação

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// ===============================================
// TIPOS DE AÇÕES
// ===============================================

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// ===============================================
// ESTADO INICIAL
// ===============================================

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false
};

// ===============================================
// REDUCER PARA GERENCIAR ESTADO
// ===============================================

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
    case AUTH_ACTIONS.REGISTER_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        initialized: true
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        initialized: true
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
        error: null
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// ===============================================
// CRIAR CONTEXTO
// ===============================================

const AuthContext = createContext();

// ===============================================
// PROVIDER COMPONENT
// ===============================================

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ===============================================
  // INICIALIZAÇÃO - VERIFICAR SE USUÁRIO JÁ ESTÁ LOGADO
  // ===============================================

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Inicializando autenticação...');
      
      try {
        // Verificar se tem dados salvos no localStorage
        const token = authService.getToken();
        const storedUser = authService.getStoredUser();

        if (token && storedUser) {
          console.log('✅ Token encontrado, verificando validade...');
          
          // Validar token com o backend
          try {
            const response = await authService.getCurrentUser();
            
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.user,
                token: token
              }
            });
            
            console.log('✅ Usuário logado automaticamente');
          } catch (error) {
            console.warn('⚠️ Token inválido, fazendo logout...');
            authService.clearAuthData();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          console.log('ℹ️ Nenhum token encontrado');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        authService.clearAuthData();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // ===============================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ===============================================

  const login = async (email, senha) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      console.log('🔐 Tentando fazer login...');
      const result = await authService.login(email, senha);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: result.user,
          token: result.token
        }
      });

      console.log('✅ Login realizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: error.message || 'Erro ao fazer login'
      });

      return { 
        success: false, 
        error: error.message || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      console.log('📝 Tentando registrar usuário...');
      const result = await authService.register(userData);

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: result.user,
          token: result.token
        }
      });

      console.log('✅ Registro realizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ Erro no registro:', error);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_ERROR,
        payload: error.message || 'Erro ao registrar usuário'
      });

      return { 
        success: false, 
        error: error.message || 'Erro ao registrar usuário' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, vamos fazer logout local
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateProfile = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      console.log('👤 Atualizando perfil...');
      const result = await authService.updateProfile(userData);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: result.user
      });

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      console.log('✅ Perfil atualizado com sucesso');
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      return { 
        success: false, 
        error: error.message || 'Erro ao atualizar perfil' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

    try {
      console.log('🔒 Alterando senha...');
      await authService.changePassword(passwordData);
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      console.log('✅ Senha alterada com sucesso');
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      
      return { 
        success: false, 
        error: error.message || 'Erro ao alterar senha' 
      };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // ===============================================
  // VALOR DO CONTEXTO
  // ===============================================

  const value = {
    // Estado
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    initialized: state.initialized,

    // Funções
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===============================================
// HOOK PERSONALIZADO PARA USAR O CONTEXTO
// ===============================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

// ===============================================
// HOOK PARA VERIFICAR SE ESTÁ AUTENTICADO
// ===============================================

export const useAuthCheck = () => {
  const { isAuthenticated, initialized } = useAuth();
  
  return {
    isAuthenticated,
    isReady: initialized
  };
};

// ===============================================
// COMPONENTE DE PROTEÇÃO DE ROTAS
// ===============================================

export const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, initialized, isLoading } = useAuth();

  // Ainda carregando
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Acesso negado. Faça login para continuar.</p>
        </div>
      </div>
    );
  }

  // Autenticado - renderizar conteúdo
  return children;
};

export default AuthContext;