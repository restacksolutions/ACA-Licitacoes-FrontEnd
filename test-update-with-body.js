const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar atualização com companyId no body
async function testUpdateWithBody() {
  console.log('🏢 ===== TESTANDO ATUALIZAÇÃO COM COMPANYID NO BODY =====\n');

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
      address: 'Rua Teste, 123 - São Paulo/SP',
      companyId: companyId  // Incluir companyId no body
    };

    console.log('Dados para atualização (com companyId no body):', updateData);
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
      
      if (updateError.response?.status === 400) {
        console.log('\n🔍 Análise do erro 400:');
        console.log('O erro ainda persiste. Vamos tentar outras abordagens...');
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
testUpdateWithBody();
