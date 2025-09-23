const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Função para testar atualização com dados mock
async function testUpdateMock() {
  console.log('🏢 ===== TESTANDO ATUALIZAÇÃO COM DADOS MOCK =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso\n');

    // 2. Usar um ID mock para testar
    const mockCompanyId = '38cb9c40-ae23-4a12-ba60-ec216c6d4905';
    console.log('2️⃣ Testando atualização com ID mock:', mockCompanyId);
    
    // Dados para atualização SEM companyId no body
    const updateData = {
      name: 'Empresa Atualizada Teste',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123 - São Paulo/SP'
      // NÃO incluir companyId aqui
    };

    console.log('Dados para atualização (SEM companyId no body):', updateData);
    console.log('URL da requisição:', `${API_BASE_URL}/companies/${mockCompanyId}`);
    console.log('');

    try {
      const updateResponse = await axios.patch(`${API_BASE_URL}/companies/${mockCompanyId}`, updateData, {
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
          console.log('❌ Ainda está enviando companyId no body');
        } else if (updateError.response?.data?.message?.includes('companyId ausente')) {
          console.log('❌ O CompanyGuard ainda não está reconhecendo o companyId da URL');
        } else {
          console.log('Outro erro de validação:', updateError.response?.data?.message);
        }
      } else if (updateError.response?.status === 403) {
        console.log('\n🔍 Análise do erro 403:');
        console.log('✅ O CompanyGuard está funcionando! O usuário não tem permissão para esta empresa');
        console.log('Isso significa que o companyId da URL está sendo reconhecido corretamente');
      } else if (updateError.response?.status === 404) {
        console.log('\n🔍 Análise do erro 404:');
        console.log('A empresa não existe, mas o companyId foi reconhecido');
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
testUpdateMock();
