const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar o payload corrigido
async function testPayloadFixed() {
  console.log('🔧 ===== TESTANDO PAYLOAD CORRIGIDO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Verificar se há empresas
    console.log('2️⃣ Verificando empresas existentes...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('Empresas encontradas:', companiesResponse.data.length);
    
    if (companiesResponse.data.length > 0) {
      console.log('✅ Há empresas existentes - testando atualização');
      await testUpdateExisting(access_token, companiesResponse.data[0]);
    } else {
      console.log('⚠️  Nenhuma empresa encontrada - testando criação');
      await testCreateNew(access_token);
    }

    console.log('\n🎉 ===== TESTE CONCLUÍDO =====');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Testar atualização de empresa existente
async function testUpdateExisting(accessToken, companyData) {
  console.log('\n3️⃣ Testando atualização de empresa existente...');
  
  const company = companyData.company || companyData;
  const companyId = company.id;
  
  console.log('Company ID:', companyId);
  
  const updateData = {
    name: 'Empresa Atualizada Teste',
    phone: '(11) 99999-9999',
    address: 'Rua Atualizada, 456 - São Paulo/SP',
    logoPath: '',
    letterheadPath: '',
    active: true
  };
  
  console.log('Dados para atualização:', updateData);
  
  try {
    const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Empresa atualizada com sucesso!');
    console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

  } catch (updateError) {
    console.error('❌ Erro na atualização:');
    console.error('Status:', updateError.response?.status);
    console.error('Dados:', updateError.response?.data);
  }
}

// Testar criação de nova empresa
async function testCreateNew(accessToken) {
  console.log('\n3️⃣ Testando criação de nova empresa...');
  
  const createData = {
    name: 'Nova Empresa Teste',
    cnpj: '12.345.678/0001-90',
    legal_name: 'Nova Empresa Teste LTDA',
    state_registration: '123456789',
    municipal_registration: '987654321',
    phone: '(11) 99999-9999',
    address: 'Rua Nova, 123 - São Paulo/SP',
    email: 'contato@novaempresa.com',
    logoPath: '',
    letterheadPath: '',
    active: true
  };
  
  console.log('Dados para criação:', createData);
  
  try {
    const createResponse = await axios.post(`${API_BASE_URL}/companies`, createData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Empresa criada com sucesso!');
    console.log('Resposta:', JSON.stringify(createResponse.data, null, 2));

  } catch (createError) {
    console.error('❌ Erro na criação:');
    console.error('Status:', createError.response?.status);
    console.error('Dados:', createError.response?.data);
  }
}

// Executar o teste
testPayloadFixed();
