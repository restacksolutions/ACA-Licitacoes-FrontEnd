const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para verificar as empresas do usuário
async function checkUserCompanies() {
  console.log('🏢 ===== VERIFICANDO EMPRESAS DO USUÁRIO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token, user_id, email } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');
    console.log(`User ID: ${user_id}`);
    console.log(`Email: ${email}\n`);

    // 2. Buscar empresas
    console.log('2️⃣ Buscando empresas...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Empresas encontradas:', companiesResponse.data.length);
    console.log('Dados brutos:', JSON.stringify(companiesResponse.data, null, 2));
    console.log('');

    if (companiesResponse.data.length > 0) {
      console.log('3️⃣ Analisando empresas...');
      companiesResponse.data.forEach((companyData, index) => {
        console.log(`\n--- Empresa ${index + 1} ---`);
        console.log('Role:', companyData.role);
        
        if (companyData.company) {
          const company = companyData.company;
          console.log('ID da empresa:', company.id);
          console.log('Nome:', company.name);
          console.log('Criado por:', company.createdById);
          console.log('Usuário atual:', user_id);
          console.log('Pertence ao usuário?', company.createdById === user_id);
        }
      });
    } else {
      console.log('⚠️  Nenhuma empresa encontrada');
      console.log('Isso explica por que não conseguimos atualizar - não há empresas para o usuário atual');
    }

    console.log('\n🎉 ===== VERIFICAÇÃO CONCLUÍDA =====');

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    }
  }
}

// Executar a verificação
checkUserCompanies();
