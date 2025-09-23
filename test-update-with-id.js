const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar atualização com ID específico
async function testUpdateWithId() {
  console.log('🏢 ===== TESTANDO ATUALIZAÇÃO COM ID ESPECÍFICO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Usar o ID que você mencionou que está vindo no network
    const companyId = '38cb9c40-ae23-4a12-ba60-ec216c6d4905';
    console.log('2️⃣ Testando atualização com ID:', companyId);

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
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Empresa atualizada com sucesso');
      console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

    } catch (updateError) {
      console.error('❌ Erro na atualização:');
      console.error('Status:', updateError.response?.status);
      console.error('Dados:', updateError.response?.data);
      console.error('Headers:', updateError.response?.headers);
      
      if (updateError.response?.status === 400) {
        console.log('\n🔍 Análise do erro 400:');
        console.log('O erro "companyId ausente" pode indicar que:');
        console.log('1. O backend não está encontrando o companyId na URL');
        console.log('2. O endpoint espera o companyId no body da requisição');
        console.log('3. O endpoint tem validação específica para o companyId');
      }
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
testUpdateWithId();
