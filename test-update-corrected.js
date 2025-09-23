const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar atualização com a correção
async function testUpdateCorrected() {
  console.log('🏢 ===== TESTANDO ATUALIZAÇÃO CORRIGIDA =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token, user_id } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');
    console.log(`User ID: ${user_id}\n`);

    // 2. Buscar empresas do usuário
    console.log('2️⃣ Buscando empresas do usuário...');
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Empresas encontradas:', companiesResponse.data.length);
    console.log('Dados:', JSON.stringify(companiesResponse.data, null, 2));
    console.log('');

    if (companiesResponse.data.length > 0) {
      const companyData = companiesResponse.data[0];
      const company = companyData.company || companyData;
      const companyId = company.id;
      
      console.log('3️⃣ Testando atualização com ID:', companyId);
      
      // Dados para atualização SEM companyId no body
      const updateData = {
        name: 'Empresa Atualizada Teste',
        phone: '(11) 99999-9999',
        address: 'Rua Teste, 123 - São Paulo/SP'
        // NÃO incluir companyId aqui
      };

      console.log('Dados para atualização (SEM companyId no body):', updateData);
      console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId}`);
      console.log('');

      try {
        const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Empresa atualizada com sucesso!');
        console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

      } catch (updateError) {
        console.error('❌ Erro na atualização:');
        console.error('Status:', updateError.response?.status);
        console.error('Dados:', updateError.response?.data);
        
        if (updateError.response?.status === 400) {
          console.log('\n🔍 Análise do erro 400:');
          if (updateError.response?.data?.message?.includes('companyId should not exist')) {
            console.log('✅ O erro foi corrigido! O backend agora reconhece o companyId da URL');
            console.log('⚠️  Mas ainda há um problema de validação no DTO');
          } else {
            console.log('O CompanyGuard ainda não está reconhecendo o companyId da URL');
          }
        } else if (updateError.response?.status === 403) {
          console.log('\n🔍 Análise do erro 403:');
          console.log('O usuário não tem permissão para atualizar esta empresa');
        }
      }
    } else {
      console.log('⚠️  Nenhuma empresa encontrada para o usuário');
      console.log('Para testar, você precisa criar uma empresa primeiro');
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
testUpdateCorrected();
