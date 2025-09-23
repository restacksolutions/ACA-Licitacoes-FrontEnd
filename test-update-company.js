const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar a atualização da empresa
async function testUpdateCompany() {
  console.log('🏢 ===== TESTANDO ATUALIZAÇÃO DA EMPRESA =====\n');

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

    console.log('✅ Empresas encontradas:', companiesResponse.data.length);
    console.log('Dados brutos:', JSON.stringify(companiesResponse.data, null, 2));
    console.log('');

    if (companiesResponse.data.length > 0) {
      // 3. Simular o processamento do CompanyService
      console.log('3️⃣ Simulando processamento do CompanyService...');
      const companyData = companiesResponse.data[0];
      console.log('CompanyData completo:', companyData);
      
      const company = companyData.company || companyData;
      console.log('Company extraída:', company);
      
      const companyId = company.id;
      console.log('ID da empresa extraído:', companyId);
      console.log('Tipo do ID:', typeof companyId);
      console.log('');

      if (companyId) {
        // 4. Testar atualização
        console.log('4️⃣ Testando atualização...');
        const updateData = {
          name: 'Empresa Atualizada Teste',
          phone: '(11) 99999-9999',
          address: 'Rua Teste, 123 - São Paulo/SP'
        };

        console.log('Dados para atualização:', updateData);
        console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId}`);
        console.log('');

        try {
          const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });

          console.log('✅ Empresa atualizada com sucesso');
          console.log('Resposta:', updateResponse.data);

        } catch (updateError) {
          console.error('❌ Erro na atualização:', updateError.response?.data);
          console.error('Status:', updateError.response?.status);
          console.error('Headers:', updateError.response?.headers);
        }
      } else {
        console.error('❌ ID da empresa não encontrado');
      }
    } else {
      console.log('⚠️  Nenhuma empresa encontrada');
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
testUpdateCompany();
