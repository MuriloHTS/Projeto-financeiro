import React, { useState } from 'react';
import { Building, User, Download, Eye, BarChart3, Calendar, FileText, Calculator, Target, TrendingUp } from 'lucide-react';

const FinancialAppPart2 = () => {
  const [activeView, setActiveView] = useState('anual');
  const [selectedMonth, setSelectedMonth] = useState(0);
  
  // Dados simulados vindos da Parte 1
  const [premissas] = useState({
    receitaOperacional: 186163.52,
    resfriadores: 135122.60,
    insunfladores: 5075.10,
    exaustores: 23765.31,
    splits: 22200.51
  });

  const [despesasFixas] = useState({
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

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const calcularDespesasFixasTotal = () => {
    return Object.values(despesasFixas).reduce((acc, val) => acc + val, 0);
  };

  const calcularResultadoLiquido = () => {
    return premissas.receitaOperacional - calcularDespesasFixasTotal();
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm border'
      }`}
    >
      {label}
    </button>
  );

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

  const RelatorioAnual = () => (
    <Card title="Relatório de Valores Planejados - Visão Anual" icon={BarChart3}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">Categoria</th>
              {meses.map(mes => (
                <th key={mes} className="border border-gray-200 p-2 text-center font-medium text-gray-700 min-w-[90px] text-xs">
                  {mes.slice(0, 3)}
                </th>
              ))}
              <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Total Anual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 p-3 font-medium text-blue-600">Receita Operacional</td>
              {meses.map(mes => (
                <td key={mes} className="border border-gray-200 p-2 text-center text-xs">
                  R$ {premissas.receitaOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </td>
              ))}
              <td className="border border-gray-200 p-3 text-center font-bold text-blue-600">
                R$ {(premissas.receitaOperacional * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-3 pl-6 text-sm text-gray-600">• Resfriadores</td>
              {meses.map(mes => (
                <td key={mes} className="border border-gray-200 p-2 text-center text-xs">
                  R$ {premissas.resfriadores.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </td>
              ))}
              <td className="border border-gray-200 p-3 text-center text-sm">
                R$ {(premissas.resfriadores * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-3 pl-6 text-sm text-gray-600">• Insufladores</td>
              {meses.map(mes => (
                <td key={mes} className="border border-gray-200 p-2 text-center text-xs">
                  R$ {premissas.insunfladores.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </td>
              ))}
              <td className="border border-gray-200 p-3 text-center text-sm">
                R$ {(premissas.insunfladores * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-3 pl-6 text-sm text-gray-600">• Exaustores</td>
              {meses.map(mes => (
                <td key={mes} className="border border-gray-200 p-2 text-center text-xs">
                  R$ {premissas.exaustores.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </td>
              ))}
              <td className="border border-gray-200 p-3 text-center text-sm">
                R$ {(premissas.exaustores * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            <tr>
              <td className="border border-gray-200 p-3 pl-6 text-sm text-gray-600">• Splits</td>
              {meses.map(mes => (
                <td key={mes} className="border border-gray-200 p-2 text-center text-xs">
                  R$ {premissas.splits.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </td>
              ))}
              <td className="border border-gray-200 p-3 text-center text-sm">
                R$ {(premissas.splits * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            <tr className="bg-red-50">
              <td className="border border-gray-200 p-3 font-medium text-red-600">Despesas Fixas</td>
              {meses.map(mes => (
                <td key={mes} className="border border-gray-200 p-2 text-center text-xs">
                  R$ {calcularDespesasFixasTotal().toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </td>
              ))}
              <td className="border border-gray-200 p-3 text-center font-bold text-red-600">
                R$ {(calcularDespesasFixasTotal() * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
            
            <tr className="bg-green-50">
              <td className="border border-gray-200 p-3 font-bold text-green-600">Resultado Líquido</td>
              {meses.map(mes => {
                const resultado = calcularResultadoLiquido();
                return (
                  <td key={mes} className="border border-gray-200 p-2 text-center text-xs font-bold">
                    R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </td>
                );
              })}
              <td className="border border-gray-200 p-3 text-center font-bold text-green-600">
                R$ {(calcularResultadoLiquido() * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );

  const RelatorioMensal = () => (
    <Card title={`Relatório Detalhado - ${meses[selectedMonth]}`} icon={Calendar}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Mês</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="w-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {meses.map((mes, index) => (
            <option key={mes} value={index}>{mes}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-600" size={18} />
            <span className="text-sm text-blue-600 font-medium">Receita Total</span>
          </div>
          <p className="text-xl font-bold text-blue-800">
            R$ {premissas.receitaOperacional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-red-600" size={18} />
            <span className="text-sm text-red-600 font-medium">Despesas Fixas</span>
          </div>
          <p className="text-xl font-bold text-red-800">
            R$ {calcularDespesasFixasTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="text-green-600" size={18} />
            <span className="text-sm text-green-600 font-medium">Resultado Líquido</span>
          </div>
          <p className="text-xl font-bold text-green-800">
            R$ {calcularResultadoLiquido().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-purple-600" size={18} />
            <span className="text-sm text-purple-600 font-medium">Margem Líquida</span>
          </div>
          <p className="text-xl font-bold text-purple-800">
            {((calcularResultadoLiquido() / premissas.receitaOperacional) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Detalhamento das Receitas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Resfriadores</span>
              <p className="font-bold text-gray-800">R$ {premissas.resfriadores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-xs text-gray-500">
                {((premissas.resfriadores / premissas.receitaOperacional) * 100).toFixed(1)}% da receita
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Insufladores</span>
              <p className="font-bold text-gray-800">R$ {premissas.insunfladores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-xs text-gray-500">
                {((premissas.insunfladores / premissas.receitaOperacional) * 100).toFixed(1)}% da receita
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Exaustores</span>
              <p className="font-bold text-gray-800">R$ {premissas.exaustores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-xs text-gray-500">
                {((premissas.exaustores / premissas.receitaOperacional) * 100).toFixed(1)}% da receita
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">Splits</span>
              <p className="font-bold text-gray-800">R$ {premissas.splits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="text-xs text-gray-500">
                {((premissas.splits / premissas.receitaOperacional) * 100).toFixed(1)}% da receita
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-3">Principais Despesas Fixas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(despesasFixas)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <p className="font-bold text-gray-800">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <span className="text-xs text-gray-500">
                    {((value / calcularDespesasFixasTotal()) * 100).toFixed(1)}% das despesas
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );

  const IndicadoresFinanceiros = () => (
    <Card title="Indicadores e Análises Financeiras" icon={BarChart3}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Indicadores de Rentabilidade</h4>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <span className="text-sm text-blue-600 font-medium">Margem Bruta</span>
            <p className="text-2xl font-bold text-blue-800">
              {((premissas.receitaOperacional / premissas.receitaOperacional) * 100).toFixed(1)}%
            </p>
            <span className="text-xs text-blue-600">Receita operacional / Receita total</span>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <span className="text-sm text-green-600 font-medium">Margem Líquida</span>
            <p className="text-2xl font-bold text-green-800">
              {((calcularResultadoLiquido() / premissas.receitaOperacional) * 100).toFixed(1)}%
            </p>
            <span className="text-xs text-green-600">Resultado líquido / Receita total</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Ponto de Equilíbrio</h4>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <span className="text-sm text-yellow-600 font-medium">Break-even Mensal</span>
            <p className="text-lg font-bold text-yellow-800">
              R$ {calcularDespesasFixasTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-yellow-600">Receita mínima para cobrir despesas</span>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <span className="text-sm text-orange-600 font-medium">Break-even Anual</span>
            <p className="text-lg font-bold text-orange-800">
              R$ {(calcularDespesasFixasTotal() * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-orange-600">Total anual para equilibrar contas</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Projeções</h4>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <span className="text-sm text-purple-600 font-medium">Resultado Anual</span>
            <p className="text-lg font-bold text-purple-800">
              R$ {(calcularResultadoLiquido() * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-purple-600">Projeção baseada nos valores atuais</span>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <span className="text-sm text-indigo-600 font-medium">Reserva Recomendada</span>
            <p className="text-lg font-bold text-indigo-800">
              R$ {(calcularDespesasFixasTotal() * 3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-indigo-600">3 meses de despesas fixas</span>
          </div>
        </div>
      </div>
    </Card>
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
                <p className="text-sm text-gray-600">Parte 2: Valores Planejados e Relatórios</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                Pessoa Jurídica
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building size={16} />
                Refrigeração
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto">
            <TabButton
              id="anual"
              label="Relatório Anual"
              isActive={activeView === 'anual'}
              onClick={() => setActiveView('anual')}
            />
            <TabButton
              id="mensal"
              label="Relatório Mensal"
              isActive={activeView === 'mensal'}
              onClick={() => setActiveView('mensal')}
            />
            <TabButton
              id="indicadores"
              label="Indicadores"
              isActive={activeView === 'indicadores'}
              onClick={() => setActiveView('indicadores')}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {activeView === 'anual' && <RelatorioAnual />}
          {activeView === 'mensal' && <RelatorioMensal />}
          {activeView === 'indicadores' && <IndicadoresFinanceiros />}

          {/* Botões de Exportação */}
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={18} />
              Exportar Relatório
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Eye size={18} />
              Visualizar Gráfico
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <FileText size={18} />
              Gerar PDF
            </button>
          </div>

          {/* Status das Próximas Partes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📊 Parte 2 Concluída</h4>
            <ul className="text-sm text-blue-700 space-y-1 mb-3">
              <li>✅ Relatório anual completo com breakdown por categoria</li>
              <li>✅ Relatório mensal detalhado com seletor de mês</li>
              <li>✅ Indicadores financeiros e análises</li>
              <li>✅ Cálculos de margem, break-even e projeções</li>
            </ul>
            <p className="text-xs text-blue-600 font-medium">Próximo: Parte 3 - Lançamentos Pontuais e Valores Realizados</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialAppPart2;