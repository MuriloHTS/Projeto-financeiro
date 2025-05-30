// src/App.js
// Aplicação principal com Context API integrado

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importar componentes existentes
import FinancialApp from './components/FinancialApp'; // Parte 1
import FinancialAppPart2 from './components/FinancialAppPart2'; // Parte 2  
import FinancialAppPart3 from './components/FinancialAppPart3'; // Parte 3
import FinancialAppPart4 from './components/FinancialAppPart4'; // Parte 4

// Novos componentes que vamos criar
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/common/LoadingScreen';

// ===============================================
// COMPONENTE DE ROTEAMENTO PROTEGIDO
// ===============================================

const AppRoutes = () => {
  const { isAuthenticated, initialized, isLoading } = useAuth();

  // Mostrar loading enquanto inicializa
  if (!initialized) {
    return <LoadingScreen message="Inicializando aplicação..." />;
  }

  // Se não estiver autenticado, mostrar apenas rotas públicas
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Redirecionar qualquer rota não encontrada para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Se estiver autenticado, mostrar rotas protegidas
  return (
    <Routes>
      {/* Dashboard principal */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Sistema financeiro - 4 partes */}
      <Route path="/premissas" element={<FinancialApp />} />
      <Route path="/relatorios" element={<FinancialAppPart2 />} />
      <Route path="/realizados" element={<FinancialAppPart3 />} />
      <Route path="/comparativo" element={<FinancialAppPart4 />} />
      
      {/* Redirecionar rotas de auth para dashboard quando já logado */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      
      {/* Rota não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ===============================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ===============================================

function App() {
  return (
    <div className="App">
      {/* Provider de autenticação para toda a aplicação */}
      <AuthProvider>
        <Router>
          {/* Componente que gerencia as rotas baseado na autenticação */}
          <AppRoutes />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;