// src/components/Dashboard.js
// Dashboard principal com navegação entre as 4 partes do sistema

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building, 
  User, 
  LogOut, 
  Settings, 
  Target, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  Calendar,
  FileText,
  Home
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  // ===============================================
  // DADOS DE NAVEGAÇÃO
  // ===============================================

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      description: 'Visão geral do sistema',
      color: 'bg-blue-500'
    },
    {
      id: 'premissas',
      name: 'Premissas',
      icon: Target,
      description: 'Configurações e metas financeiras',
      color: 'bg-green-500'
    },
    {
      id: 'relatorios',
      name: 'Relatórios',
      icon: BarChart3,
      description: 'Valores planejados e análises',
      color: 'bg-purple-500'
    },
    {
      id: 'realizados',
      name: 'Realizados',
      icon: DollarSign,
      description: 'Lançamentos e valores realizados',
      color: 'bg-orange-500'
    },
    {
      id: 'comparativo',
      name: 'Comparativo',
      icon: TrendingUp,
      description: 'Real vs Planejado e Fluxo de Caixa',
      color: 'bg-indigo-500'
    }
  ];

  // ===============================================
  // HANDLERS
  // ===============================================

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      await logout();
    }
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    // Aqui você pode implementar navegação real se usar React Router
    // navigate(`/${sectionId}`);
  };

  // ===============================================
  // RENDER
  // ===============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema Mondarc Financial
                </h1>
                <p className="text-sm text-gray-600">
                  Gestão Financeira Empresarial
                </p>
              </div>
            </div>

            {/* Menu do Usuário */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span className="hidden sm:block">
                  Olá, {user?.nome || 'Usuário'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:block">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Boas-vindas */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user?.nome?.split(' ')[0] || 'Usuário'}! 👋
          </h2>
          <p className="text-gray-600">
            Escolha uma das seções abaixo para começar a usar o sistema financeiro.
          </p>
        </div>

        {/* Grid de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="bg-white rounded-xl shadow-lg border hover:shadow-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    Acessar
                    <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Seção de Status */}
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Status do Sistema</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Backend API</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Conectado e funcionando</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Banco de Dados</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">PostgreSQL ativo</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-800">Autenticação</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">JWT válido</p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-800">Sistema</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">Versão 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Informações de Desenvolvimento */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-blue-800">Sistema em Integração</h3>
          </div>
          
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>✅ Concluído:</strong> Backend completo com 35+ endpoints funcionais
            </p>
            <p>
              <strong>🔄 Em andamento:</strong> Integração Frontend ↔ Backend
            </p>
            <p>
              <strong>📋 Próximo:</strong> Conectar as 4 partes do sistema com APIs reais
            </p>
          </div>
          
          <div className="mt-4 text-xs text-blue-600">
            <p>
              As seções acima ainda usam dados simulados. Em breve serão conectadas com o backend real.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;