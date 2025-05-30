import React, { useState } from 'react';
import { Building, User, Plus, Save, Upload, Download, FileText, DollarSign, TrendingUp, Calendar, Trash2, Edit3, Filter, BarChart3 } from 'lucide-react';

const FinancialAppPart3 = () => {
  const [activeView, setActiveView] = useState('lancamentos');
  
  // Estados para lançamentos pontuais
  const [lancamentosPontuais, setLancamentosPontuais] = useState([
    {
      id: 1,
      data: '2025-01-15',
      descricao: 'Equipamento novo - Compressor',
      valor: 15000,
      tipo: 'despesa',
      categoria: 'equipamentos'
    },
    {
      id: 2,
      data: '2025-02-20',
      descricao: 'Bonus por projeto especial',
      valor: 8500,
      tipo: 'receita',
      categoria: 'extra'
    }
  ]);

  const [novoLancamento, setNovoLancamento] = useState({
    data: '',
    descricao: '',
    valor: '',
    tipo: 'despesa',
    categoria: 'geral'
  });

  // Estados para valores realizados
  const [valoresRealizados, setValoresRealizados] = useState({
    janeiro: 175000,
    fevereiro: 190000,
    marco: 165000,
    abril: 0,
    maio: 0,
    junho: 0,
    julho: 0,
    agosto: 0,
    setembro: 0,
    outubro: 0,
    novembro: 0,
    dezembro: 0
  });

  // Estados para filtros
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const categorias = [
    'geral', 'equipamentos', 'manutencao', 'marketing', 'extra', 'impostos', 'investimentos'
  ];

  // Dados simulados da Parte 1
  const premissaReceita = 186163.52;

  const adicionarLancamento = () => {
    if (novoLancamento.data && novoLancamento.descricao && novoLancamento.valor) {
      setLancamentosPontuais([...lancamentosPontuais, {
        ...novoLancamento,
        id: Date.now(),
        valor: parseFloat(novoLancamento.valor)
      }]);
      setNovoLancamento({ 
        data: '', 
        descricao: '', 
        valor: '', 
        tipo: 'despesa', 
        categoria: 'geral' 
      });
    }
  };

  const excluirLancamento = (id) => {
    setLancamentosPontuais(lancamentosPontuais.filter(l => l.id !== id));
  };

  const calcularTotalRealizados = () => {
    return Object.values(valoresRealizados).reduce((acc, val) => acc + val, 0);
  };

  const calcularTotalLancamentos = (tipo = null) => {
    return lancamentosPontuais
      .filter(l => tipo ? l.tipo === tipo : true)
      .reduce((acc, l) => acc + l.valor, 0);
  };

  const lancamentosFiltrados = lancamentosPontuais.filter(lancamento => {
    const mesLancamento = new Date(lancamento.data).getMonth();
    const filtroMesOk = filtroMes === 'todos' || parseInt(filtroMes) === mesLancamento;
    const filtroTipoOk = filtroTipo === 'todos' || lancamento.tipo === filtroTipo;
    return filtroMesOk && filtroTipoOk;
  });

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

  const LancamentosPontuais = () => (
    <div className="space-y-6">
      {/* Formulário para Novo Lançamento */}
      <Card title="Novo Lançamento Pontual" icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={novoLancamento.data}
              onChange={(e) => setNovoLancamento({...novoLancamento, data: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <input
              type="text"
              value={novoLancamento.descricao}
              onChange={(e) => setNovoLancamento({...novoLancamento, descricao: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição do lançamento"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">R$</span>
              <input
                type="number"
                value={novoLancamento.valor}
                onChange={(e) => setNovoLancamento({...novoLancamento, valor: e.target.value})}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={novoLancamento.tipo}
              onChange={(e) => setNovoLancamento({...novoLancamento, tipo: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={novoLancamento.categoria}
              onChange={(e) => setNovoLancamento({...novoLancamento, categoria: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={adicionarLancamento}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
        </div>
      </Card>

      {/* Resumo dos Lançamentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-green-600 font-medium">Total Receitas Extras</p>
              <p className="text-xl font-bold text-green-800">
                R$ {calcularTotalLancamentos('receita').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <FileText className="text-red-600" size={24} />
            <div>
              <p className="text-sm text-red-600 font-medium">Total Despesas Extras</p>
              <p className="text-xl font-bold text-red-800">
                R$ {calcularTotalLancamentos('despesa').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-blue-600 font-medium">Saldo Líquido</p>
              <p className="text-xl font-bold text-blue-800">
                R$ {(calcularTotalLancamentos('receita') - calcularTotalLancamentos('despesa')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card title="Filtros" icon={Filter}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os tipos</option>
              <option value="receita">Apenas receitas</option>
              <option value="despesa">Apenas despesas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Mês</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os meses</option>
              {meses.map((mes, index) => (
                <option key={mes} value={index}>{mes}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Lançamentos */}
      <Card title="Lançamentos Pontuais" icon={FileText}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">Data</th>
                <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">Descrição</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Categoria</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Tipo</th>
                <th className="border border-gray-200 p-3 text-right font-medium text-gray-700">Valor</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lancamentosFiltrados.map(lancamento => (
                <tr key={lancamento.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3">
                    {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="border border-gray-200 p-3">{lancamento.descricao}</td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs capitalize">
                      {lancamento.categoria}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lancamento.tipo === 'receita' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {lancamento.tipo}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-right">
                    <span className={lancamento.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                      R$ {lancamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => excluirLancamento(lancamento.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lancamentosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="border border-gray-200 p-8 text-center text-gray-500">
                    Nenhum lançamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const ValoresRealizados = () => (
    <div className="space-y-6">
      {/* Entrada de Valores Realizados */}
      <Card title="Lançamento de Valores Realizados" icon={DollarSign}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meses.map((mes, index) => {
            const mesKey = mes.toLowerCase().replace('ç', 'c');
            const valor = valoresRealizados[mesKey] || 0;
            const percentual = ((valor / premissaReceita) * 100);
            
            return (
              <div key={mes} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{mes}</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={valor || ''}
                    onChange={(e) => setValoresRealizados({
                      ...valoresRealizados, 
                      [mesKey]: parseFloat(e.target.value) || 0
                    })}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    Meta: R$ {premissaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className={`font-medium ${percentual >= 100 ? 'text-green-600' : percentual >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${percentual >= 100 ? 'bg-green-500' : percentual >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={18} />
              <span className="font-medium text-green-800">Total Realizado</span>
            </div>
            <p className="text-2xl font-bold text-green-800">
              R$ {calcularTotalRealizados().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-600" size={18} />
              <span className="font-medium text-blue-800">Meta Anual</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">
              R$ {(premissaReceita * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-purple-600" size={18} />
              <span className="font-medium text-purple-800">Performance</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">
              {((calcularTotalRealizados() / (premissaReceita * 12)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Análise Mensal */}
      <Card title="Análise de Performance Mensal" icon={BarChart3}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left font-medium text-gray-700">Mês</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Meta</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Realizado</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Diferença</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Performance</th>
                <th className="border border-gray-200 p-3 text-center font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((mes, index) => {
                const mesKey = mes.toLowerCase().replace('ç', 'c');
                const realizado = valoresRealizados[mesKey] || 0;
                const meta = premissaReceita;
                const diferenca = realizado - meta;
                const performance = ((realizado / meta) * 100);
                
                return (
                  <tr key={mes} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 font-medium">{mes}</td>
                    <td className="border border-gray-200 p-3 text-center">
                      R$ {meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-200 p-3 text-center">
                      R$ {realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`border border-gray-200 p-3 text-center font-medium ${
                      diferenca >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diferenca >= 0 ? '+' : ''}R$ {diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`border border-gray-200 p-3 text-center font-bold ${
                      performance >= 100 ? 'text-green-600' : performance >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {performance.toFixed(1)}%
                    </td>
                    <td className="border border-gray-200 p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        performance >= 100 
                          ? 'bg-green-100 text-green-800' 
                          : performance >= 80 
                            ? 'bg-yellow-100 text-yellow-800'
                            : realizado > 0
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {performance >= 100 ? 'Atingiu' : performance >= 80 ? 'Próximo' : realizado > 0 ? 'Abaixo' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
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
                <p className="text-sm text-gray-600">Parte 3: Lançamentos e Valores Realizados</p>
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
              id="lancamentos"
              label="Lançamentos Pontuais"
              isActive={activeView === 'lancamentos'}
              onClick={() => setActiveView('lancamentos')}
            />
            <TabButton
              id="realizados"
              label="Valores Realizados"
              isActive={activeView === 'realizados'}
              onClick={() => setActiveView('realizados')}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {activeView === 'lancamentos' && <LancamentosPontuais />}
          {activeView === 'realizados' && <ValoresRealizados />}

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Save size={18} />
              Salvar Dados
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload size={18} />
              Importar Dados
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download size={18} />
              Exportar Relatório
            </button>
          </div>

          {/* Status das Partes */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">💰 Parte 3 Concluída</h4>
            <ul className="text-sm text-green-700 space-y-1 mb-3">
              <li>✅ Sistema de lançamentos pontuais com categorias</li>
              <li>✅ Filtros por tipo e mês</li>
              <li>✅ Entrada de valores realizados com indicadores</li>
              <li>✅ Análise de performance vs metas</li>
              <li>✅ Edição e exclusão de lançamentos</li>
            </ul>
            <p className="text-xs text-green-600 font-medium">Próximo: Parte 4 - Comparativo Real vs Planejado e Fluxo de Caixa Completo</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialAppPart3;