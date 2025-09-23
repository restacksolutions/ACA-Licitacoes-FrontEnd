const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/v1';

// Testar com empresa real
async function testRealCompanyUpdate() {
  console.log('🏢 ===== TESTANDO ATUALIZAÇÃO COM EMPRESA REAL =====\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const { access_token } = loginResponse.data;
    console.log('✅ Login realizado com sucesso');

    // 2. Usar o ID real que você mencionou
    const companyId = '38cb9c40-ae23-4a12-ba60-ec216c6d4905';
    console.log('Company ID:', companyId);

    // 3. Dados exatos que você mostrou
    const updateData = {
      name: 'RESTACK',
      phone: '41992021603',
      address: 'Rua Professor Pedro Viriato Parigot de Souza',
      logoPath: '',
      letterheadPath: '',
      active: true
    };

    console.log('\n2️⃣ Dados para atualização:');
    console.log(JSON.stringify(updateData, null, 2));

    // 4. Fazer requisição de atualização
    console.log('\n3️⃣ Fazendo requisição de atualização...');
    console.log('URL:', `${API_BASE_URL}/companies/${companyId}`);
    
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

      // 5. Verificar se a atualização foi persistida
      console.log('\n4️⃣ Verificando se a atualização foi persistida...');
      const verifyResponse = await axios.get(`${API_BASE_URL}/companies`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      console.log('Empresas após atualização:', verifyResponse.data.length);
      if (verifyResponse.data.length > 0) {
        const updatedCompany = verifyResponse.data[0].company || verifyResponse.data[0];
        console.log('Dados da empresa após atualização:', updatedCompany);
        
        // Verificar se os dados foram realmente atualizados
        console.log('\n5️⃣ Verificando se os dados foram realmente atualizados...');
        console.log('Nome atualizado:', updatedCompany.name === updateData.name ? '✅' : '❌');
        console.log('Telefone atualizado:', updatedCompany.phone === updateData.phone ? '✅' : '❌');
        console.log('Endereço atualizado:', updatedCompany.address === updateData.address ? '✅' : '❌');
      }

    } catch (updateError) {
      console.error('❌ Erro na atualização:');
      console.error('Status:', updateError.response?.status);
      console.error('Dados:', updateError.response?.data);
      
      if (updateError.response?.status === 403) {
        console.log('\n🔍 Análise do erro 403:');
        console.log('O usuário não tem permissão para atualizar esta empresa');
        console.log('Isso indica que o CompanyGuard está funcionando, mas o usuário não tem vínculo com a empresa');
        console.log('Para resolver:');
        console.log('1. Verificar se o usuário tem uma membership com esta empresa');
        console.log('2. Ou usar um usuário que tem permissão para esta empresa');
      } else if (updateError.response?.status === 404) {
        console.log('\n🔍 Análise do erro 404:');
        console.log('A empresa não foi encontrada');
      } else if (updateError.response?.status === 500) {
        console.log('\n🔍 Análise do erro 500:');
        console.log('Erro interno do servidor');
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
testRealCompanyUpdate();
