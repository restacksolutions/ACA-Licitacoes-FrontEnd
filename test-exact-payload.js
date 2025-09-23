const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Testar com exatamente os dados que o usuário mostrou
async function testExactPayload() {
  console.log('🔍 ===== TESTANDO COM PAYLOAD EXATO =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');

    // 2. Usar exatamente os dados que o usuário mostrou
    const companyId = '38cb9c40-ae23-4a12-ba60-ec216c6d4905';
    const updateData = {
      name: 'RESTACK',
      phone: '41992021603',
      address: 'Rua Professor Pedro Viriato Parigot de Souza',
      logoPath: null,
      letterheadPath: null,
      active: true
    };

    console.log('\n2️⃣ Testando atualização com dados exatos...');
    console.log('Company ID:', companyId);
    console.log('Dados para atualização:', updateData);
    console.log('URL da requisição:', `${API_BASE_URL}/companies/${companyId}`);

    try {
      const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Empresa atualizada com sucesso!');
      console.log('Status:', updateResponse.status);
      console.log('Resposta:', JSON.stringify(updateResponse.data, null, 2));

    } catch (updateError) {
      console.error('❌ Erro na atualização:');
      console.error('Status:', updateError.response?.status);
      console.error('Dados:', updateError.response?.data);
      
      if (updateError.response?.status === 403) {
        console.log('\n🔍 Análise do erro 403:');
        console.log('O usuário não tem permissão para atualizar esta empresa');
        console.log('Isso indica que o CompanyGuard está funcionando, mas o usuário não tem vínculo com a empresa');
      } else if (updateError.response?.status === 404) {
        console.log('\n🔍 Análise do erro 404:');
        console.log('A empresa não foi encontrada');
      } else if (updateError.response?.status === 500) {
        console.log('\n🔍 Análise do erro 500:');
        console.log('Erro interno do servidor');
        console.log('Verifique os logs do backend para mais detalhes');
      }
    }

    // 3. Testar também com dados sem null
    console.log('\n3️⃣ Testando com dados sem null...');
    const updateDataWithoutNull = {
      name: 'RESTACK',
      phone: '41992021603',
      address: 'Rua Professor Pedro Viriato Parigot de Souza',
      logoPath: '',
      letterheadPath: '',
      active: true
    };

    console.log('Dados sem null:', updateDataWithoutNull);

    try {
      const updateResponse2 = await axios.patch(`${API_BASE_URL}/companies/${companyId}`, updateDataWithoutNull, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Empresa atualizada com sucesso (sem null)!');
      console.log('Status:', updateResponse2.status);
      console.log('Resposta:', JSON.stringify(updateResponse2.data, null, 2));

    } catch (updateError2) {
      console.error('❌ Erro na atualização (sem null):');
      console.error('Status:', updateError2.response?.status);
      console.error('Dados:', updateError2.response?.data);
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
testExactPayload();
