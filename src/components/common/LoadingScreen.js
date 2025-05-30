// src/components/common/LoadingScreen.js
// Tela de carregamento reutilizável

import React from 'react';
import { Building, Loader } from 'lucide-react';

const LoadingScreen = ({ 
  message = "Carregando...", 
  showLogo = true,
  className = "" 
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <div className="text-center">
        {showLogo && (
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Building className="text-white" size={32} />
          </div>
        )}
        
        {/* Spinner animado */}
        <div className="relative mb-6">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse"></div>
        </div>
        
        {/* Mensagem */}
        <p className="text-gray-600 text-lg font-medium">{message}</p>
        
        {/* Texto secundário */}
        <p className="text-gray-400 text-sm mt-2">
          Aguarde um momento...
        </p>
        
        {/* Barra de progresso animada */}
        <div className="w-64 mx-auto mt-4">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;