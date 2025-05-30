// src/components/auth/RegisterPage.js
// Página de registro integrada com o backend

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Building, UserPlus, Lock, Eye, EyeOff, Mail, User, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register, isLoading, error, clearError } = useAuth();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false
    }
  });

  // Limpar erros quando o componente montar
  useEffect(() => {
    clearError();
  }, [clearError]);

  // ===============================================
  // FUNÇÃO PARA CALCULAR FORÇA DA SENHA
  // ===============================================

  const calculatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    setPasswordStrength({
      score,
      requirements
    });
  };

  // ===============================================
  // FUNÇÕES DE VALIDAÇÃO
  // ===============================================

  const validateForm = () => {
    const errors = {};

    // Validar nome
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      errors.nome = 'Nome deve ter pelo menos 2 caracteres';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.nome.trim())) {
      errors.nome = 'Nome deve conter apenas letras e espaços';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    // Validar senha
    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      errors.senha = 'Senha deve ter pelo menos 6 caracteres';
    } else if (passwordStrength.score < 3) {
      errors.senha = 'Senha muito fraca. Inclua letras maiúsculas, minúsculas e números';
    }

    // Validar confirmação de senha
    if (!formData.confirmarSenha) {
      errors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'Senhas não coincidem';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===============================================
  // HANDLERS
  // ===============================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular força da senha quando alterar
    if (name === 'senha') {
      calculatePasswordStrength(value);
    }

    // Limpar erro específico quando usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Limpar erro de confirmação se senhas coincidirem
    if (name === 'confirmarSenha' && value === formData.senha) {
      setValidationErrors(prev => ({
        ...prev,
        confirmarSenha: ''
      }));
    }

    // Limpar erro geral
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulário
    if (!validateForm()) {
      return;
    }

    // Tentar fazer registro
    const result = await register({
      nome: formData.nome.trim(),
      email: formData.email.trim().toLowerCase(),
      senha: formData.senha,
      confirmarSenha: formData.confirmarSenha
    });
    
    if (result.success) {
      console.log('✅ Registro realizado - redirecionamento automático');
      // O redirecionamento será feito automaticamente pelo AuthContext
    }
    // Se não der certo, o erro já será mostrado pelo AuthContext
  };

  // ===============================================
  // COMPONENTE DE FORÇA DA SENHA
  // ===============================================

  const PasswordStrengthIndicator = () => {
    const getStrengthColor = () => {
      switch (passwordStrength.score) {
        case 0:
        case 1:
          return 'bg-red-500';
        case 2:
          return 'bg-yellow-500';
        case 3:
          return 'bg-blue-500';
        case 4:
          return 'bg-green-500';
        default:
          return 'bg-gray-300';
      }
    };

    const getStrengthText = () => {
      switch (passwordStrength.score) {
        case 0:
        case 1:
          return 'Muito fraca';
        case 2:
          return 'Fraca';
        case 3:
          return 'Boa';
        case 4:
          return 'Forte';
        default:
          return '';
      }
    };

    if (!formData.senha) return null;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Força da senha:</span>
          <span className={`text-xs font-medium ${
            passwordStrength.score >= 3 ? 'text-green-600' : 'text-red-600'
          }`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 space-y-1">
          {Object.entries(passwordStrength.requirements).map(([key, met]) => (
            <div key={key} className="flex items-center text-xs">
              {met ? (
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <div className="h-3 w-3 border border-gray-300 rounded-full mr-1"></div>
              )}
              <span className={met ? 'text-green-600' : 'text-gray-500'}>
                {key === 'length' && 'Pelo menos 6 caracteres'}
                {key === 'lowercase' && 'Letra minúscula'}
                {key === 'uppercase' && 'Letra maiúscula'}
                {key === 'number' && 'Número'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===============================================
  // RENDER
  // ===============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Cadastre-se para começar a usar o sistema
          </p>
        </div>

        {/* Formulário de Registro */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Campo Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.nome && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.nome}
                </p>
              )}
            </div>

            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.senha ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Crie uma senha forte"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.senha && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.senha}
                </p>
              )}
              <PasswordStrengthIndicator />
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    validationErrors.confirmarSenha ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.confirmarSenha}
                </p>
              )}
              {formData.confirmarSenha && formData.senha === formData.confirmarSenha && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Senhas coincidem
                </p>
              )}
            </div>

            {/* Erro Geral */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Botão de Registro */}
            <button
              type="submit"
              disabled={isLoading || passwordStrength.score < 3}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Criar Conta
                </>
              )}
            </button>

            {/* Link para Login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Entre aqui
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Sistema Financeiro Empresarial v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;