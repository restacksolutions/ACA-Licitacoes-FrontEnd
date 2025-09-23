const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para criar uma empresa de teste
async function createTestCompany() {
  console.log('🏢 ===== CRIANDO EMPRESA DE TESTE =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Criar empresa
    console.log('2️⃣ Criando empresa de teste...');
    const companyData = {
      name: 'Empresa Teste Ltda',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123 - São Paulo/SP',
      active: true
    };

    try {
      const createResponse = await axios.post(`${API_BASE_URL}/companies`, companyData, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      console.log('✅ Empresa criada com sucesso');
      console.log(`   ID: ${createResponse.data.id}`);
      console.log(`   Nome: ${createResponse.data.name}`);
      console.log(`   CNPJ: ${createResponse.data.cnpj}\n`);

    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Empresa já existe, continuando...\n');
      } else {
        throw error;
      }
    }

    // 3. Listar empresas para verificar
    console.log('3️⃣ Listando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Empresas encontradas:', companiesResponse.data.length);
    companiesResponse.data.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name} (${company.cnpj})`);
    });

    console.log('\n🎉 ===== EMPRESA DE TESTE CRIADA COM SUCESSO =====');

  } catch (error) {
    console.error('❌ Erro ao criar empresa de teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar a criação
createTestCompany();
