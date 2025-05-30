// prisma/seed.js
// Script SEGURO para popular o banco com dados de exemplo

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ===============================================
  // 1. LIMPEZA SEGURA DOS DADOS (ordem correta)
  // ===============================================
  
  console.log('🧹 Limpando dados existentes...');
  
  try {
    // Ordem correta: primeiro as tabelas filhas, depois as pais
    await prisma.detalheRealizado.deleteMany({});
    console.log('✅ Detalhes realizados limpos');
  } catch (error) {
    console.log('⚠️ Tabela detalhes_realizados não existe ou está vazia');
  }

  try {
    await prisma.categoriaReceita.deleteMany({});
    console.log('✅ Categorias receita limpas');
  } catch (error) {
    console.log('⚠️ Tabela categorias_receita não existe ou está vazia');
  }

  try {
    await prisma.lancamentoPontual.deleteMany({});
    console.log('✅ Lançamentos pontuais limpos');
  } catch (error) {
    console.log('⚠️ Tabela lancamentos_pontuais não existe ou está vazia');
  }

  try {
    await prisma.valorRealizado.deleteMany({});
    console.log('✅ Valores realizados limpos');
  } catch (error) {
    console.log('⚠️ Tabela valores_realizados não existe ou está vazia');
  }

  try {
    await prisma.despesaFixa.deleteMany({});
    console.log('✅ Despesas fixas limpas');
  } catch (error) {
    console.log('⚠️ Tabela despesas_fixas não existe ou está vazia');
  }

  try {
    await prisma.premissa.deleteMany({});
    console.log('✅ Premissas limpas');
  } catch (error) {
    console.log('⚠️ Tabela premissas não existe ou está vazia');
  }

  try {
    await prisma.empresa.deleteMany({});
    console.log('✅ Empresas limpas');
  } catch (error) {
    console.log('⚠️ Tabela empresas não existe ou está vazia');
  }

  try {
    await prisma.usuario.deleteMany({});
    console.log('✅ Usuários limpos');
  } catch (error) {
    console.log('⚠️ Tabela usuarios não existe ou está vazia');
  }

  try {
    await prisma.templateCategoria.deleteMany({});
    console.log('✅ Templates limpos');
  } catch (error) {
    console.log('⚠️ Tabela templates_categorias não existe ou está vazia');
  }

  // ===============================================
  // 2. CRIAR TEMPLATES DE CATEGORIAS
  // ===============================================

  console.log('📋 Criando templates de categorias...');

  const templates = [
    {
      nome: 'Refrigeração e Climatização',
      ramo_atividade: 'refrigeracao',
      tipo: 'receita',
      categorias: [
        { nome: 'Resfriadores', cor: '#3B82F6' },
        { nome: 'Insufladores', cor: '#10B981' },
        { nome: 'Exaustores', cor: '#F59E0B' },
        { nome: 'Splits', cor: '#EF4444' },
        { nome: 'Manutenção', cor: '#8B5CF6' }
      ],
      descricao: 'Categorias padrão para empresas de refrigeração'
    },
    {
      nome: 'E-commerce',
      ramo_atividade: 'ecommerce',
      tipo: 'receita',
      categorias: [
        { nome: 'Vendas Online', cor: '#3B82F6' },
        { nome: 'Marketplace', cor: '#10B981' },
        { nome: 'Vendas B2B', cor: '#F59E0B' },
        { nome: 'Drop Shipping', cor: '#EF4444' }
      ],
      descricao: 'Categorias padrão para e-commerce'
    },
    {
      nome: 'Despesas Gerais',
      ramo_atividade: 'geral',
      tipo: 'despesa',
      categorias: [
        { nome: 'Administrativas', cor: '#6B7280' },
        { nome: 'Operacionais', cor: '#F59E0B' },
        { nome: 'Financeiras', cor: '#EF4444' },
        { nome: 'Pessoal', cor: '#10B981' }
      ],
      descricao: 'Despesas administrativas comuns'
    }
  ];

  for (const template of templates) {
    try {
      await prisma.templateCategoria.create({
        data: template
      });
      console.log(`✅ Template criado: ${template.nome}`);
    } catch (error) {
      console.log(`❌ Erro ao criar template ${template.nome}:`, error.message);
    }
  }

  // ===============================================
  // 3. CRIAR USUÁRIO DE EXEMPLO
  // ===============================================

  console.log('👤 Criando usuário de exemplo...');

  const senhaHash = await bcrypt.hash('123456', 12);

  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador Mondarc',
      email: 'admin@mondarc.com',
      senha_hash: senhaHash,
      ativo: true
    }
  });

  console.log('✅ Usuário criado:', usuario.email);

  // ===============================================
  // 4. CRIAR EMPRESA DE EXEMPLO
  // ===============================================

  console.log('🏢 Criando empresa de exemplo...');

  const empresa = await prisma.empresa.create({
    data: {
      nome: 'Mondarc Refrigeração Ltda',
      cnpj: '12.345.678/0001-99',
      tipo_pessoa: 'juridica',
      ramo_atividade: 'refrigeracao',
      telefone: '(11) 99999-9999',
      email: 'contato@mondarc.com',
      endereco: 'Rua das Empresas, 123 - São Paulo/SP',
      usuario_id: usuario.id
    }
  });

  console.log('✅ Empresa criada:', empresa.nome);

  // ===============================================
  // 5. CRIAR PREMISSAS DE EXEMPLO
  // ===============================================

  console.log('💰 Criando premissas orçamentárias...');

  const premissa = await prisma.premissa.create({
    data: {
      empresa_id: empresa.id,
      ano: 2025,
      receita_total_mensal: 186163.52,
      meta_anual: 2233962.24,
      observacoes: 'Orçamento baseado em dados históricos'
    }
  });

  console.log('✅ Premissas criadas para 2025');

  // ===============================================
  // 6. CRIAR CATEGORIAS DE RECEITA
  // ===============================================

  console.log('📊 Criando categorias de receita...');

  const categorias = [
    { nome: 'Resfriadores', valor_mensal: 135122.60, percentual: 72.58, cor: '#3B82F6', ordem: 1 },
    { nome: 'Exaustores', valor_mensal: 23765.31, percentual: 12.77, cor: '#F59E0B', ordem: 2 },
    { nome: 'Splits', valor_mensal: 22200.51, percentual: 11.92, cor: '#EF4444', ordem: 3 },
    { nome: 'Insufladores', valor_mensal: 5075.10, percentual: 2.73, cor: '#10B981', ordem: 4 }
  ];

  for (const categoria of categorias) {
    await prisma.categoriaReceita.create({
      data: {
        ...categoria,
        premissa_id: premissa.id
      }
    });
    console.log(`✅ Categoria criada: ${categoria.nome}`);
  }

  // ===============================================
  // 7. CRIAR DESPESAS FIXAS
  // ===============================================

  console.log('💸 Criando despesas fixas...');

  const despesas = [
    { categoria: 'Financeiras', subcategoria: 'Tarifas Bancárias', valor_mensal: 215.93, ordem: 1 },
    { categoria: 'Administrativas', subcategoria: 'Telefone e Internet', valor_mensal: 197.43, ordem: 2 },
    { categoria: 'Administrativas', subcategoria: 'Celular', valor_mensal: 540.00, ordem: 3 },
    { categoria: 'Operacionais', subcategoria: 'Energia Elétrica', valor_mensal: 266.73, ordem: 4 },
    { categoria: 'Administrativas', subcategoria: 'Aluguel e Condomínio', valor_mensal: 14248.95, ordem: 5 },
    { categoria: 'Operacionais', subcategoria: 'Água', valor_mensal: 153.96, ordem: 6 },
    { categoria: 'Administrativas', subcategoria: 'IPTU', valor_mensal: 416.66, ordem: 7 },
    { categoria: 'Operacionais', subcategoria: 'Transportes', valor_mensal: 4421.00, ordem: 8 },
    { categoria: 'Pessoal', subcategoria: 'Alimentação', valor_mensal: 2031.26, ordem: 9 }
  ];

  for (const despesa of despesas) {
    await prisma.despesaFixa.create({
      data: {
        ...despesa,
        empresa_id: empresa.id,
        cor: '#6B7280' // cor padrão
      }
    });
    console.log(`✅ Despesa criada: ${despesa.subcategoria}`);
  }

  // ===============================================
  // 8. CRIAR VALORES REALIZADOS DE EXEMPLO
  // ===============================================

  console.log('✅ Criando valores realizados...');

  const valoresRealizados = [
    { ano: 2025, mes: 1, valor: 175000.00, observacao: 'Janeiro - Início do ano' },
    { ano: 2025, mes: 2, valor: 190000.00, observacao: 'Fevereiro - Boa performance' },
    { ano: 2025, mes: 3, valor: 165000.00, observacao: 'Março - Abaixo da meta' },
    { ano: 2025, mes: 4, valor: 180000.00, observacao: 'Abril - Recuperação' },
    { ano: 2025, mes: 5, valor: 195000.00, observacao: 'Maio - Acima da meta' },
    { ano: 2025, mes: 6, valor: 170000.00, observacao: 'Junho - Meta quase atingida' }
  ];

  for (const realizado of valoresRealizados) {
    await prisma.valorRealizado.create({
      data: {
        ...realizado,
        empresa_id: empresa.id,
        fonte: 'Seed'
      }
    });
    console.log(`✅ Valor realizado criado: ${realizado.mes}/${realizado.ano}`);
  }

  // ===============================================
  // 9. CRIAR LANÇAMENTOS PONTUAIS
  // ===============================================

  console.log('🎯 Criando lançamentos pontuais...');

  const lancamentos = [
    {
      data: new Date('2025-01-15'),
      descricao: 'Compra de equipamento industrial',
      valor: 15000.00, // Valor positivo, tipo define se é receita/despesa
      tipo: 'despesa',
      categoria: 'Equipamentos',
      numero_documento: 'NF-001234'
    },
    {
      data: new Date('2025-02-20'),
      descricao: 'Bônus por projeto especial',
      valor: 8500.00,
      tipo: 'receita',
      categoria: 'Extra',
      observacao: 'Projeto de climatização especial'
    },
    {
      data: new Date('2025-03-10'),
      descricao: 'Manutenção emergencial',
      valor: 5200.00,
      tipo: 'despesa',
      categoria: 'Manutenção',
      numero_documento: 'OS-5678'
    },
    {
      data: new Date('2025-04-05'),
      descricao: 'Venda de equipamento usado',
      valor: 12000.00,
      tipo: 'receita',
      categoria: 'Vendas',
      observacao: 'Resfriador usado em bom estado'
    }
  ];

  for (const lancamento of lancamentos) {
    await prisma.lancamentoPontual.create({
      data: {
        ...lancamento,
        empresa_id: empresa.id
      }
    });
    console.log(`✅ Lançamento criado: ${lancamento.descricao}`);
  }

  console.log('');
  console.log('🎉 =======================================');
  console.log('🎉 SEED CONCLUÍDO COM SUCESSO!');
  console.log('🎉 =======================================');
  console.log('');
  console.log('📊 DADOS CRIADOS:');
  console.log('👤 Usuário: admin@mondarc.com (senha: 123456)');
  console.log('🏢 Empresa: Mondarc Refrigeração Ltda');
  console.log('💰 Premissas: 2025 com 4 categorias de receita');
  console.log('💸 Despesas: 9 categorias de despesas fixas');
  console.log('✅ Realizados: 6 meses de dados');
  console.log('🎯 Lançamentos: 4 lançamentos pontuais');
  console.log('📋 Templates: 3 templates de categorias');
  console.log('');
  console.log('🌐 Acesse: http://localhost:5000/health');
  console.log('');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });