// src/services/api.js
// Serviço base para comunicação com o backend

import axios from 'axios';

// ===============================================
// CONFIGURAÇÃO BASE DA API
// ===============================================

// URL base do backend
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Criar instância do axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===============================================
// INTERCEPTORS DE REQUISIÇÃO
// ===============================================

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Pegar token do localStorage
    const token = localStorage.getItem('mondarc_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log da requisição (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// ===============================================
// INTERCEPTORS DE RESPOSTA
// ===============================================

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    // Log da resposta (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta da API:', error);

    // Tratar erros específicos
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('mondarc_token');
          localStorage.removeItem('mondarc_user');
          
          // Redirecionar para login se não estivermos já na página de login
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          
          return Promise.reject({
            message: 'Sessão expirada. Faça login novamente.',
            status: 401
          });

        case 403:
          return Promise.reject({
            message: 'Acesso negado. Você não tem permissão para esta ação.',
            status: 403
          });

        case 404:
          return Promise.reject({
            message: data.message || 'Recurso não encontrado.',
            status: 404
          });

        case 409:
          return Promise.reject({
            message: data.message || 'Conflito nos dados enviados.',
            status: 409
          });

        case 422:
          return Promise.reject({
            message: data.message || 'Dados inválidos.',
            details: data.details || [],
            status: 422
          });

        case 429:
          return Promise.reject({
            message: 'Muitas tentativas. Tente novamente em alguns minutos.',
            status: 429
          });

        case 500:
          return Promise.reject({
            message: 'Erro interno do servidor. Tente novamente mais tarde.',
            status: 500
          });

        default:
          return Promise.reject({
            message: data.message || 'Erro inesperado na comunicação com o servidor.',
            status: status
          });
      }
    } else if (error.request) {
      // Erro de rede ou timeout
      return Promise.reject({
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        status: 0
      });
    } else {
      // Outro tipo de erro
      return Promise.reject({
        message: 'Erro inesperado. Tente novamente.',
        status: -1
      });
    }
  }
);

// ===============================================
// FUNÇÕES UTILITÁRIAS
// ===============================================

// Função para fazer requisições GET
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Função para fazer requisições POST
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Função para fazer requisições PUT
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Função para fazer requisições PATCH
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Função para fazer requisições DELETE
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===============================================
// FUNÇÕES DE HEALTH CHECK
// ===============================================

// Verificar se API está funcionando
export const healthCheck = async () => {
  try {
    const response = await get('/health');
    return {
      status: 'ok',
      data: response
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Verificar se usuário está autenticado
export const checkAuth = async () => {
  try {
    const response = await get('/api/auth/me');
    return {
      authenticated: true,
      user: response.data.user
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error.message
    };
  }
};

// ===============================================
// EXPORTAR API INSTANCE E FUNÇÕES
// ===============================================

export default api;

// Exportar objeto com todas as funções
export const apiService = {
  get,
  post,
  put,
  patch,
  delete: del,
  healthCheck,
  checkAuth
};