// Script para criar dados de teste (empresa e documento)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_BASE_URL = 'http://localhost:3000/v1';

async function createTestData() {
  console.log('🧪 [Test] Criando dados de teste...');
  
  try {
    // 1. Fazer login
    console.log('🔐 [Test] Fazendo login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Erro no login: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ [Test] Login realizado com sucesso');
    
    // 2. Criar empresa
    console.log('🏢 [Test] Criando empresa...');
    const companyData = {
      name: 'Empresa Teste',
      cnpj: '12.345.678/0001-90'
    };
    
    const companyResponse = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companyData)
    });
    
    if (!companyResponse.ok) {
      const errorText = await companyResponse.text();
      console.log('⚠️ [Test] Erro ao criar empresa:', errorText);
      // Continuar mesmo se der erro (empresa pode já existir)
    } else {
      console.log('✅ [Test] Empresa criada com sucesso');
    }
    
    // 3. Obter empresas
    console.log('🏢 [Test] Obtendo empresas...');
    const companiesResponse = await fetch(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!companiesResponse.ok) {
      throw new Error(`Erro ao obter empresas: ${companiesResponse.status}`);
    }
    
    const companies = await companiesResponse.json();
    if (companies.length === 0) {
      throw new Error('Nenhuma empresa encontrada');
    }
    
    const companyId = companies[0].id || companies[0].company?.id;
    console.log(`✅ [Test] Empresa encontrada: ${companyId}`);
    
    // 4. Criar documento de teste
    console.log('📄 [Test] Criando documento de teste...');
    const documentData = {
      docType: 'CNPJ',
      docNumber: '12.345.678/0001-90',
      issuer: 'Receita Federal',
      issueDate: '2024-01-01',
      expiresAt: '2025-12-31',
      notes: 'Documento de teste para exclusão'
    };
    
    const documentResponse = await fetch(`${API_BASE_URL}/companies/${companyId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(documentData)
    });
    
    if (!documentResponse.ok) {
      const errorText = await documentResponse.text();
      console.log('⚠️ [Test] Erro ao criar documento:', errorText);
    } else {
      console.log('✅ [Test] Documento criado com sucesso');
    }
    
    console.log('✅ [Test] Dados de teste criados com sucesso!');
    
  } catch (error) {
    console.error('❌ [Test] Erro ao criar dados de teste:', error.message);
  }
}

// Executar criação de dados de teste
createTestData();
