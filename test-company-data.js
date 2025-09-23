const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar se os dados da empresa estão sendo exibidos
async function testCompanyData() {
  console.log('🏢 ===== TESTANDO DADOS DA EMPRESA =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Buscar empresas
    console.log('2️⃣ Buscando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Dados brutos recebidos:');
    console.log(JSON.stringify(companiesResponse.data, null, 2));
    console.log('');

    // 3. Simular o processamento do CompanyService
    console.log('3️⃣ Simulando processamento do CompanyService...');
    if (companiesResponse.data.length > 0) {
      const companyData = companiesResponse.data[0];
      console.log('Primeiro item:', companyData);
      
      const company = companyData.company || companyData;
      console.log('Empresa extraída:', company);
      
      const companyInfo = {
        id: company.id,
        name: company.name,
        cnpj: company.cnpj || '',
        legal_name: company.name,
        state_registration: '',
        municipal_registration: '',
        phone: company.phone || '',
        address: company.address || '',
        email: '',
        logo_path: company.logoPath || '',
        letterhead_path: company.letterheadPath || '',
        active: company.active,
        created_by: company.createdById || '',
        created_at: company.createdAt
      };
      
      console.log('✅ Informações da empresa processadas:');
      console.log(JSON.stringify(companyInfo, null, 2));
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

// Executar o teste
testCompanyData();
