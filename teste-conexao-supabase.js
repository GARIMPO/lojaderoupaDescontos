// Script para testar a conexão com o Supabase
// Execute com: node teste-conexao-supabase.js
// Instalação necessária: npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xzvkkbrbwxghhqtncxok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6dmtrYnJid3hnaGhxdG5jeG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMjE4MjcsImV4cCI6MjA2MTc5NzgyN30.nOuYr8xRzVGlq6SI_3iG7IRJzitz-0VbX3yvVZ6VLMs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarConexao() {
  console.log('🔄 Testando conexão com o Supabase...');
  
  try {
    // 1. Verificar a conexão básica
    const { data: health, error: healthError } = await supabase.from('products').select('count(*)');
    
    if (healthError) {
      console.error('❌ Erro na conexão básica:', healthError.message);
      return;
    }
    
    console.log('✅ Conexão básica funcional');
    
    // 2. Verificar estrutura da tabela products
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', { table_name: 'products' });
    
    if (tableError) {
      console.error('❌ Erro ao obter informações da tabela:', tableError.message);
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...');
      
      // Selecionar um produto para ver sua estrutura
      const { data: sampleProduct, error: sampleError } = await supabase
        .from('products')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleError) {
        console.error('❌ Erro ao obter produto de exemplo:', sampleError.message);
      } else {
        console.log('📋 Estrutura do produto:', Object.keys(sampleProduct));
      }
    } else {
      console.log('📊 Informações da tabela products:', tableInfo);
    }
    
    // 3. Testar upload de um produto simples
    const testProduct = {
      id: `test_${Date.now()}`,
      name: 'Produto de Teste JS',
      description: 'Produto de teste para verificar a estrutura da tabela',
      price: 99.90,
      discount: 0,
      stock: 10,
      featured: false,
      on_sale: false,
      imageUrl: '',
      images: [],
      category: 'teste',
      type: 'clothing',
      sizes: ['P', 'M', 'G'],
      colors: ['Preto']
    };
    
    console.log('🔄 Tentando salvar produto de teste...');
    
    const { data: savedProduct, error: saveError } = await supabase
      .from('products')
      .upsert(testProduct)
      .select();
    
    if (saveError) {
      console.error('❌ Erro ao salvar produto:', saveError.message);
      if (saveError.details) {
        console.error('📋 Detalhes do erro:', saveError.details);
      }
    } else {
      console.log('✅ Produto salvo com sucesso!', savedProduct);
    }
    
    // 4. Verificar bucket de armazenamento
    console.log('🔄 Verificando bucket de imagens...');
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError.message);
    } else {
      console.log('📦 Buckets disponíveis:', buckets.map(b => b.name));
      
      // Verificar se o bucket 'images' existe
      const imagesBucket = buckets.find(b => b.name === 'images');
      if (imagesBucket) {
        console.log('✅ Bucket "images" encontrado');
        
        // Verificar políticas do bucket
        const { data: policies, error: policiesError } = await supabase
          .rpc('get_policies_for_table', { table_name: 'storage.objects' });
        
        if (policiesError) {
          console.error('❌ Erro ao verificar políticas:', policiesError.message);
        } else if (policies) {
          console.log('🔒 Políticas para storage.objects:', policies);
        }
      } else {
        console.error('❌ Bucket "images" não encontrado!');
      }
    }
    
  } catch (error) {
    console.error('🔥 Erro crítico:', error.message);
  }
}

testarConexao(); 