import React, { useState } from 'react';
import { Building, User, Save, Download, Calculator, Settings, Target, FileText } from 'lucide-react';

const FinancialApp = () => {
  const [userType, setUserType] = useState('juridica');
  const [businessSegment, setBusinessSegment] = useState('refrigeracao');
  
  const [premissas, setPremissas] = useState({
    receitaOperacional: 186163.52,
    resfriadores: 135122.60,
    insunfladores: 5075.10,
    exaustores: 23765.31,
    splits: 22200.51
  });

  const [despesasFixas, setDespesasFixas] = useState({
    despesasFinanceiras: 215.93,
    despesasAdministrativas: 24275.99,
    telefoneInternet: 197.43,
    celular: 540,
    energiaEletrica: 266.73,
    aluguelCondominio: 14248.95,
    agua: 153.96,
    iptu: 416.66,
    transportes: 4421,
    alimentacao: 2031.26
  });

  const calcularTotalPlanejado = () => {
    return Object.values(premissas).reduce((acc, val) => acc + val, 0);
  };

  const calcularDespesasFixasTotal = () => {
    return Object.values(despesasFixas).reduce((acc, val) => acc + val, 0);
  };

  const Card = ({ title, children, className = "", icon: Icon }) => (
    <div className={`bg-white rounded-xl shadow-lg border p-6 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="text-blue-600" size={20} />}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema Financeiro Empresarial</h1>
                <p className="text-sm text-gray-600">Controle completo do seu fluxo de caixa - Parte 1</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                {userType === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building size={16} />
                {businessSegment === 'refrigeracao' ? 'Refrigeração' : businessSegment}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          
          {/* Configuração Inicial */}
          <Card title="Configuração Inicial" icon={Settings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
                <select 
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="juridica">Pessoa Jurídica</option>
                  <option value="fisica">Pessoa Física</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ramo de Atividade</label>
                <select 
                  value={businessSegment}
                  onChange={(e) => setBusinessSegment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="refrigeracao">Refrigeração e Climatização</option>
                  <option value="comercio">Comércio</option>
                  <option value="servicos">Prestação de Serviços</option>
                  <option value="industria">Indústria</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Premissas Orçamentárias */}
          <Card title="Premissas Orçamentárias - Receitas Mensais" icon={Target}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receita Operacional Total</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={premissas.receitaOperacional}
                    onChange={(e) => setPremissas({...premissas, receitaOperacional: parseFloat(e.target.value) || 0})}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>
              
              {businessSegment === 'refrigeracao' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resfriadores</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={premissas.resfriadores}
                        onChange={(e) => setPremissas({...premissas, resfriadores: parseFloat(e.target.value) || 0})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Insufladores</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={premissas.insunfladores}
                        onChange={(e) => setPremissas({...premissas, insunfladores: parseFloat(e.target.value) || 0})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exaustores</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={premissas.exaustores}
                        onChange={(e) => setPremissas({...premissas, exaustores: parseFloat(e.target.value) || 0})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Splits</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={premissas.splits}
                        onChange={(e) => setPremissas({...premissas, splits: parseFloat(e.target.value) || 0})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="text-blue-600" size={18} />
                <span className="font-medium text-blue-800">Resumo Mensal</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                R$ {calcularTotalPlanejado().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Card>

          {/* Despesas Fixas */}
          <Card title="Despesas Fixas Mensais" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(despesasFixas).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setDespesasFixas({...despesasFixas, [key]: parseFloat(e.target.value) || 0})}
                      className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="text-red-600" size={18} />
                <span className="font-medium text-red-800">Total Despesas Fixas</span>
              </div>
              <p className="text-2xl font-bold text-red-800">
                R$ {calcularDespesasFixasTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Card>

          {/* Resumo Geral */}
          <Card title="Resumo Financeiro" icon={Calculator}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Receita Mensal</p>
                <p className="text-2xl font-bold text-blue-800">
                  R$ {premissas.receitaOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Despesas Mensais</p>
                <p className="text-2xl font-bold text-red-800">
                  R$ {calcularDespesasFixasTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Resultado Mensal</p>
                <p className="text-2xl font-bold text-green-800">
                  R$ {(premissas.receitaOperacional - calcularDespesasFixasTotal()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Save size={18} />
              Salvar Premissas
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={18} />
              Exportar PDF
            </button>
          </div>

          {/* Próximas Partes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">🚀 Próximas Funcionalidades</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Parte 2: Valores Planejados e Relatórios</li>
              <li>• Parte 3: Lançamentos Pontuais e Valores Realizados</li>
              <li>• Parte 4: Comparativo Real vs Planejado e Fluxo de Caixa</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialApp;